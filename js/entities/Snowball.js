/**
 * Snowball - Projétil de bola de neve
 * Física realística com gravidade, arco parabólico e detecção de colisão
 */
class Snowball {
    constructor(startX, startZ, direction, forcePower, team) {
        this.team = team;
        this.startPosition = { x: startX, y: 1.4, z: startZ }; // From head level of character at Y=0 (0 + 1.4)
        this.direction = this.normalizeDirection(direction);
        this.forcePower = Math.max(0.1, Math.min(1.0, forcePower)); // Clamp between 0.1 and 1.0
        
        // Physics properties
        this.velocity = this.calculateInitialVelocity();
        this.lifetime = 0;
        this.maxLifetime = 10; // Remove after 10 seconds
        this.hasHitTarget = false;
        
        // Visual and physics
        this.mesh = null;
        this.body = null;
        
        this.init();
    }

    init() {
        this.createMesh();
        this.createPhysicsBody();
    }

    normalizeDirection(dir) {
        const length = Math.sqrt(dir.x * dir.x + dir.z * dir.z);
        if (length === 0) return { x: 0, z: -1 }; // Default forward
        return { x: dir.x / length, z: dir.z / length };
    }

    calculateInitialVelocity() {
        // Base velocity based on force power (reduced minimum force)
        const baseSpeed = 4 + (this.forcePower * 10); // 4-14 units/second (lower minimum)
        const baseHeight = 1 + (this.forcePower * 6);  // 1-7 units height (lower minimum)
        
        return {
            x: this.direction.x * baseSpeed,
            y: baseHeight, // Initial upward velocity
            z: this.direction.z * baseSpeed
        };
    }

    createMesh() {
        // Snowball visual
        const geometry = new THREE.SphereGeometry(0.15, 8, 6);
        const material = new THREE.MeshLambertMaterial({ 
            color: 0xadd8e6, // Light blue - more blue than white
            transparent: true,
            opacity: 0.9
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(
            this.startPosition.x, 
            this.startPosition.y, 
            this.startPosition.z
        );
        this.mesh.castShadow = true;
        
        // Add sparkle effect
        this.addSparkleEffect();
    }

    addSparkleEffect() {
        // Simple sparkle particles around snowball
        const sparkleGeometry = new THREE.BufferGeometry();
        const sparkleCount = 20;
        const positions = new Float32Array(sparkleCount * 3);
        
        for (let i = 0; i < sparkleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 0.6;     // x
            positions[i3 + 1] = (Math.random() - 0.5) * 0.6; // y
            positions[i3 + 2] = (Math.random() - 0.5) * 0.6; // z
        }
        
        sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const sparkleMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.02,
            transparent: true,
            opacity: 0.6
        });
        
        const sparkles = new THREE.Points(sparkleGeometry, sparkleMaterial);
        this.mesh.add(sparkles);
    }

    createPhysicsBody() {
        const { Sphere, Body, Material } = window.CannonClasses || {};
        if (!Sphere || !Body || !Material) {
            console.error('Cannon.js classes not available');
            return;
        }
        
        const shape = new Sphere(0.15);
        this.body = new Body({ 
            mass: 0.1, // Light mass
            shape: shape,
            material: new Material('snowball')
        });
        
        this.body.position.set(
            this.startPosition.x, 
            this.startPosition.y, 
            this.startPosition.z
        );
        
        // Set initial velocity
        this.body.velocity.set(
            this.velocity.x,
            this.velocity.y,
            this.velocity.z
        );
        
        // Add collision detection
        this.body.addEventListener('collide', (event) => {
            this.onCollision(event);
        });
    }

    update(deltaTime) {
        this.lifetime += deltaTime;
        
        // Sync visual with physics
        this.mesh.position.copy(this.body.position);
        
        // Add rotation for visual effect
        this.mesh.rotation.x += deltaTime * 10;
        this.mesh.rotation.z += deltaTime * 8;
        
        // Fade out over time
        const fadeStart = this.maxLifetime * 0.8;
        if (this.lifetime > fadeStart) {
            const fadeProgress = (this.lifetime - fadeStart) / (this.maxLifetime - fadeStart);
            this.mesh.material.opacity = 0.9 * (1 - fadeProgress);
        }
        
        // Check for hits with characters
        this.checkCharacterCollisions();
    }

