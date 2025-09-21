/**
 * ConfigPanel - Painel de configurações para velocidade e movimento
 */
class ConfigPanel {
    constructor() {
        this.isVisible = false;
        this.panel = null;
        
        // Configurações padrão
        this.config = {
            walkSpeed: 2.0,      // Velocidade de caminhada (unidades/segundo)
            runSpeed: 4.0,       // Velocidade de corrida (unidades/segundo)  
            walkStepSize: 0.5,   // Tamanho do passo caminhando
            runStepSize: 1.0,    // Tamanho do passo correndo
            characterYOffset: 0  // Offset Y para ajustar altura do personagem
        };
        
        this.createPanel();
        this.setupEventListeners();
    }
    
    createPanel() {
        this.panel = document.createElement('div');
        this.panel.id = 'config-panel';
        this.panel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #3498db;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 2000;
            min-width: 400px;
            display: none;
        `;
        
        this.updatePanelContent();
        document.body.appendChild(this.panel);
    }
    
    updatePanelContent() {
        this.panel.innerHTML = `
            <h2 style="margin-top: 0; color: #3498db; text-align: center;">⚙️ Configurações de Movimento</h2>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px;">🚶 Velocidade Caminhada: <span id="walk-speed-value">${this.config.walkSpeed}</span> u/s</label>
                <input type="range" id="walk-speed" min="0.5" max="5.0" step="0.1" value="${this.config.walkSpeed}" 
                       style="width: 100%;">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px;">🏃 Velocidade Corrida: <span id="run-speed-value">${this.config.runSpeed}</span> u/s</label>
                <input type="range" id="run-speed" min="1.0" max="10.0" step="0.1" value="${this.config.runSpeed}" 
                       style="width: 100%;">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px;">👣 Tamanho Passo Caminhada: <span id="walk-step-value">${this.config.walkStepSize}</span></label>
                <input type="range" id="walk-step" min="0.1" max="2.0" step="0.1" value="${this.config.walkStepSize}" 
                       style="width: 100%;">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px;">🦶 Tamanho Passo Corrida: <span id="run-step-value">${this.config.runStepSize}</span></label>
                <input type="range" id="run-step" min="0.2" max="3.0" step="0.1" value="${this.config.runStepSize}" 
                       style="width: 100%;">
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px;">📏 Ajuste Altura Personagem: <span id="y-offset-value">${this.config.characterYOffset}</span></label>
                <input type="range" id="y-offset" min="-1.0" max="1.0" step="0.1" value="${this.config.characterYOffset}" 
                       style="width: 100%;">
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <button id="apply-config" style="
                    padding: 10px 20px;
                    background: #27ae60;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-right: 10px;
                    font-size: 14px;
                ">✅ Aplicar</button>
                
                <button id="reset-config" style="
                    padding: 10px 20px;
                    background: #e74c3c;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-right: 10px;
                    font-size: 14px;
                ">🔄 Resetar</button>
                
                <button id="close-config" style="
                    padding: 10px 20px;
                    background: #95a5a6;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                ">❌ Fechar</button>
            </div>
            
            <div style="margin-top: 15px; font-size: 12px; color: #bdc3c7; text-align: center;">
                <p>💡 <strong>Dica:</strong> Ajuste os valores e clique "Aplicar" para testar em tempo real!</p>
                <p>🎮 <strong>Controles:</strong> Setas = Mover | Shift = Correr | S = Fazer bola | Espaço = Lançar</p>
            </div>
        `;
    }
    
    setupEventListeners() {
        // Tecla C para abrir/fechar painel
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'c' && !e.repeat) {
                this.toggle();
            }
        });
    }
    
    show() {
        this.isVisible = true;
        this.panel.style.display = 'block';
        this.setupPanelListeners();
    }
    
    hide() {
        this.isVisible = false;
        this.panel.style.display = 'none';
    }
    
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    setupPanelListeners() {
        // Sliders
        const sliders = [
            { id: 'walk-speed', valueId: 'walk-speed-value', configKey: 'walkSpeed', suffix: ' u/s' },
            { id: 'run-speed', valueId: 'run-speed-value', configKey: 'runSpeed', suffix: ' u/s' },
            { id: 'walk-step', valueId: 'walk-step-value', configKey: 'walkStepSize', suffix: '' },
            { id: 'run-step', valueId: 'run-step-value', configKey: 'runStepSize', suffix: '' },
            { id: 'y-offset', valueId: 'y-offset-value', configKey: 'characterYOffset', suffix: '' }
        ];
        
        sliders.forEach(slider => {
            const element = document.getElementById(slider.id);
            const valueElement = document.getElementById(slider.valueId);
            
            if (element && valueElement) {
                element.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    this.config[slider.configKey] = value;
                    valueElement.textContent = value + slider.suffix;
                });
            }
        });
        
        // Botões
        const applyBtn = document.getElementById('apply-config');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.applyConfig();
            });
        }
        
        const resetBtn = document.getElementById('reset-config');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetConfig();
            });
        }
        
        const closeBtn = document.getElementById('close-config');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
        }
    }
    
    applyConfig() {
        console.log('🔧 Aplicando configurações:', this.config);
        
        // Aplicar configurações nos personagens
        if (window.gameEngine) {
            const allCharacters = [
                ...window.gameEngine.getPlayerCharacters(),
                ...window.gameEngine.getEnemyCharacters()
            ];
            
            allCharacters.forEach(character => {
                if (character.isAlive) {
                    // Aplicar configurações de movimento
                    character.walkSpeed = this.config.walkSpeed;
                    character.runSpeed = this.config.runSpeed;
                    character.walkStepSize = this.config.walkStepSize;
                    character.runStepSize = this.config.runStepSize;
                    
                    // Aplicar offset de altura - sobrescrever a posição Y base
                    if (character.mesh) {
                        character.characterYOffset = this.config.characterYOffset;
                        character.mesh.position.y = this.config.characterYOffset;
                        console.log(`📏 Altura do personagem ${character.team} ajustada para Y=${this.config.characterYOffset}`);
                    }
                }
            });
        }
        
        // Aplicar configurações no InputController
        if (window.inputController) {
            window.inputController.config = { ...this.config };
        }
        
        console.log('✅ Configurações aplicadas com sucesso!');
    }
    
    resetConfig() {
        this.config = {
            walkSpeed: 2.0,
            runSpeed: 4.0,
            walkStepSize: 0.5,
            runStepSize: 1.0,
            characterYOffset: 0
        };
        
        this.updatePanelContent();
        this.setupPanelListeners();
        this.applyConfig();
        
        console.log('🔄 Configurações resetadas para padrão');
    }
    
    getConfig() {
        return { ...this.config };
    }
}

// Disponibilizar globalmente
window.ConfigPanel = ConfigPanel;
