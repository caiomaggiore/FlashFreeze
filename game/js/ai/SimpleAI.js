/**
 * SimpleAI - IA básica para controlar personagens inimigos
 * Comportamentos: Buscar cobertura, atacar, evitar projéteis
 */
class SimpleAI {
    constructor(gameEngine, gameMechanics) {
        this.gameEngine = gameEngine;
        this.gameMechanics = gameMechanics;
        this.updateInterval = 0.5; // Update every 500ms
        this.lastUpdate = 0;
    }

    update(deltaTime) {
        this.lastUpdate += deltaTime;
        
        if (this.lastUpdate >= this.updateInterval) {
            this.updateAI();
            this.lastUpdate = 0;
        }
    }

    updateAI() {
        const enemyCharacters = this.gameEngine.getEnemyCharacters();
        
        enemyCharacters.forEach(enemy => {
            if (!enemy.isAlive) return;
            
            this.updateCharacterAI(enemy);
        });
        
        // Also control inactive player characters
        this.updateInactivePlayerCharacters();
    }

    updateInactivePlayerCharacters() {
        if (!window.inputController) return;
        
        const playerCharacters = this.gameEngine.getPlayerCharacters();
        const activePlayerIndex = window.inputController.currentPlayerIndex;
        
        playerCharacters.forEach((player, index) => {
            if (!player.isAlive || index === activePlayerIndex) return;
            
            // Control inactive players with simple AI
            this.updateCharacterAI(player);
        });
    }

    updateCharacterAI(character) {
        switch (character.state) {
            case 'IDLE':
            case 'MOVING':
                this.decideNextAction(character);
                break;
                
            case 'MAKING_SNOWBALL':
                // Wait for snowball to be ready
                break;
                
            case 'READY_TO_THROW':
                this.decideThrowTarget(character);
                break;
                
            case 'CHARGING_THROW':
                // AI will auto-release at optimal power
                setTimeout(() => {
                    if (character.state === 'CHARGING_THROW') {
                        const power = Math.random() * 0.4 + 0.6; // 60-100% power
                        character.throwSnowball(power);
                    }
                }, 500 + Math.random() * 1000); // 0.5-1.5 seconds charge time
                break;
        }
    }

    decideNextAction(character) {
        const playerCharacters = this.gameEngine.getPlayerCharacters().filter(c => c.isAlive);
        if (playerCharacters.length === 0) return;

        // Decision priorities:
        // 1. Make snowball if don't have one
        // 2. Find cover if exposed
        // 3. Move to attack position
        // 4. Patrol/random movement

        if (!character.hasSnowball && character.canMakeSnowball()) {
            // 70% chance to make snowball if don't have one
            if (Math.random() < 0.7) {
                character.startMakingSnowball();
                return;
            }
        }

        // Check if in danger (enemy snowballs nearby)
        if (this.isInDanger(character)) {
            this.moveToSafety(character);
            return;
        }

        // Find good attack position
        if (character.hasSnowball) {
            this.moveToAttackPosition(character);
        } else {
            this.moveToStrategicPosition(character);
        }
    }

    decideThrowTarget(character) {
        const playerCharacters = this.gameEngine.getPlayerCharacters().filter(c => c.isAlive);
        if (playerCharacters.length === 0) return;

        // Find best target (closest, least protected)
        let bestTarget = null;
        let bestScore = -1;

        playerCharacters.forEach(player => {
            const distance = this.getDistance(character.position, player.position);
            const isProtected = this.isTargetProtected(character.position, player.position);
            
            // Scoring: closer is better, unprotected is much better
            let score = 100 - distance; // Base score from distance
            if (!isProtected) score += 50; // Bonus for unprotected target
            
            if (score > bestScore) {
                bestScore = score;
                bestTarget = player;
            }
        });

        if (bestTarget && bestScore > 30) { // Only shoot if reasonable chance
            // Aim at target (simplified - just face direction)
            const direction = this.getDirection(character.position, bestTarget.position);
            this.aimAt(character, direction);
            
            // Start charging throw
            character.startChargingThrow();
        }
    }

    isInDanger(character) {
        // Check for incoming snowballs
        const snowballs = this.gameEngine.snowballs.filter(s => s.team === 'player');
        
        for (const snowball of snowballs) {
            const distance = this.getDistance(character.position, snowball.body.position);
            if (distance < 5) { // Danger zone
                return true;
            }
        }
        
        return false;
    }