    checkCharacterCollisions() {
        if (this.hasHitTarget || !window.gameEngine) return;
        
        const characters = window.gameEngine.characters;
        const snowballPos = this.body.position;
        
        for (const character of characters) {
            if (character.team === this.team || !character.isAlive) continue;
            
            const charPos = character.body.position;
            const distance = snowballPos.distanceTo(charPos);
            
            if (distance < 1.0) { // Hit radius
                this.hitCharacter(character);
                break;
            }
        }
    }

    onCollision(event) {
        const contact = event.contact;
        const other = event.target === this.body ? event.body : event.target;
        
        // Check if hit ground
        if (other.material && other.material.name === 'ground') {
            this.hitGround();
        }
        
        // Check if hit barrier
        if (other.material && other.material.name === 'barrier') {
            this.hitBarrier();
        }
    }

    hitCharacter(character) {
        if (this.hasHitTarget) return;
        
        this.hasHitTarget = true;
        character.takeDamage(30); // Reduced damage so characters survive more hits
        
        console.log(`Snowball ${this.team} acertou character ${character.team}!`);
        
        // Create impact effect
        this.createImpactEffect();
        
        // Mark for removal
        this.lifetime = this.maxLifetime;
    }

    hitGround() {
        if (this.hasHitTarget) return;
        
        // Only log player snowball hits for feedback
        if (this.team === 'player') {
            console.log('Sua bola de neve atingiu o chão');
        }
        
        // Create splash effect and mark for immediate removal
        this.createSplashEffect();
        this.createImpactMark('ground');
        this.hasHitTarget = true; // Prevent further bouncing
        this.lifetime = this.maxLifetime; // Mark for immediate removal
        
        // Stop the snowball immediately
        if (this.body) {
            this.body.velocity.set(0, 0, 0);
        }
    }

    hitBarrier() {
        console.log('Snowball atingiu uma barreira');
        this.createImpactEffect();
        this.createImpactMark('barrier');
        this.lifetime = this.maxLifetime; // Mark for removal
    }

