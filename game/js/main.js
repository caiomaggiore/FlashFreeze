/**
 * Flash Freeze - Main Game Controller
 * 3D Snow War Game inspired by classic Macromedia Flash games
 * Version: 0.1.0
 * Date: 2025-09-21
 */

// Game version info
const GAME_VERSION = '0.2.0';
const GAME_BUILD_DATE = '2025-09-21';

// Global game objects
let gameEngine = null;
let gameMechanics = null;
let inputController = null;
let simpleAI = null;
let uiManager = null;
let configPanel = null;

// Game initialization
function initGame() {
    console.log(`Inicializando Flash Freeze v${GAME_VERSION} (${GAME_BUILD_DATE})...`);
    
    try {
        // Show loading screen
        showInitialLoading();
        
        // Initialize core systems
        gameEngine = new GameEngine();
        window.gameEngine = gameEngine; // Make available globally for other classes
        
        gameMechanics = new GameMechanics(gameEngine);
        inputController = new InputController(gameEngine);
        window.inputController = inputController; // Make available globally
        simpleAI = new SimpleAI(gameEngine, gameMechanics);
        uiManager = new UIManager(gameEngine, gameMechanics);
        configPanel = new ConfigPanel(); // Painel de configurações
        
        // Setup game loop
        setupGameLoop();
        
        // Start the game
        startGame();
        
        console.log('Flash Freeze inicializado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao inicializar o jogo:', error);
        showError('Erro ao carregar o jogo. Verifique o console para mais detalhes.');
    }
}

function showInitialLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'initial-loading';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #87CEEB 0%, #E0F6FF 50%, #B0E0E6 100%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 3000;
        color: #2c3e50;
    `;
    
    loadingDiv.innerHTML = `
        <h1 style="font-size: 48px; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
            ❄️ New War Snow ❄️
        </h1>
        <div style="font-size: 18px; margin-bottom: 30px;">
            Carregando jogo de guerra de neve...
        </div>
        <div class="loading-spinner" style="
            width: 50px;
            height: 50px;
            border: 5px solid #bdc3c7;
            border-top: 5px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        "></div>
    `;
    
    document.body.appendChild(loadingDiv);
    
    // Remove loading screen after initialization
    setTimeout(() => {
        const loading = document.getElementById('initial-loading');
        if (loading) {
            document.body.removeChild(loading);
            showWelcomeScreen();
        }
    }, 2000);
}

function showWelcomeScreen() {
    const welcomeDiv = document.createElement('div');
    welcomeDiv.id = 'welcome-screen';
    welcomeDiv.style.cssText = `
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
        max-width: 700px;
        backdrop-filter: blur(10px);
    `;
    
    content.innerHTML = `
        <h1 style="font-size: 36px; margin-bottom: 20px;">❄️ New War Snow ❄️</h1>
        <p style="font-size: 18px; margin-bottom: 30px; line-height: 1.6;">
            Bem-vindo à guerra de neve! Comande seu exército verde contra os inimigos vermelhos.
            Use estratégia, cobertura e precisão para vencer!
        </p>
        
        <div style="text-align: left; margin: 30px 0; background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px;">
            <h3 style="margin-bottom: 15px; text-align: center;">🎮 Como Jogar</h3>
            <p><strong>🏃 Setas:</strong> Mover personagem ativo</p>
            <p><strong>🔄 Tab:</strong> Trocar entre seus personagens</p>
            <p><strong>❄️ S:</strong> Abaixar para fazer bola de neve (3 segundos)</p>
            <p><strong>🎯 Espaço:</strong> Segurar para carregar força, soltar para lançar</p>
            <p><strong>⏸️ ESC:</strong> Pausar jogo</p>
        </div>
        
        <div style="margin: 20px 0;">
            <p><strong>🎯 Objetivo:</strong> Elimine todos os inimigos vermelhos!</p>
            <p><strong>🛡️ Dica:</strong> Use as barreiras de gelo como proteção!</p>
        </div>
        
        <button id="start-game-btn" style="
            padding: 15px 30px;
            font-size: 20px;
            background: #27ae60;
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            margin-top: 20px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            transition: background 0.3s;
        ">🚀 Começar Batalha!</button>
    `;
    
    welcomeDiv.appendChild(content);
    document.body.appendChild(welcomeDiv);
    
    // Add hover effect
    const startBtn = content.querySelector('#start-game-btn');
    startBtn.addEventListener('mouseenter', () => {
        startBtn.style.background = '#2ecc71';
    });
    startBtn.addEventListener('mouseleave', () => {
        startBtn.style.background = '#27ae60';
    });
    
    // Start game on button click
    startBtn.addEventListener('click', () => {
        document.body.removeChild(welcomeDiv);
        actuallyStartGame();
    });
}

function setupGameLoop() {
    let lastTime = 0;
    
    function gameLoop(currentTime) {
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;
        
        // Update all systems
        if (inputController) {
            inputController.update(deltaTime);
        }
        
        if (simpleAI) {
            simpleAI.update(deltaTime);
        }
        
        if (gameMechanics) {
            gameMechanics.update(deltaTime);
        }
        
        if (uiManager) {
            uiManager.update();
        }
        
        // Continue loop
        requestAnimationFrame(gameLoop);
    }
    
    requestAnimationFrame(gameLoop);
}

function startGame() {
    // Game systems are initialized, but actual gameplay starts after welcome screen
    console.log('Sistemas do jogo prontos, aguardando início...');
}

function actuallyStartGame() {
    console.log('Iniciando gameplay...');
    
    // Start the game engine
    if (gameEngine) {
        gameEngine.start();
    }
    
    // Highlight first player
    if (inputController) {
        inputController.highlightCurrentPlayer();
    }
    
    // Show level transition
    if (uiManager) {
        uiManager.showLevelTransition(1);
    }
    
    console.log('Jogo iniciado! Boa sorte na batalha!');
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #e74c3c;
        color: white;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        z-index: 3000;
        max-width: 400px;
    `;
    
    errorDiv.innerHTML = `
        <h3>❌ Erro</h3>
        <p>${message}</p>
        <button onclick="location.reload()" style="
            padding: 10px 20px;
            background: white;
            color: #e74c3c;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 10px;
        ">Recarregar Página</button>
    `;
    
    document.body.appendChild(errorDiv);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, inicializando jogo...');
    
    // Check for required libraries
    if (typeof THREE === 'undefined') {
        showError('Three.js não foi encontrado na pasta libs/. Verifique se o arquivo libs/three.min.js existe.');
        return;
    }
    
    // Check for physics libraries (local files first)
    const hasCannonJS = (typeof CANNON !== 'undefined');
    const hasSimplePhysics = (typeof window.SimpleCannon !== 'undefined');
    
    if (hasCannonJS) {
        console.log('✅ Usando Cannon.js local - Física completa ativada!');
    } else if (hasSimplePhysics) {
        console.log('⚡ Usando sistema de física simplificado - Jogo funcionando offline!');
    } else {
        console.log('⚠️ Nenhum sistema de física detectado, mas continuando...');
    }
    
    // Initialize game
    initGame();
});

// Handle page visibility changes (pause when tab is not active)
document.addEventListener('visibilitychange', () => {
    if (gameMechanics) {
        if (document.hidden) {
            // Page is hidden, pause game
            if (gameMechanics.getGameState().state === 'PLAYING') {
                gameMechanics.pauseGame();
                console.log('Jogo pausado automaticamente (aba inativa)');
            }
        }
        // Note: We don't auto-resume when tab becomes active
        // Player should manually resume to avoid unexpected gameplay
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (gameEngine) {
        gameEngine.onWindowResize();
    }
});

// Export for debugging
window.gameDebug = {
    gameEngine: () => gameEngine,
    gameMechanics: () => gameMechanics,
    inputController: () => inputController,
    simpleAI: () => simpleAI,
    uiManager: () => uiManager
};
