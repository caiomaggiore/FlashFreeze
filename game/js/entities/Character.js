/**
 * Character - Representa um personagem (soldado) no jogo
 * Estados: IDLE, MOVING, MAKING_SNOWBALL, READY_TO_THROW, CHARGING_THROW, THROWING
 */
class Character {
    constructor(x, z, team = 'player') {
        this.team = team; // 'player' or 'enemy'
        this.position = { x, z };
        this.health = 150; // Increased health to survive more hits
        this.isAlive = true;
        
        // States
        this.state = 'IDLE';
        this.previousState = 'IDLE';
        
        // Snowball mechanics
        this.hasSnowball = false;
        this.makingSnowballTime = 0;
        this.chargingThrowTime = 0;
        this.maxMakeTime = 3.0; // 3 seconds to make snowball
        this.maxChargeTime = 2.0; // 2 seconds to charge throw
        
        // Movement - Configurável via ConfigPanel
        this.walkSpeed = 2.0;        // Velocidade caminhada (unidades/segundo)
        this.runSpeed = 4.0;         // Velocidade corrida (unidades/segundo)
        this.walkStepSize = 0.5;     // Tamanho passo caminhada
        this.runStepSize = 1.0;      // Tamanho passo corrida
        this.moveSpeed = this.walkSpeed; // Velocidade atual (será alterada dinamicamente)
        this.targetPosition = { x, z };
        this.isMoving = false;
        
        // Visual and physics
        this.mesh = null;
        this.body = null;
        this.characterYOffset = 0; // Offset de altura configurável
        
        this.init();
    }

    init() {
        this.createMesh();
        this.createPhysicsBody();
    }

    createMesh() {
        // Create character group - positioned so base is at Y=0 of ruler
        this.mesh = new THREE.Group();
        this.mesh.position.set(this.position.x, 0, this.position.z); // Group at Y=0 (base of ruler)
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Try to load custom GLB model first, fallback to basic geometry
        this.loadCustomModel();
        
        // Store initial rotation for reference (show direction they're facing)
        this.initialRotation = this.team === 'player' ? Math.PI : 0; // Players face 180°, enemies face 0°
        
        // Add health bar
        this.createHealthBar();
        
        // Add snowball progress bar (initially hidden)
        this.createSnowballProgressBar();
    }

    loadCustomModel() {
        // Try to load Floco-Boy.glb for players
        if (this.team === 'player') {
            this.loadGLBModel('../assets/models/caracter/Floco-Boy.glb');
        } else {
            // Use basic geometry for enemies
            this.createBasicGeometry();
        }
    }

    loadGLBModel(modelPath) {
        console.log('🔄 Tentando carregar modelo GLB:', modelPath);
        
        // Por enquanto, vamos usar uma implementação simples
        // que cria um modelo personalizado baseado no Floco-Boy
        console.log('🎨 Criando modelo Floco-Boy personalizado...');
        this.createFlocoBoyModel();
    }

