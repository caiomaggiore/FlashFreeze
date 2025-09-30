/**
 * UIManager - Gerencia interface do usuário e feedback visual
 */
class UIManager {
    constructor(gameEngine, gameMechanics) {
        this.gameEngine = gameEngine;
        this.gameMechanics = gameMechanics;
        
        this.elements = {
            currentPlayer: document.getElementById('current-player'),
            snowballStatus: document.getElementById('snowball-status'),
            forceMeter: document.getElementById('force-meter'),
            forceFill: document.getElementById('force-fill')
        };
        
        this.init();
    }

    init() {
        this.setupUI();
        console.log('UIManager inicializado');
    }

    setupUI() {
        // Add game stats display
        this.createStatsDisplay();
        
        // Add pause functionality
        this.setupPauseControls();
    }

    createStatsDisplay() {
        const statsDiv = document.createElement('div');
        statsDiv.id = 'game-stats';
        statsDiv.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 20px;
            background: rgba(255, 255, 255, 0.9);
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            font-size: 16px;
            min-width: 200px;
        `;
        
        document.getElementById('ui-overlay').appendChild(statsDiv);
        this.elements.gameStats = statsDiv;
    }

    setupPauseControls() {
        // ESC key to pause
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Escape') {
                this.togglePause();
            }
        });
    }

    update() {
        this.updateGameStats();
        this.updateCharacterInfo();
    }

    updateGameStats() {
        if (!this.elements.gameStats) return;
        
        const gameState = this.gameMechanics.getGameState();
        const playerCount = this.gameEngine.getPlayerCharacters().filter(c => c.isAlive).length;
        const enemyCount = this.gameEngine.getEnemyCharacters().filter(c => c.isAlive).length;
        
        this.elements.gameStats.innerHTML = `
            <div style="color: #2c3e50; font-weight: bold; margin-bottom: 8px;">Estatísticas</div>
            <div style="color: #27ae60; margin-bottom: 5px;">Seus soldados: ${playerCount}</div>
            <div style="color: #e74c3c; margin-bottom: 5px;">Inimigos: ${enemyCount}</div>
            <div style="color: #34495e; margin-bottom: 5px;">Nível: ${gameState.level}</div>
            <div style="color: #f39c12;">Pontuação: ${gameState.score}</div>
        `;
    }

    updateCharacterInfo() {
        // This is handled by InputController, but we could add more info here
    }

    togglePause() {
        const gameState = this.gameMechanics.getGameState();
        
        if (gameState.state === 'PLAYING') {
            this.showPauseMenu();
            this.gameMechanics.pauseGame();
        } else if (gameState.state === 'PAUSED') {
            this.hidePauseMenu();
            this.gameMechanics.resumeGame();
        }
    }

    showPauseMenu() {
        if (document.getElementById('pause-menu')) return;
        
        const pauseMenu = document.createElement('div');
        pauseMenu.id = 'pause-menu';
        pauseMenu.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;
        
        const menuContent = document.createElement('div');
        menuContent.style.cssText = `
            background: white;
            padding: 40px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        `;
        
        menuContent.innerHTML = `
            <h2 style="color: #2c3e50; margin-bottom: 20px;">Jogo Pausado</h2>
            <button id="resume-btn" style="
                padding: 12px 24px;
                font-size: 16px;
                background: #27ae60;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                margin: 5px;
            ">Continuar (ESC)</button>
            <br>
            <button id="restart-btn" style="
                padding: 12px 24px;
                font-size: 16px;
                background: #e74c3c;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                margin: 5px;
            ">Reiniciar Jogo</button>
        `;
        
        pauseMenu.appendChild(menuContent);
        document.body.appendChild(pauseMenu);
        
        // Add event listeners
        document.getElementById('resume-btn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.hidePauseMenu();
            this.gameMechanics.restartGame();
        });
    }

    hidePauseMenu() {
        const pauseMenu = document.getElementById('pause-menu');
        if (pauseMenu) {
            document.body.removeChild(pauseMenu);
        }
    }

    showNotification(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px 30px;
            border-radius: 10px;
            font-size: 18px;
            z-index: 1500;
            text-align: center;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, duration);
    }

    showLevelTransition(level) {
        this.showNotification(`Nível ${level}`, 2000);
    }

    // Loading screen management
    showLoadingScreen() {
        const loading = document.createElement('div');
        loading.id = 'loading-screen';
        loading.className = 'loading';
        loading.textContent = 'Carregando...';
        
        document.body.appendChild(loading);
    }

    hideLoadingScreen() {
        const loading = document.getElementById('loading-screen');
        if (loading) {
            document.body.removeChild(loading);
        }
    }

    // Error handling
    showError(message) {
        console.error(message);
        this.showNotification(`Erro: ${message}`, 5000);
    }

    // Instructions overlay
    showInstructions() {
        const instructionsOverlay = document.createElement('div');
        instructionsOverlay.id = 'instructions-overlay';
        instructionsOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            color: white;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 15px;
            text-align: center;
            max-width: 600px;
        `;
        
        content.innerHTML = `
            <h2>Como Jogar</h2>
            <div style="text-align: left; margin: 20px 0;">
                <p><strong>Setas:</strong> Mover personagem ativo</p>
                <p><strong>Tab:</strong> Trocar entre seus personagens</p>
                <p><strong>S:</strong> Abaixar para fazer bola de neve (3 segundos)</p>
                <p><strong>Espaço:</strong> Segurar para carregar força, soltar para lançar</p>
                <p><strong>ESC:</strong> Pausar jogo</p>
            </div>
            <div style="margin-top: 20px;">
                <p><strong>Objetivo:</strong> Elimine todos os inimigos vermelhos!</p>
                <p><strong>Dica:</strong> Use as barreiras de gelo como proteção!</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="
                padding: 12px 24px;
                font-size: 16px;
                background: #3498db;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                margin-top: 20px;
            ">Começar Jogo!</button>
        `;
        
        instructionsOverlay.appendChild(content);
        document.body.appendChild(instructionsOverlay);
    }
}
