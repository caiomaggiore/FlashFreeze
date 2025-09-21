/**
 * GameMechanics - Lógica central do jogo, regras e gerenciamento de estado
 */
class GameMechanics {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.gameState = 'PLAYING'; // PLAYING, PAUSED, GAME_OVER, VICTORY
        this.level = 1;
        
        // Game stats
        this.playerLives = 3;
        this.enemyLives = 3;
        this.score = 0;
        
        this.init();
    }

    init() {
        console.log('GameMechanics inicializado');
        this.setupLevel();
    }

    setupLevel() {
        console.log(`Configurando nível ${this.level}`);
        
        // Clear existing entities
        this.clearLevel();
        
        // Create player characters
        this.createPlayerTeam();
        
        // Create enemy characters
        this.createEnemyTeam();
        
        // Create barriers
        this.createBarriers();
        
        console.log('Nível configurado com sucesso');
    }

    clearLevel() {
        // Remove all characters
        this.gameEngine.characters = [];
        this.gameEngine.snowballs = [];
        this.gameEngine.barriers = [];
        
        // Clear scene (keep ground and lights)
        const objectsToRemove = [];
        this.gameEngine.scene.traverse((child) => {
            if (child.isMesh && child !== this.gameEngine.scene.children.find(c => c.isGround)) {
                objectsToRemove.push(child);
            }
        });
        
        objectsToRemove.forEach(obj => {
            this.gameEngine.scene.remove(obj);
        });
    }

    createPlayerTeam() {
        // Create 3 player characters in green (SOUTH side - positive Z)
        const playerPositions = [
            { x: -3, z: 15 },   // Player 1 (left)
            { x: 0, z: 15 },    // Player 2 (center)
            { x: 3, z: 15 }     // Player 3 (right)
        ];

        playerPositions.forEach((pos, index) => {
            const character = new Character(pos.x, pos.z, 'player');
            this.gameEngine.addCharacter(character);
        });

        console.log(`Criados ${playerPositions.length} personagens do jogador (SOUTH - Z+)`);
    }

    createEnemyTeam() {
        // Create enemy characters (NORTH side - negative Z)
        const enemyCount = 3;
        const enemyPositions = [
            { x: -3, z: -15 },  // Enemy 1 (left)
            { x: 0, z: -15 },   // Enemy 2 (center)  
            { x: 3, z: -15 }    // Enemy 3 (right)
        ];

        enemyPositions.forEach((pos, index) => {
            const character = new Character(pos.x, pos.z, 'enemy');
            this.gameEngine.addCharacter(character);
        });

        console.log(`Criados ${enemyCount} personagens inimigos (NORTH - Z-)`);
    }

    createBarriers() {
        // Create barriers in the MIDDLE area between teams
        const barrierPositions = [
            { x: -8, z: 0 },    // Left center
            { x: 8, z: 0 },     // Right center
            { x: 0, z: 3 },     // Center south
            { x: 0, z: -3 },    // Center north
            { x: -4, z: 6 },    // Player side left
            { x: 4, z: 6 },     // Player side right
            { x: -4, z: -6 },   // Enemy side left
            { x: 4, z: -6 }     // Enemy side right
        ];

        barrierPositions.forEach(pos => {
            const barrier = new Barrier(pos.x, pos.z);
            this.gameEngine.addBarrier(barrier);
        });

        console.log(`Criadas ${barrierPositions.length} barreiras no meio do campo`);
    }

    update(deltaTime) {
        if (this.gameState !== 'PLAYING') return;

        // Check win/lose conditions
        this.checkGameConditions();
        
        // Update game stats
        this.updateStats();
    }

    checkGameConditions() {
        const alivePlayers = this.gameEngine.getPlayerCharacters().filter(char => char.isAlive);
        const aliveEnemies = this.gameEngine.getEnemyCharacters().filter(char => char.isAlive);

        // Check if player lost
        if (alivePlayers.length === 0) {
            this.gameOver(false);
            return;
        }

        // Check if player won
        if (aliveEnemies.length === 0) {
            this.levelComplete();
            return;
        }
    }

    updateStats() {
        // Update UI stats here if needed
        this.playerLives = this.gameEngine.getPlayerCharacters().filter(char => char.isAlive).length;
        this.enemyLives = this.gameEngine.getEnemyCharacters().filter(char => char.isAlive).length;
    }

    levelComplete() {
        console.log(`Nível ${this.level} completo!`);
        this.score += 100 * this.level;
        
        // End game with victory - no more levels
        setTimeout(() => {
            this.gameOver(true);
        }, 1000);
    }

    gameOver(victory = false) {
        this.gameState = victory ? 'VICTORY' : 'GAME_OVER';
        console.log(victory ? 'Vitória!' : 'Game Over!');
        
        // Show game over screen
        this.showGameOverScreen(victory);
    }

    showGameOverScreen(victory) {
        // Simple game over display
        const gameOverDiv = document.createElement('div');
        gameOverDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            z-index: 1000;
            font-size: 24px;
        `;
        
        gameOverDiv.innerHTML = `
            <h2>${victory ? '🎉 VITÓRIA! 🎉' : '💀 VOCÊ PERDEU! 💀'}</h2>
            <p style="font-size: 18px; margin: 15px 0;">
                ${victory ? 'Parabéns! Você derrotou todos os inimigos!' : 'Todos os seus soldados foram derrotados!'}
            </p>
            <p>Pontuação Final: ${this.score}</p>
            <p>Nível: ${this.level}</p>
            <button onclick="location.reload()" style="
                padding: 12px 25px;
                background: ${victory ? '#27ae60' : '#e74c3c'};
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                margin-top: 15px;
                font-size: 16px;
                font-weight: bold;
            ">🔄 Jogar Novamente</button>
        `;
        
        document.body.appendChild(gameOverDiv);
    }

    pauseGame() {
        if (this.gameState === 'PLAYING') {
            this.gameState = 'PAUSED';
            this.gameEngine.stop();
        }
    }

    resumeGame() {
        if (this.gameState === 'PAUSED') {
            this.gameState = 'PLAYING';
            this.gameEngine.start();
        }
    }

    restartGame() {
        this.gameState = 'PLAYING';
        this.level = 1;
        this.score = 0;
        this.setupLevel();
    }

    // Utility methods for AI and other systems
    getGameState() {
        return {
            state: this.gameState,
            level: this.level,
            score: this.score,
            playerLives: this.playerLives,
            enemyLives: this.enemyLives
        };
    }

    getStrategicPositions() {
        // Return good positions for AI to move to
        const barriers = this.gameEngine.barriers;
        const positions = [];
        
        barriers.forEach(barrier => {
            // Add positions behind barriers (relative to enemy base)
            positions.push({
                x: barrier.position.x,
                z: barrier.position.z + 2, // Behind barrier
                type: 'cover'
            });
        });
        
        return positions;
    }

    // Check if position provides cover from enemies
    isPositionSafe(x, z, team) {
        const enemies = team === 'player' ? 
            this.gameEngine.getEnemyCharacters() : 
            this.gameEngine.getPlayerCharacters();
            
        const barriers = this.gameEngine.barriers;
        
        // Check if any barrier provides protection from most enemies
        let protectedFromCount = 0;
        
        enemies.forEach(enemy => {
            if (!enemy.isAlive) return;
            
            barriers.forEach(barrier => {
                if (barrier.providesProtection({ x, z }, enemy.position)) {
                    protectedFromCount++;
                }
            });
        });
        
        return protectedFromCount > enemies.length * 0.6; // Protected from 60% of enemies
    }
}