    createFlocoBoyModel() {
        // Criar grupo principal
        const flocoBoy = new THREE.Group();
        
        // Corpo principal (cilindro)
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1.2, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6;
        body.castShadow = true;
        body.receiveShadow = true;
        flocoBoy.add(body);
        
        // Cabeça (esfera)
        const headGeometry = new THREE.SphereGeometry(0.25, 8, 6);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.4;
        head.castShadow = true;
        head.receiveShadow = true;
        flocoBoy.add(head);
        
        // Olhos
        const eyeGeometry = new THREE.SphereGeometry(0.05, 4, 4);
        const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.1, 1.45, 0.2);
        flocoBoy.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.1, 1.45, 0.2);
        flocoBoy.add(rightEye);
        
        // Nariz (cone laranja)
        const noseGeometry = new THREE.ConeGeometry(0.05, 0.15, 4);
        const noseMaterial = new THREE.MeshLambertMaterial({ color: 0xff6600 });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 1.4, 0.25);
        nose.rotation.x = Math.PI;
        flocoBoy.add(nose);
        
        // Chapéu (cilindro preto)
        const hatGeometry = new THREE.CylinderGeometry(0.3, 0.35, 0.3, 8);
        const hatMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        const hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.y = 1.7;
        hat.castShadow = true;
        hat.receiveShadow = true;
        flocoBoy.add(hat);
        
        // Borda do chapéu
        const brimGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 8);
        const brimMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        const brim = new THREE.Mesh(brimGeometry, brimMaterial);
        brim.position.y = 1.55;
        brim.castShadow = true;
        brim.receiveShadow = true;
        flocoBoy.add(brim);
        
        // Botões no corpo
        const buttonGeometry = new THREE.SphereGeometry(0.03, 4, 4);
        const buttonMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        
        for (let i = 0; i < 3; i++) {
            const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
            button.position.set(0, 0.8 - i * 0.2, 0.35);
            flocoBoy.add(button);
        }
        
        // Adicionar ao mesh principal
        this.mesh.add(flocoBoy);
        this.model = flocoBoy;
        
        console.log('✅ Modelo Floco-Boy criado com sucesso!');
    }

    setupAnimations(gltf) {
        // Store animations for later use
        this.animations = gltf.animations || [];
        this.mixer = null;
        this.currentAnimation = null;
        
        if (this.animations.length > 0) {
            console.log('🎬 Animações encontradas:', this.animations.length);
            
            // Create animation mixer
            this.mixer = new THREE.AnimationMixer(this.model);
            
            // Store animation clips
            this.animationClips = {};
            this.animations.forEach((clip) => {
                this.animationClips[clip.name] = clip;
                console.log('📽️ Animação:', clip.name, '- Duração:', clip.duration.toFixed(2) + 's');
            });
            
            // Auto-play idle animation if available
            this.playAnimation('idle', true);
        } else {
            console.log('ℹ️ Nenhuma animação encontrada no modelo');
        }
    }

    playAnimation(animationName, loop = true) {
        if (!this.mixer || !this.animationClips[animationName]) {
            console.log('⚠️ Animação não encontrada:', animationName);
            return;
        }
        
        // Stop current animation
        if (this.currentAnimation) {
            this.currentAnimation.stop();
        }
        
        // Play new animation
        const clip = this.animationClips[animationName];
        this.currentAnimation = this.mixer.clipAction(clip);
        this.currentAnimation.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, 1);
        this.currentAnimation.play();
        
        console.log('🎭 Reproduzindo animação:', animationName, loop ? '(loop)' : '(uma vez)');
    }

    createBasicGeometry() {
        // Body (team color) - positioned so bottom of cylinder is at Y=0
        const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.5, 1.2, 8);
        const teamColor = this.team === 'player' ? 0x2ecc71 : 0xe74c3c; // Green for player, red for enemy
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: teamColor });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(0, 0.6, 0); // Half of body height (1.2/2) so bottom is at Y=0 (character base at Y=0)
        body.castShadow = true;
        this.mesh.add(body);
        
        // Head (beige) - positioned above body
        const headGeometry = new THREE.SphereGeometry(0.3, 8, 6);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 1.4, 0); // Above body (0.6 + 0.3 + 0.5)
        head.castShadow = true;
        this.mesh.add(head);
        
        // Hat (gray) - on top of head
        const hatGeometry = new THREE.CylinderGeometry(0.32, 0.32, 0.2, 8);
        const hatMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.set(0, 1.6, 0); // On top of head
        hat.castShadow = true;
        this.mesh.add(hat);
        
        // Eyes - positioned based on team direction
        const eyeGeometry = new THREE.SphereGeometry(0.05, 4, 4);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        
        if (this.team === 'enemy') {
            // Enemies face south - eyes at +Z
                leftEye.position.set(-0.1, 1.45, 0.25); // Adjusted for new head position
                rightEye.position.set(0.1, 1.45, 0.25);
        } else {
            // Players face north - eyes at -Z
                leftEye.position.set(-0.1, 1.45, -0.25);
                rightEye.position.set(0.1, 1.45, -0.25);
        }
        
        this.mesh.add(leftEye);
        this.mesh.add(rightEye);
        
        // Face direction indicator (nose) - positioned based on team
        const noseGeometry = new THREE.SphereGeometry(0.03, 4, 4);
        const noseMaterial = new THREE.MeshLambertMaterial({ color: 0xffb3a0 });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        
        // Position nose based on which direction character should face
        if (this.team === 'enemy') {
            // Enemies face south (towards players) - nose at +Z
                nose.position.set(0, 1.4, 0.28); // Adjusted for new head position
            this.mesh.rotation.y = 0; // 0 degrees
        } else {
            // Players face north (towards enemies) - nose at -Z
                nose.position.set(0, 1.4, -0.28);
            this.mesh.rotation.y = 0; // Keep at 0, but nose is positioned backwards
        }
        
        this.mesh.add(nose);
    }

    createPositionLabel() {
        // Create a simple text display using canvas texture
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const context = canvas.getContext('2d');
        
        // Text style
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#000000';
        context.font = '20px Arial';
        context.textAlign = 'center';
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.SpriteMaterial({ map: texture });
        this.positionLabel = new THREE.Sprite(labelMaterial);
        this.positionLabel.position.set(0, 3.5, 0); // Raised higher to be visible
        this.positionLabel.scale.set(2, 1, 1);
        
        this.mesh.add(this.positionLabel);
        
        // Update label with current info
        this.updatePositionLabel();
    }

    updatePositionLabel() {
        if (!this.positionLabel) return;
        
        const canvas = this.positionLabel.material.map.image;
        const context = canvas.getContext('2d');
        
        // Clear canvas
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw border
        context.strokeStyle = this.team === 'player' ? '#2ecc71' : '#e74c3c';
        context.lineWidth = 4;
        context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
        
        // Draw text
        context.fillStyle = '#000000';
        context.font = '16px Arial';
        context.textAlign = 'center';
        
        const x = this.position.x.toFixed(1);
        const z = this.position.z.toFixed(1);
        const rotation = (this.initialRotation * 180 / Math.PI).toFixed(0); // Use initial rotation, not current
        
        context.fillText(`X: ${x}, Z: ${z}`, canvas.width / 2, 35);
        context.fillText(`Rot: ${rotation}°`, canvas.width / 2, 60);
        context.fillText(`Team: ${this.team.toUpperCase()}`, canvas.width / 2, 85);
        
        // Update texture
        this.positionLabel.material.map.needsUpdate = true;
    }

    createHealthBar() {
        // Health bar using Sprite (always faces camera)
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 10;
        const context = canvas.getContext('2d');
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        this.healthBarFill = new THREE.Sprite(spriteMaterial);
        this.healthBarFill.position.set(0, 2.0, 0); // Above head (head at 1.4 + 0.3 + margin)
        this.healthBarFill.scale.set(1.0, 0.1, 1);
        this.mesh.add(this.healthBarFill);
        
        // Store canvas for updates
        this.healthBarCanvas = canvas;
        this.healthBarContext = context;
    }

    createSnowballProgressBar() {
        // Progress bar using Sprite (always faces camera)
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 8;
        const context = canvas.getContext('2d');
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        this.snowballBarFill = new THREE.Sprite(spriteMaterial);
        this.snowballBarFill.position.set(0, 1.8, 0); // Below health bar
        this.snowballBarFill.scale.set(1.0, 0.08, 1);
        this.snowballBarFill.visible = false;
        this.mesh.add(this.snowballBarFill);
        
        // Store canvas for updates
        this.snowballBarCanvas = canvas;
        this.snowballBarContext = context;
        
        // Throw power bar (same sprite, different content)
        const throwCanvas = document.createElement('canvas');
        throwCanvas.width = 100;
        throwCanvas.height = 8;
        const throwContext = throwCanvas.getContext('2d');
        
        const throwTexture = new THREE.CanvasTexture(throwCanvas);
        const throwSpriteMaterial = new THREE.SpriteMaterial({ map: throwTexture });
        this.throwBarFill = new THREE.Sprite(throwSpriteMaterial);
        this.throwBarFill.position.set(0, 1.8, 0); // Same position as snowball bar
        this.throwBarFill.scale.set(1.0, 0.08, 1);
        this.throwBarFill.visible = false;
        this.mesh.add(this.throwBarFill);
        
        // Store canvas for updates
        this.throwBarCanvas = throwCanvas;
        this.throwBarContext = throwContext;
    }


    updateHealthBar() {
        if (this.healthBarContext) {
            const healthPercent = Math.max(0, this.health / 150);
            const context = this.healthBarContext;
            const canvas = this.healthBarCanvas;
            
            // Clear canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw health bar
            const fillWidth = canvas.width * healthPercent;
            
            // Choose color based on health
            let color = '#00ff00'; // Green
            if (healthPercent <= 0.3) color = '#ff0000'; // Red
            else if (healthPercent <= 0.6) color = '#ffff00'; // Yellow
            
            context.fillStyle = color;
            context.fillRect(0, 0, fillWidth, canvas.height);
            
            // Update texture
            this.healthBarFill.material.map.needsUpdate = true;
        }
    }

    updateSnowballProgressBar() {
        // Hide all bars first
        if (this.snowballBarFill) this.snowballBarFill.visible = false;
        if (this.throwBarFill) this.throwBarFill.visible = false;
        
        if (this.state === 'MAKING_SNOWBALL') {
            // Show snowball making progress
            if (this.snowballBarFill && this.snowballBarContext) {
                this.snowballBarFill.visible = true;
                const progress = this.makingSnowballTime / this.maxMakeTime;
                
                const context = this.snowballBarContext;
                const canvas = this.snowballBarCanvas;
                
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.fillStyle = '#87ceeb'; // Light blue
                context.fillRect(0, 0, canvas.width * progress, canvas.height);
                
                this.snowballBarFill.material.map.needsUpdate = true;
            }
        } else if (this.state === 'CHARGING_THROW') {
            // Show throw power charging
            if (this.throwBarFill && this.throwBarContext) {
                this.throwBarFill.visible = true;
                const power = Math.min(this.chargingThrowTime / this.maxChargeTime, 1.0);
                
                const context = this.throwBarContext;
                const canvas = this.throwBarCanvas;
                
                context.clearRect(0, 0, canvas.width, canvas.height);
                
                // Gradient from yellow to red
                const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
                gradient.addColorStop(0, '#ffff00'); // Yellow
                gradient.addColorStop(0.5, '#ff8800'); // Orange
                gradient.addColorStop(1, '#ff0000'); // Red
                
                context.fillStyle = gradient;
                context.fillRect(0, 0, canvas.width * power, canvas.height);
                
                this.throwBarFill.material.map.needsUpdate = true;
            }
        }
    }

    updateReadyIndicator() {
        // Show indicator when ready to throw
        if (this.state === 'READY_TO_THROW') {
            if (!this.readyIndicator) {
                // Create ready indicator (blue snowball above head)
                const indicatorGeometry = new THREE.SphereGeometry(0.12, 8, 6);
                const indicatorMaterial = new THREE.MeshLambertMaterial({ 
                    color: 0x4dabf7, // Blue color
                    transparent: true,
                    opacity: 0.9
                });
                this.readyIndicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
                this.readyIndicator.position.set(0, 2.3, 0); // Above hat
                this.readyIndicator.castShadow = true;
                this.mesh.add(this.readyIndicator);
                
                // Add sparkle effect to the indicator
                const sparkleGeometry = new THREE.BufferGeometry();
                const sparkleCount = 10;
                const positions = new Float32Array(sparkleCount * 3);
                
                for (let i = 0; i < sparkleCount; i++) {
                    const i3 = i * 3;
                    positions[i3] = (Math.random() - 0.5) * 0.3;
                    positions[i3 + 1] = (Math.random() - 0.5) * 0.3;
                    positions[i3 + 2] = (Math.random() - 0.5) * 0.3;
                }
                
                sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                const sparkleMaterial = new THREE.PointsMaterial({
                    color: 0xffffff,
                    size: 0.02
                });
                const sparkles = new THREE.Points(sparkleGeometry, sparkleMaterial);
                this.readyIndicator.add(sparkles);
                
                // Animate indicator
                let time = 0;
                const animateIndicator = () => {
                    if (this.readyIndicator && this.readyIndicator.parent && this.state === 'READY_TO_THROW') {
                        time += 0.016;
                        this.readyIndicator.position.y = 2.3 + 0.15 * Math.sin(time * 6);
                        this.readyIndicator.rotation.y += 0.02;
                        this.readyIndicator.material.opacity = 0.7 + 0.2 * Math.sin(time * 4);
                        requestAnimationFrame(animateIndicator);
                    }
                };
                animateIndicator();
            }
        } else {
            // Remove ready indicator
            if (this.readyIndicator) {
                this.mesh.remove(this.readyIndicator);
                this.readyIndicator = null;
            }
        }
    }

    updateTrajectoryPreview() {
        // Only show trajectory for active player
        const isActivePlayer = this.team === 'player' && 
                              window.inputController && 
                              window.inputController.getCurrentPlayer() === this;
        
        if (this.state === 'CHARGING_THROW' && isActivePlayer) {
            if (!this.trajectoryLine) {
                // Create trajectory preview line (only first half of arc)
                const points = [];
                const direction = this.getThrowDirection();
                const power = this.getThrowPower();
                
                // Calculate trajectory points (only first half)
                let maxHeight = 0;
                let maxHeightTime = 0;
                
                for (let i = 0; i <= 15; i++) { // Reduced from 20 to 15
                    const t = i * 0.15; // Smaller time steps
                    const baseSpeed = 4 + (power * 10);
                    const baseHeight = 1 + (power * 6);
                    
                    const x = this.position.x + direction.x * baseSpeed * t;
                    const y = 1.4 + baseHeight * t - 0.5 * 9.82 * t * t;
                    const z = this.position.z + direction.z * baseSpeed * t;
                    
                    if (y > maxHeight) {
                        maxHeight = y;
                        maxHeightTime = t;
                    }
                    
                    // Stop at apex or when descending significantly
                    if (y < 0 || (t > maxHeightTime && y < maxHeight * 0.7)) break;
                    
                    points.push(new THREE.Vector3(x, y, z));
                }
                
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const material = new THREE.LineBasicMaterial({ 
                    color: 0x8a2be2, // Blue violet
                    transparent: true,
                    opacity: 0.8,
                    linewidth: 5 // Thicker line
                });
                
                this.trajectoryLine = new THREE.Line(geometry, material);
                
                // Create impact prediction mark
                this.createImpactPrediction(direction, power);
                
                if (window.gameEngine) {
                    window.gameEngine.scene.add(this.trajectoryLine);
                }
            } else {
                // Update existing trajectory
                const points = [];
                const direction = this.getThrowDirection();
                const power = this.getThrowPower();
                
                let maxHeight = 0;
                let maxHeightTime = 0;
                
                for (let i = 0; i <= 15; i++) {
                    const t = i * 0.15;
                    const baseSpeed = 4 + (power * 10);
                    const baseHeight = 1 + (power * 6);
                    
                    const x = this.position.x + direction.x * baseSpeed * t;
                    const y = 1.4 + baseHeight * t - 0.5 * 9.82 * t * t;
                    const z = this.position.z + direction.z * baseSpeed * t;
                    
                    if (y > maxHeight) {
                        maxHeight = y;
                        maxHeightTime = t;
                    }
                    
                    if (y < 0 || (t > maxHeightTime && y < maxHeight * 0.7)) break;
                    
                    points.push(new THREE.Vector3(x, y, z));
                }
                
                this.trajectoryLine.geometry.setFromPoints(points);
                
                // Update impact prediction
                this.updateImpactPrediction(direction, power);
            }
        } else {
            // Remove trajectory line when not charging or not active player
            if (this.trajectoryLine) {
                if (window.gameEngine) {
                    window.gameEngine.scene.remove(this.trajectoryLine);
                }
                this.trajectoryLine = null;
            }
            
            // Remove impact prediction
            if (this.impactPrediction) {
                if (window.gameEngine) {
                    window.gameEngine.scene.remove(this.impactPrediction);
                }
                this.impactPrediction = null;
            }
        }
    }

    createImpactPrediction(direction, power) {
        // Calculate where the snowball will land
        const baseSpeed = 4 + (power * 10);
        const baseHeight = 1 + (power * 6);
        
        // Calculate time to hit ground
        const timeToGround = (baseHeight + Math.sqrt(baseHeight * baseHeight + 2 * 9.82 * 1.4)) / 9.82;
        
        // Calculate landing position
        const landX = this.position.x + direction.x * baseSpeed * timeToGround;
        const landZ = this.position.z + direction.z * baseSpeed * timeToGround;
        
        // Create impact prediction mark
        const markGeometry = new THREE.RingGeometry(0.2, 0.4, 16);
        const markMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x8a2be2, // Same violet as trajectory
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        
        this.impactPrediction = new THREE.Mesh(markGeometry, markMaterial);
        this.impactPrediction.position.set(landX, 0.02, landZ);
        this.impactPrediction.rotation.x = -Math.PI / 2;
        
        if (window.gameEngine) {
            window.gameEngine.scene.add(this.impactPrediction);
        }
    }

    updateImpactPrediction(direction, power) {
        if (!this.impactPrediction) return;
        
        const baseSpeed = 4 + (power * 10);
        const baseHeight = 1 + (power * 6);
        
        const timeToGround = (baseHeight + Math.sqrt(baseHeight * baseHeight + 2 * 9.82 * 1.4)) / 9.82;
        
        const landX = this.position.x + direction.x * baseSpeed * timeToGround;
        const landZ = this.position.z + direction.z * baseSpeed * timeToGround;
        
        this.impactPrediction.position.set(landX, 0.02, landZ);
    }

    createPhysicsBody() {
        const { Cylinder, Body, Material } = window.CannonClasses || {};
        if (!Cylinder || !Body || !Material) {
            console.error('Cannon.js classes not available');
            return;
        }
        
        const shape = new Cylinder(0.5, 0.5, 1.5, 8);
        this.body = new Body({ 
            mass: 1,
            shape: shape,
            material: new Material('character')
        });
        
        this.body.position.set(this.position.x, 1, this.position.z);
        this.body.fixedRotation = true; // Prevent character from falling over
        this.body.updateMassProperties();
    }

    update(deltaTime) {
        if (!this.isAlive) return;

        // Update state machine
        this.updateState(deltaTime);
        
        // Update movement
        this.updateMovement(deltaTime);
        
        // Sync visual with physics
        this.syncMeshWithBody();
        
        // Update visual state
        this.updateVisualState();
        
        // Update animations
        this.updateAnimations(deltaTime);
        
        // Update UI bars
        this.updateHealthBar();
        this.updateSnowballProgressBar();
        this.updateReadyIndicator();
        this.updateTrajectoryPreview();
    }

    updateAnimations(deltaTime) {
        // Update animation mixer
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }
        
        // Play appropriate animation based on state
        this.updateAnimationState();
    }

    updateAnimationState() {
        if (!this.mixer || !this.animationClips) return;
        
        let targetAnimation = null;
        
        switch (this.state) {
            case 'IDLE':
                targetAnimation = 'idle';
                break;
            case 'MOVING':
                targetAnimation = 'walk';
                break;
            case 'MAKING_SNOWBALL':
                targetAnimation = 'crouch';
                break;
            case 'CHARGING_THROW':
                targetAnimation = 'aim';
                break;
            case 'THROWING':
                targetAnimation = 'throw';
                break;
        }
        
        // Play animation if different from current
        if (targetAnimation && this.animationClips[targetAnimation]) {
            if (!this.currentAnimation || this.currentAnimation.getClip().name !== targetAnimation) {
                this.playAnimation(targetAnimation, true);
            }
        }
    }

    updateState(deltaTime) {
        switch (this.state) {
            case 'MAKING_SNOWBALL':
                this.makingSnowballTime += deltaTime;
                if (this.makingSnowballTime >= this.maxMakeTime) {
                    this.hasSnowball = true;
                    this.makingSnowballTime = 0;
                    this.setState('READY_TO_THROW');
                }
                break;

            case 'CHARGING_THROW':
                this.chargingThrowTime += deltaTime;
                // Don't auto-throw - let user decide when to release
                // Max charge time reached, but wait for user release
                if (this.chargingThrowTime >= this.maxChargeTime) {
                    this.chargingThrowTime = this.maxChargeTime; // Cap at max
                }
                break;

            case 'THROWING':
                // Brief throwing animation state
                setTimeout(() => {
                    if (this.state === 'THROWING') {
                        this.setState('IDLE');
                    }
                }, 300);
                break;
        }
    }

    updateMovement(deltaTime) {
        if (this.state === 'MAKING_SNOWBALL') {
            return; // Can't move while making snowball
        }
        // Can move during CHARGING_THROW and THROWING now

        const dx = this.targetPosition.x - this.position.x;
        const dz = this.targetPosition.z - this.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance > 0.1) {
            this.isMoving = true;
            
            // Normalize direction
            const dirX = dx / distance;
            const dirZ = dz / distance;
            
            // Move towards target
            const moveDistance = Math.min(this.moveSpeed * deltaTime, distance);
            const newX = this.position.x + dirX * moveDistance;
            const newZ = this.position.z + dirZ * moveDistance;
            
            // Check collision before actually moving
            if (!this.checkBarrierCollision(newX, newZ)) {
                this.position.x = newX;
                this.position.z = newZ;
                
                // CRITICAL: Update physics body position
                if (this.body) {
                    this.body.position.x = this.position.x;
                    this.body.position.z = this.position.z;
                }
                
                // CRITICAL: Update visual position immediately
                this.mesh.position.x = this.position.x;
                this.mesh.position.z = this.position.z;
                this.mesh.position.y = this.characterYOffset; // Use configurable offset
                
                // Position label updates removed
                
            } else {
                // Stop movement if blocked
                this.targetPosition.x = this.position.x;
                this.targetPosition.z = this.position.z;
            }
            
            // Update state
            if (this.state === 'IDLE') {
                this.setState('MOVING');
            }
        } else {
            if (this.isMoving) {
                this.isMoving = false;
                if (this.state === 'MOVING') {
                    this.setState('IDLE');
                }
            }
        }
    }

    syncMeshWithBody() {
        if (this.body) {
            // Sync X and Z with physics body, but use configurable Y offset
            this.mesh.position.x = this.body.position.x;
            this.mesh.position.z = this.body.position.z;
            this.mesh.position.y = this.characterYOffset; // Use configurable offset
            this.mesh.quaternion.copy(this.body.quaternion);
        } else {
            // Update mesh position manually if no physics
            this.mesh.position.x = this.position.x;
            this.mesh.position.z = this.position.z;
            this.mesh.position.y = this.characterYOffset; // Use configurable offset
        }
    }

        updateVisualState() {
            const isCurrentPlayer = this.team === 'player' && window.inputController && 
                                   window.inputController.getCurrentPlayer() === this;
            
            // Check if we have a custom model loaded
            if (this.model) {
                // Apply animations to the entire custom model
                this.updateCustomModelState(isCurrentPlayer);
            } else {
                // Use the old system for basic geometry
                this.updateBasicGeometryState(isCurrentPlayer);
            }
        }

        updateCustomModelState(isCurrentPlayer) {
            // For custom models, apply transformations to the entire model
            switch (this.state) {
                case 'MAKING_SNOWBALL':
                    // AGACHAMENTO: Scale down and lower the entire model
                    this.model.scale.y = 0.5;
                    this.model.position.y = -0.3; // Lower the model
                    
                    if (isCurrentPlayer) {
                        console.log('🔄 Agachando: Modelo personalizado comprimido');
                    }
                    break;
                    
                case 'CHARGING_THROW':
                    // INCLINAÇÃO: Rotate the entire model forward
                    this.model.rotation.x = -0.3;
                    
                    if (isCurrentPlayer) {
                        console.log('🎯 Inclinando: Modelo personalizado inclinado');
                    }
                    break;
                    
                default:
                    // RESET: Return to normal
                    this.model.scale.y = 1.0;
                    this.model.position.y = 0;
                    this.model.rotation.x = 0;
                    break;
            }
        }

        updateBasicGeometryState(isCurrentPlayer) {
            // Find all character parts
            let bodyPart = null;
            let headPart = null;
            let hatPart = null;
            let eyes = [];
            let nose = null;
            
            this.mesh.traverse((child) => {
                if (child.isMesh && child.geometry) {
                    if (child.geometry.type === 'CylinderGeometry') {
                        // Check height to distinguish body from hat
                        if (child.geometry.parameters.height > 1.0) {
                            bodyPart = child; // Body cylinder is taller (1.2)
                        } else {
                            hatPart = child; // Hat cylinder is shorter (0.2)
                        }
                    } else if (child.geometry.type === 'SphereGeometry') {
                        if (child.geometry.parameters.radius > 0.2) {
                            headPart = child; // Head sphere is bigger (0.3)
                        } else if (child.geometry.parameters.radius < 0.04) {
                            nose = child; // Nose is smallest (0.03)
                        } else {
                            eyes.push(child); // Eyes are medium (0.05)
                        }
                    }
                }
            });
            
            switch (this.state) {
                case 'MAKING_SNOWBALL':
                    // AGACHAMENTO: Comprimir body e abaixar head/hat/eyes/nose
                    if (bodyPart) {
                        bodyPart.scale.y = 0.5; // Comprimir corpo pela metade
                        bodyPart.position.y = 0.3; // Abaixar corpo (0.5 * 0.6 = 0.3)
                        
                        if (isCurrentPlayer) {
                            console.log('🔄 Agachando: Body comprimido para 50%');
                        }
                    }
                    
                    // Abaixar cabeça e acessórios
                    if (headPart) headPart.position.y = 1.0; // Era 1.4, agora 1.0
                    if (hatPart) hatPart.position.y = 1.2; // Era 1.6, agora 1.2
                    if (nose) nose.position.y = 1.0; // Era 1.4, agora 1.0
                    eyes.forEach(eye => {
                        eye.position.y = 1.05; // Era 1.45, agora 1.05
                    });
                    break;
                    
                case 'CHARGING_THROW':
                    // INCLINAÇÃO: Inclinar body e head juntos
                    if (bodyPart) {
                        bodyPart.rotation.x = -0.3; // Inclinar corpo
                        if (isCurrentPlayer) {
                            console.log('🎯 Inclinando: Body rotacionado -17°');
                        }
                    }
                    if (headPart) headPart.rotation.x = -0.3; // Inclinar cabeça junto
                    if (hatPart) hatPart.rotation.x = -0.3; // Inclinar chapéu junto
                    if (nose) nose.rotation.x = -0.3; // Inclinar nariz junto
                    eyes.forEach(eye => {
                        eye.rotation.x = -0.3; // Inclinar olhos junto
                    });
                    break;
                    
                default:
                    // RESET: Voltar tudo ao normal
                    if (bodyPart) {
                        bodyPart.scale.y = 1.0;
                        bodyPart.position.y = 0.6;
                        bodyPart.rotation.x = 0;
                    }
                    if (headPart) {
                        headPart.position.y = 1.4;
                        headPart.rotation.x = 0;
                    }
                    if (hatPart) {
                        hatPart.position.y = 1.6;
                        hatPart.rotation.x = 0;
                    }
                    if (nose) {
                        nose.position.y = 1.4;
                        nose.rotation.x = 0;
                    }
                    eyes.forEach(eye => {
                        eye.position.y = 1.45;
                        eye.rotation.x = 0;
                    });
                    break;
            }
        }

    // State management
    setState(newState) {
        if (this.state !== newState) {
            this.previousState = this.state;
            this.state = newState;
            
            this.onStateChange();
            this.updateVisualState();
        }
    }

    onStateChange() {
        // Log only major state changes for currently controlled player
        const isCurrentPlayer = this.team === 'player' && window.inputController && 
                               window.inputController.getCurrentPlayer() === this;
        
        if (isCurrentPlayer && this.isImportantStateChange()) {
            console.log(`🎭 ${this.previousState} → ${this.state}`);
        }
        
        // Reset timers when changing states
        switch (this.state) {
            case 'MAKING_SNOWBALL':
                this.makingSnowballTime = 0;
                break;
            case 'CHARGING_THROW':
                this.chargingThrowTime = 0;
                break;
        }
    }
    
    isImportantStateChange() {
        // Only log major state transitions, not every frame update
        const importantStates = ['MAKING_SNOWBALL', 'READY_TO_THROW', 'CHARGING_THROW', 'THROWING'];
        return importantStates.includes(this.state) || importantStates.includes(this.previousState);
    }

    // Actions
    moveTo(x, z) {
        if (this.canMove()) {
            // Check collision with barriers before moving
            if (this.checkBarrierCollision(x, z)) {
                return; // Don't move if would collide with barrier
            }
            
            this.targetPosition = { x, z };
        }
    }

    checkBarrierCollision(newX, newZ) {
        if (!window.gameEngine) return false;
        
        const barriers = window.gameEngine.barriers;
        const characterRadius = 0.6; // Slightly larger than visual for better collision
        
        for (const barrier of barriers) {
            const bounds = barrier.getBounds();
            
            // Expand barrier bounds by character radius
            const expandedBounds = {
                minX: bounds.minX - characterRadius,
                maxX: bounds.maxX + characterRadius,
                minZ: bounds.minZ - characterRadius,
                maxZ: bounds.maxZ + characterRadius
            };
            
            // Check if new position would be inside expanded barrier bounds
            if (newX >= expandedBounds.minX && newX <= expandedBounds.maxX &&
                newZ >= expandedBounds.minZ && newZ <= expandedBounds.maxZ) {
                return true; // Collision detected
            }
        }
        
        return false; // No collision
    }

    startMakingSnowball() {
        const isCurrentPlayer = this.team === 'player' && window.inputController && 
                               window.inputController.getCurrentPlayer() === this;
        
        if (this.canMakeSnowball()) {
            if (isCurrentPlayer) {
                console.log(`🎯 Iniciando bola de neve`);
            }
            this.setState('MAKING_SNOWBALL');
            return true;
        }
        return false;
    }

    cancelMakingSnowball() {
        if (this.state === 'MAKING_SNOWBALL') {
            this.makingSnowballTime = 0; // Perde todo o progresso
            this.setState('IDLE');
            return true;
        }
        return false;
    }

    startChargingThrow() {
        const isCurrentPlayer = this.team === 'player' && window.inputController && 
                               window.inputController.getCurrentPlayer() === this;
        
        if (this.canThrow()) {
            if (isCurrentPlayer) {
                console.log(`🚀 Iniciando lançamento`);
            }
            this.setState('CHARGING_THROW');
            return true;
        }
        return false;
    }

    throwSnowball(forcePower = 1.0) {
        if (this.state === 'CHARGING_THROW' && this.hasSnowball) {
            this.setState('THROWING');
            this.hasSnowball = false;
            this.chargingThrowTime = 0;
            
            // Calculate throw direction towards enemies
            const direction = this.getThrowDirection();
            
            // Create snowball
            const snowball = new Snowball(
                this.position.x,
                this.position.z,
                direction,
                forcePower,
                this.team
            );
            
            // Add to game engine
            if (window.gameEngine) {
                window.gameEngine.addSnowball(snowball);
            }
            
            return snowball;
        }
        return null;
    }

    getThrowDirection() {
        // Calculate direction towards enemy team
        if (this.team === 'player') {
            // Players throw towards negative Z (north)
            return { x: 0, z: -1 };
        } else {
            // Enemies throw towards positive Z (south)
            return { x: 0, z: 1 };
        }
    }

    takeDamage(damage = 50) {
        if (!this.isAlive) return; // Already dead
        
        this.health -= damage;
        console.log(`${this.team} levou ${damage} de dano. Vida restante: ${this.health}`);
        
        if (this.health <= 0) {
            this.die();
        } else {
            // Visual feedback for taking damage (brief red flash)
            this.showDamageEffect();
        }
    }

    showDamageEffect() {
        // Brief red flash when taking damage
        this.mesh.traverse((child) => {
            if (child.isMesh && child.material && child.material.color) {
                const originalColor = child.material.color.clone();
                child.material.color.setHex(0xff0000); // Flash red
                
                setTimeout(() => {
                    child.material.color.copy(originalColor); // Restore original color
                }, 200);
            }
        });
    }

    die() {
        this.isAlive = false;
        
        // Create death animation: character falls down
        this.mesh.rotation.z = Math.PI / 2; // Rotate 90° to lay down
        this.mesh.position.y = 0.05; // Lower to ground level
        
        // Find and remove the hat, then create fallen hat
        let hat = null;
        this.mesh.traverse((child) => {
            if (child.isMesh && child.material) {
                // Make character semi-transparent
                child.material.transparent = true;
                child.material.opacity = 0.5;
                
                // Find the hat (gray color)
                if (child.material.color && child.material.color.getHex() === 0x333333) {
                    hat = child;
                }
            }
        });
        
        // Remove hat from character and create fallen hat
        if (hat) {
            this.mesh.remove(hat);
            
            // Create fallen hat nearby
            const fallenHat = hat.clone();
            fallenHat.position.set(
                this.position.x + (Math.random() - 0.5) * 2, // Random offset
                0.1, // On ground
                this.position.z + (Math.random() - 0.5) * 2
            );
            fallenHat.rotation.set(
                Math.random() * Math.PI, // Random rotation
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            // Add to scene directly
            if (window.gameEngine) {
                window.gameEngine.scene.add(fallenHat);
            }
        }
        
        // Hide all UI elements when dead
        if (this.healthBarFill) this.healthBarFill.visible = false;
        if (this.snowballBarFill) this.snowballBarFill.visible = false;
        if (this.throwBarFill) this.throwBarFill.visible = false;
        if (this.readyIndicator) {
            this.mesh.remove(this.readyIndicator);
            this.readyIndicator = null;
        }
        
        console.log(`Character ${this.team} morreu e caiu!`);
        
        // Notify InputController if this was the active player
        if (this.team === 'player' && window.inputController) {
            window.inputController.onPlayerDeath(this);
        }
    }

    updateDeathLabel() {
        if (!this.positionLabel) return;
        
        const canvas = this.positionLabel.material.map.image;
        const context = canvas.getContext('2d');
        
        // Clear canvas
        context.fillStyle = '#ff0000';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw border
        context.strokeStyle = '#ffffff';
        context.lineWidth = 4;
        context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
        
        // Draw text
        context.fillStyle = '#ffffff';
        context.font = 'bold 20px Arial';
        context.textAlign = 'center';
        
        context.fillText('💀 MORTO 💀', canvas.width / 2, 45);
        context.fillText(`Team: ${this.team.toUpperCase()}`, canvas.width / 2, 75);
        
        // Update texture
        this.positionLabel.material.map.needsUpdate = true;
    }

    // State checks
    canMove() {
        return this.isAlive && 
               this.state !== 'MAKING_SNOWBALL'; // Can move during charging and throwing now
    }

    canMakeSnowball() {
        return this.isAlive && 
               !this.hasSnowball && 
               (this.state === 'IDLE' || this.state === 'MOVING');
    }

    canThrow() {
        return this.isAlive && 
               this.hasSnowball && 
               this.state === 'READY_TO_THROW';
    }

    // Getters
    getStateInfo() {
        let status = 'Pronto para mover';
        
        switch (this.state) {
            case 'MOVING':
                status = 'Movendo';
                break;
            case 'MAKING_SNOWBALL':
                const progress = Math.round((this.makingSnowballTime / this.maxMakeTime) * 100);
                status = `Fazendo bola de neve (${progress}%)`;
                break;
            case 'READY_TO_THROW':
                status = 'Pronto para lançar';
                break;
            case 'CHARGING_THROW':
                const chargeProgress = Math.round((this.chargingThrowTime / this.maxChargeTime) * 100);
                status = `Carregando força (${chargeProgress}%)`;
                break;
            case 'THROWING':
                status = 'Lançando!';
                break;
        }
        
        return status;
    }

    getThrowPower() {
        if (this.state === 'CHARGING_THROW') {
            return Math.min(this.chargingThrowTime / this.maxChargeTime, 1.0);
        }
        return 0;
    }
}
