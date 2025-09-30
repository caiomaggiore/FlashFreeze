/**
 * InputController - Gerencia entrada do teclado e controle dos personagens
 * Controles: Setas (movimento), Tab (trocar personagem), S (fazer bola), Espaço (lançar)
 */
class InputController {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.currentPlayerIndex = 0;
        this.keys = {};
        
        // Input state
        this.isChargingThrow = false;
        
        // Configurações de movimento (serão atualizadas pelo ConfigPanel)
        this.config = {
            walkSpeed: 2.0,
            runSpeed: 4.0,
            walkStepSize: 0.5,
            runStepSize: 1.0,
            characterYOffset: 0
        };
        
        this.init();
    }

    init() {
        this.setupKeyboardListeners();
        console.log('InputController inicializado');
    }

    setupKeyboardListeners() {
        // Keydown events
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
            this.handleKeyDown(event);
        });

        // Keyup events
        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
            this.handleKeyUp(event);
        });

        // Prevent default behavior for game keys
        document.addEventListener('keydown', (event) => {
            const gameCodes = [
                'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
                'Tab', 'KeyS', 'Space', 'KeyC', 'ShiftLeft', 'ShiftRight'
            ];
            
            if (gameCodes.includes(event.code)) {
                event.preventDefault();
            }
        });
    }

    handleKeyDown(event) {
        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer || !currentPlayer.isAlive) return;

        switch (event.code) {
            case 'Tab':
                this.switchToNextPlayer();
                break;
                
            case 'KeyS':
                // Só inicia se não estiver já fazendo bola
                if (currentPlayer.state !== 'MAKING_SNOWBALL') {
                    this.startMakingSnowball();
                }
                break;
                
            case 'Space':
                this.startChargingThrow();
                break;
                
                case 'KeyE':
                    // Abrir Editor 3D Oficial (baseado no Three.js Editor) na mesma janela
                    window.location.href = '../editor/index.html';
                    break;
                
            case 'KeyC':
                this.captureCameraParameters();
                break;
        }
    }

    handleKeyUp(event) {
        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer || !currentPlayer.isAlive) return;

        switch (event.code) {
            case 'KeyS':
                // Se soltar S enquanto faz bola, cancela e perde progresso
                if (currentPlayer.state === 'MAKING_SNOWBALL') {
                    this.cancelMakingSnowball();
                }
                break;
                
            case 'Space':
                this.releaseThrow();
                break;
        }
    }

    update(deltaTime) {
        this.handleMovementInput(deltaTime);
        this.updateUI();
    }

    handleMovementInput(deltaTime) {
        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer || !currentPlayer.isAlive) {
            return;
        }
        
        if (!currentPlayer.canMove()) {
            return;
        }

        let moveX = 0;
        let moveZ = 0;

        // Check arrow keys
        if (this.keys['ArrowUp']) moveZ -= 1;
        if (this.keys['ArrowDown']) moveZ += 1;
        if (this.keys['ArrowLeft']) moveX -= 1;
        if (this.keys['ArrowRight']) moveX += 1;

        // Normalize diagonal movement
        if (moveX !== 0 && moveZ !== 0) {
            moveX *= 0.707; // 1/sqrt(2)
            moveZ *= 0.707;
        }

        // Apply movement - Set target position with walk/run speed
        if (moveX !== 0 || moveZ !== 0) {
            // Check if running (Shift pressed)
            const isRunning = this.keys['ShiftLeft'] || this.keys['ShiftRight'];
            
            // Use configurações do painel
            const stepSize = isRunning ? this.config.runStepSize : this.config.walkStepSize;
            const speed = isRunning ? this.config.runSpeed : this.config.walkSpeed;
            
            // Atualizar velocidade do personagem
            currentPlayer.moveSpeed = speed;
            
            const newX = currentPlayer.position.x + moveX * stepSize;
            const newZ = currentPlayer.position.z + moveZ * stepSize;
            
            // Bounds checking (keep within game area)
            const boundedX = Math.max(-25, Math.min(25, newX));
            const boundedZ = Math.max(-25, Math.min(25, newZ));
            
            // Debug para verificar se corrida está funcionando
            if (isRunning && this.keys['ShiftLeft']) {
                console.log('🏃 CORRENDO com Shift Esquerdo - Step:', stepSize, 'Speed:', speed);
            } else if (isRunning && this.keys['ShiftRight']) {
                console.log('🏃 CORRENDO com Shift Direito - Step:', stepSize, 'Speed:', speed);
            }
            
            currentPlayer.moveTo(boundedX, boundedZ);
        }
    }

    switchToNextPlayer() {
        const playerCharacters = this.gameEngine.getPlayerCharacters();
        if (playerCharacters.length === 0) return;

        // Find next alive player
        let attempts = 0;
        do {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % playerCharacters.length;
            attempts++;
        } while (!playerCharacters[this.currentPlayerIndex].isAlive && attempts < playerCharacters.length);

        const newPlayer = playerCharacters[this.currentPlayerIndex];
        if (newPlayer && newPlayer.isAlive) {
            console.log(`Trocou para personagem ${this.currentPlayerIndex + 1}`);
            
            // Cancel any ongoing NPC actions when user takes control
            this.cancelNPCActions(newPlayer);
            
            this.highlightCurrentPlayer();
        }
    }

    startMakingSnowball() {
        const currentPlayer = this.getCurrentPlayer();
        if (currentPlayer && currentPlayer.startMakingSnowball()) {
            console.log('Começou a fazer bola de neve - mantenha S pressionado!');
        }
    }

    cancelMakingSnowball() {
        const currentPlayer = this.getCurrentPlayer();
        if (currentPlayer && currentPlayer.state === 'MAKING_SNOWBALL') {
            currentPlayer.cancelMakingSnowball();
            console.log('Cancelou fazer bola de neve - perdeu o progresso!');
        }
    }

    startChargingThrow() {
        const currentPlayer = this.getCurrentPlayer();
        if (currentPlayer && currentPlayer.startChargingThrow()) {
            this.isChargingThrow = true;
            console.log('Começou a carregar lançamento');
        }
    }

    releaseThrow() {
        if (!this.isChargingThrow) return;

        const currentPlayer = this.getCurrentPlayer();
        if (currentPlayer && currentPlayer.state === 'CHARGING_THROW') {
            const power = currentPlayer.getThrowPower();
            const snowball = currentPlayer.throwSnowball(power);
            
            if (snowball) {
                console.log(`Lançou bola de neve com força ${Math.round(power * 100)}%`);
            }
        }
        
        this.isChargingThrow = false;
    }

    getCurrentPlayer() {
        const playerCharacters = this.gameEngine.getPlayerCharacters();
        if (playerCharacters.length === 0) return null;
        
        const currentPlayer = playerCharacters[this.currentPlayerIndex];
        
        // Auto-switch if current player is dead
        if (currentPlayer && !currentPlayer.isAlive) {
            this.switchToNextAlivePlayer();
            return this.getCurrentPlayer(); // Recursive call to get new active player
        }
        
        return currentPlayer || null;
    }

    onPlayerDeath(deadPlayer) {
        // Called when a player dies
        const playerCharacters = this.gameEngine.getPlayerCharacters();
        const deadPlayerIndex = playerCharacters.indexOf(deadPlayer);
        
        if (deadPlayerIndex === this.currentPlayerIndex) {
            console.log('Personagem ativo morreu, trocando automaticamente...');
            this.switchToNextAlivePlayer();
        }
    }

    switchToNextAlivePlayer() {
        const playerCharacters = this.gameEngine.getPlayerCharacters();
        if (playerCharacters.length === 0) return;

        // Find next alive player
        let attempts = 0;
        let originalIndex = this.currentPlayerIndex;
        
        do {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % playerCharacters.length;
            attempts++;
        } while (!playerCharacters[this.currentPlayerIndex].isAlive && 
                 attempts < playerCharacters.length &&
                 this.currentPlayerIndex !== originalIndex);

        const newPlayer = playerCharacters[this.currentPlayerIndex];
        if (newPlayer && newPlayer.isAlive) {
            console.log(`Trocou automaticamente para personagem ${this.currentPlayerIndex + 1}`);
            
            // Cancel any ongoing NPC actions when auto-switching
            this.cancelNPCActions(newPlayer);
            
            this.highlightCurrentPlayer();
        } else {
            console.log('Nenhum personagem vivo restante!');
        }
    }

    highlightCurrentPlayer() {
        // Remove highlight from all players
        const allPlayers = this.gameEngine.getPlayerCharacters();
        allPlayers.forEach(player => {
            if (player.mesh && player.mesh.children.length > 1) {
                // Remove highlight ring if exists
                const highlightRing = player.mesh.children.find(child => child.userData.isHighlight);
                if (highlightRing) {
                    player.mesh.remove(highlightRing);
                }
            }
        });

        // Add highlight to current player
        const currentPlayer = this.getCurrentPlayer();
        if (currentPlayer && currentPlayer.mesh) {
            const ringGeometry = new THREE.RingGeometry(0.8, 1.0, 16);
            const ringMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xffff00,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            });
            
            const highlightRing = new THREE.Mesh(ringGeometry, ringMaterial);
            highlightRing.rotation.x = -Math.PI / 2; // Flat on ground
            highlightRing.position.y = 0.02; // Just above ground level (character at Y=0)
            highlightRing.userData.isHighlight = true;
            
            currentPlayer.mesh.add(highlightRing);
            
            // Animate ring
            let time = 0;
            const animateRing = () => {
                if (highlightRing.parent) {
                    time += 0.016;
                    highlightRing.material.opacity = 0.4 + 0.3 * Math.sin(time * 4);
                    requestAnimationFrame(animateRing);
                }
            };
            animateRing();
        }
    }

    updateUI() {
        const currentPlayer = this.getCurrentPlayer();
        
        // Update current player display
        const currentPlayerElement = document.getElementById('current-player');
        if (currentPlayerElement) {
            currentPlayerElement.textContent = `Personagem: ${this.currentPlayerIndex + 1}`;
        }

        // Update status display
        const statusElement = document.getElementById('snowball-status');
        if (statusElement && currentPlayer) {
            statusElement.textContent = `Status: ${currentPlayer.getStateInfo()}`;
        }

        // Update force meter
        const forceMeter = document.getElementById('force-meter');
        const forceFill = document.getElementById('force-fill');
        
        if (currentPlayer && currentPlayer.state === 'CHARGING_THROW') {
            if (forceMeter) forceMeter.classList.remove('hidden');
            if (forceFill) {
                const power = currentPlayer.getThrowPower();
                forceFill.style.width = `${power * 100}%`;
            }
        } else {
            if (forceMeter) forceMeter.classList.add('hidden');
        }
    }

    // Get input state for AI or other systems
    getInputState() {
        return {
            currentPlayerIndex: this.currentPlayerIndex,
            isChargingThrow: this.isChargingThrow,
            keys: { ...this.keys }
        };
    }

    captureCameraParameters() {
        const camera = this.gameEngine.camera;
        const controls = this.gameEngine.cameraControls;
        
        if (controls) {
            const params = {
                position: {
                    x: camera.position.x,
                    y: camera.position.y,
                    z: camera.position.z
                },
                target: {
                    x: controls.target.x,
                    y: controls.target.y,
                    z: controls.target.z
                },
                radius: controls.radius,
                theta: controls.theta,
                phi: controls.phi
            };
            
            console.log('=== PARÂMETROS DA CÂMERA CAPTURADOS ===');
            console.log(`Posição: camera.position.set(${params.position.x.toFixed(1)}, ${params.position.y.toFixed(1)}, ${params.position.z.toFixed(1)});`);
            console.log(`Target: camera.lookAt(${params.target.x.toFixed(1)}, ${params.target.y.toFixed(1)}, ${params.target.z.toFixed(1)});`);
            console.log(`Distância: ${params.radius.toFixed(1)}`);
            console.log(`Theta: ${params.theta.toFixed(3)}`);
            console.log(`Phi: ${params.phi.toFixed(3)}`);
            console.log('==========================================');
            
            // Also copy to clipboard if possible
            const configText = `// Configuração da câmera capturada
camera.position.set(${params.position.x.toFixed(1)}, ${params.position.y.toFixed(1)}, ${params.position.z.toFixed(1)});
camera.lookAt(${params.target.x.toFixed(1)}, ${params.target.y.toFixed(1)}, ${params.target.z.toFixed(1)});
// Distância: ${params.radius.toFixed(1)}, Theta: ${params.theta.toFixed(3)}, Phi: ${params.phi.toFixed(3)}`;
            
            if (navigator.clipboard) {
                navigator.clipboard.writeText(configText).then(() => {
                    console.log('Configuração copiada para clipboard!');
                });
            }
        } else {
            console.log('Controles de câmera não disponíveis');
        }
    }

    cancelNPCActions(character) {
        // Cancel any ongoing NPC actions when user takes control
        switch (character.state) {
            case 'MAKING_SNOWBALL':
                console.log('Cancelando criação de bola de neve do NPC');
                character.cancelMakingSnowball();
                break;
                
            case 'CHARGING_THROW':
                console.log('Lançando bola do NPC no ponto atual');
                const currentPower = character.getThrowPower();
                character.throwSnowball(currentPower);
                break;
                
            case 'READY_TO_THROW':
                console.log('NPC estava pronto para lançar - mantendo estado');
                // Keep the snowball, user can decide what to do
                break;
        }
    }

    // Manual control methods for AI testing
    simulateKeyPress(keyCode) {
        this.keys[keyCode] = true;
        this.handleKeyDown({ code: keyCode, preventDefault: () => {} });
    }

    simulateKeyRelease(keyCode) {
        this.keys[keyCode] = false;
        this.handleKeyUp({ code: keyCode });
    }
    
    // Adicionar suporte para abrir editor 3D
    handleSpecialKeys(event) {
        const key = event.key.toLowerCase();
        
        // Editor 3D
        if (key === 'e') {
            window.open('../editor/index.html', '_blank');
        }
    }
}