    createImpactEffect() {
        // Simple white particle explosion
        const particleCount = 15;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.02),
                new THREE.MeshBasicMaterial({ 
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.8
                })
            );
            
            particle.position.copy(this.mesh.position);
            
            // Random velocity
            const velocity = {
                x: (Math.random() - 0.5) * 10,
                y: Math.random() * 8,
                z: (Math.random() - 0.5) * 10
            };
            
            particles.push({ mesh: particle, velocity });
            
            if (window.gameEngine) {
                window.gameEngine.scene.add(particle);
            }
        }
        
        // Animate particles
        const animateParticles = () => {
            particles.forEach((particle, index) => {
                particle.mesh.position.x += particle.velocity.x * 0.016;
                particle.mesh.position.y += particle.velocity.y * 0.016;
                particle.mesh.position.z += particle.velocity.z * 0.016;
                
                particle.velocity.y -= 9.82 * 0.016; // Gravity
                particle.mesh.material.opacity -= 0.02;
                
                if (particle.mesh.material.opacity <= 0) {
                    if (window.gameEngine) {
                        window.gameEngine.scene.remove(particle.mesh);
                    }
                    particles.splice(index, 1);
                }
            });
            
            if (particles.length > 0) {
                requestAnimationFrame(animateParticles);
            }
        };
        
        animateParticles();
    }

    createSplashEffect() {
        // Enhanced splash effect - snowball splattering
        const particleCount = 20;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.02 + Math.random() * 0.03),
                new THREE.MeshBasicMaterial({ 
                    color: 0xadd8e6, // Same light blue as snowballs
                    transparent: true,
                    opacity: 0.9
                })
            );
            
            particle.position.copy(this.mesh.position);
            
            // Random velocity for splattering effect (reduced spread)
            const velocity = {
                x: (Math.random() - 0.5) * 4, // Reduced from 8 to 4
                y: Math.random() * 2,         // Reduced from 3 to 2
                z: (Math.random() - 0.5) * 4  // Reduced from 8 to 4
            };
            
            particles.push({ mesh: particle, velocity, life: 8.0 }); // Extended life for longer trail
            
            if (window.gameEngine) {
                window.gameEngine.scene.add(particle);
            }
        }
        
        // Animate particles
        const animateParticles = () => {
            for (let i = particles.length - 1; i >= 0; i--) {
                const particle = particles[i];
                
                // Update position
                particle.mesh.position.x += particle.velocity.x * 0.016;
                particle.mesh.position.y += particle.velocity.y * 0.016;
                particle.mesh.position.z += particle.velocity.z * 0.016;
                
                // Apply gravity
                particle.velocity.y -= 9.82 * 0.016;
                
                // Reduce life and opacity more slowly
                particle.life -= 0.003; // Much slower fade for longer trail
                particle.mesh.material.opacity = Math.max(0, particle.life / 8.0); // Gradual fade based on max life
                particle.mesh.scale.multiplyScalar(0.998); // Very slow shrinking
                
                // Apply friction when on ground
                if (particle.mesh.position.y <= 0.05) {
                    particle.mesh.position.y = 0.05; // Keep slightly above ground
                    particle.velocity.x *= 0.95; // Friction
                    particle.velocity.z *= 0.95;
                    particle.velocity.y = 0; // Stop bouncing
                }
                
                // Remove when life is over
                if (particle.life <= 0) {
                    if (window.gameEngine) {
                        window.gameEngine.scene.remove(particle.mesh);
                    }
                    particles.splice(i, 1);
                }
            }
            
            if (particles.length > 0) {
                requestAnimationFrame(animateParticles);
            }
        };
        
        animateParticles();
    }

    createImpactMark(surface) {
        // Create circular impact mark
        const markGeometry = new THREE.RingGeometry(0.1, 0.3, 16);
        const markMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xadd8e6, // Same blue as snowball
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        const mark = new THREE.Mesh(markGeometry, markMaterial);
        mark.position.copy(this.mesh.position);
        mark.position.y = 0.01; // Just above ground
        mark.rotation.x = -Math.PI / 2; // Flat on ground
        
        if (window.gameEngine) {
            window.gameEngine.scene.add(mark);
            
            // Different duration based on surface
            const duration = surface === 'barrier' ? 15000 : 8000; // 15s for barrier, 8s for ground
            let opacity = 0.7;
            let time = 0;
            
            const animateMark = () => {
                time += 16; // ~16ms per frame
                const progress = time / duration;
                
                if (progress < 1) {
                    opacity = 0.7 * (1 - progress);
                    mark.material.opacity = opacity;
                    requestAnimationFrame(animateMark);
                } else {
                    window.gameEngine.scene.remove(mark);
                }
            };
            
            animateMark();
        }
    }

    shouldRemove() {
        return this.lifetime >= this.maxLifetime || 
               this.body.position.y < -10 || // Fell too far
               Math.abs(this.body.position.x) > 100 || // Too far horizontally
               Math.abs(this.body.position.z) > 100;
    }

    // Get trajectory info for AI prediction
    getTrajectoryPoint(time) {
        const pos = {
            x: this.startPosition.x + this.velocity.x * time,
            y: this.startPosition.y + this.velocity.y * time - 0.5 * 9.82 * time * time,
            z: this.startPosition.z + this.velocity.z * time
        };
        return pos;
    }

    getMaxRange() {
        // Calculate approximate max range based on initial velocity
        const timeToGround = (this.velocity.y + Math.sqrt(this.velocity.y * this.velocity.y + 2 * 9.82 * this.startPosition.y)) / 9.82;
        const horizontalDistance = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z) * timeToGround;
        return horizontalDistance;
    }
}