    moveToSafety(character) {
        // Find nearest cover
        const barriers = this.gameEngine.barriers;
        let bestCover = null;
        let bestDistance = Infinity;

        barriers.forEach(barrier => {
            const coverPos = this.getCoverPosition(barrier, character.position);
            const distance = this.getDistance(character.position, coverPos);
            
            if (distance < bestDistance) {
                bestDistance = distance;
                bestCover = coverPos;
            }
        });

        if (bestCover) {
            character.moveTo(bestCover.x, bestCover.z);
        } else {
            // No cover available, move randomly
            this.moveRandomly(character);
        }
    }

    moveToAttackPosition(character) {
        const playerCharacters = this.gameEngine.getPlayerCharacters().filter(c => c.isAlive);
        if (playerCharacters.length === 0) return;

        // Find closest player
        let closestPlayer = null;
        let closestDistance = Infinity;

        playerCharacters.forEach(player => {
            const distance = this.getDistance(character.position, player.position);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestPlayer = player;
            }
        });

        if (closestPlayer) {
            // Move to optimal attack range (not too close, not too far)
            const direction = this.getDirection(character.position, closestPlayer.position);
            const optimalDistance = 8 + Math.random() * 4; // 8-12 units away
            
            const targetX = closestPlayer.position.x - direction.x * optimalDistance;
            const targetZ = closestPlayer.position.z - direction.z * optimalDistance;
            
            character.moveTo(targetX, targetZ);
        }
    }

    moveToStrategicPosition(character) {
        const strategicPositions = this.gameMechanics.getStrategicPositions();
        
        if (strategicPositions.length > 0) {
            // Choose random strategic position
            const randomPos = strategicPositions[Math.floor(Math.random() * strategicPositions.length)];
            character.moveTo(randomPos.x, randomPos.z);
        } else {
            this.moveRandomly(character);
        }
    }

    moveRandomly(character) {
        // Random movement within bounds
        const randomX = character.position.x + (Math.random() - 0.5) * 6;
        const randomZ = character.position.z + (Math.random() - 0.5) * 6;
        
        // Keep within game bounds
        const boundedX = Math.max(-18, Math.min(18, randomX));
        const boundedZ = Math.max(-18, Math.min(18, randomZ));
        
        character.moveTo(boundedX, boundedZ);
    }

    getCoverPosition(barrier, characterPos) {
        // Get position behind barrier (away from most enemies)
        const playerCharacters = this.gameEngine.getPlayerCharacters().filter(c => c.isAlive);
        
        if (playerCharacters.length === 0) {
            return { x: barrier.position.x, z: barrier.position.z + 2 };
        }

        // Calculate average enemy position
        let avgX = 0, avgZ = 0;
        playerCharacters.forEach(player => {
            avgX += player.position.x;
            avgZ += player.position.z;
        });
        avgX /= playerCharacters.length;
        avgZ /= playerCharacters.length;

        // Position behind barrier from average enemy position
        const direction = this.getDirection({ x: avgX, z: avgZ }, barrier.position);
        const coverX = barrier.position.x + direction.x * 2;
        const coverZ = barrier.position.z + direction.z * 2;
        
        return { x: coverX, z: coverZ };
    }

    isTargetProtected(shooterPos, targetPos) {
        const barriers = this.gameEngine.barriers;
        
        for (const barrier of barriers) {
            if (barrier.providesProtection(targetPos, shooterPos)) {
                return true;
            }
        }
        
        return false;
    }

    aimAt(character, direction) {
        // Simple aiming - in a full implementation, this would affect throw direction
        // For now, we'll assume characters always throw towards their target
        character.throwDirection = direction;
    }

    // Utility functions
    getDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dz = pos1.z - pos2.z;
        return Math.sqrt(dx * dx + dz * dz);
    }

    getDirection(from, to) {
        const dx = to.x - from.x;
        const dz = to.z - from.z;
        const length = Math.sqrt(dx * dx + dz * dz);
        
        if (length === 0) return { x: 0, z: -1 };
        
        return { x: dx / length, z: dz / length };
    }

    // Difficulty scaling
    setDifficulty(level) {
        // Adjust AI parameters based on level
        this.updateInterval = Math.max(0.2, 0.8 - level * 0.1); // Faster reactions at higher levels
        
        // Could also adjust:
        // - Accuracy
        // - Reaction time
        // - Strategy complexity
        // - Aggression level
    }
}
