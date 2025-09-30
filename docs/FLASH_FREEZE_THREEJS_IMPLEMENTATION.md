# 🎮 Flash Freeze - Implementação Three.js Avançada

## 🚀 Visão Geral da Implementação

Baseado na análise profunda do projeto Three.js oficial, vou implementar um sistema de jogo 3D robusto e escalável para o Flash Freeze usando as melhores práticas identificadas.

## 🎯 Arquitetura do Jogo

### 1. **Core Game Engine Structure**

```javascript
class FlashFreezeEngine {
    constructor() {
        // Core Three.js components
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        
        // Game systems
        this.assetManager = new AssetManager();
        this.sceneManager = new SceneManager();
        this.inputManager = new InputManager();
        this.physicsManager = new PhysicsManager();
        this.audioManager = new AudioManager();
        
        // Game state
        this.gameState = new GameState();
        this.clock = new THREE.Clock();
        
        this.init();
    }
    
    init() {
        this.setupRenderer();
        this.setupLighting();
        this.setupEnvironment();
        this.setupControls();
        this.startGameLoop();
    }
}
```

### 2. **Sistema de Personagens Avançado**

Baseado no exemplo de animação skinning/blending do Three.js:

```javascript
class FlashFreezeCharacter {
    constructor(modelPath, position, team) {
        this.team = team; // 'player' ou 'enemy'
        this.position = position.clone();
        this.velocity = new THREE.Vector3();
        this.health = 100;
        this.state = 'idle';
        
        // Animation system
        this.mixer = null;
        this.animations = new Map();
        this.currentAction = null;
        this.previousAction = null;
        
        // Physics
        this.capsule = new Capsule(
            new THREE.Vector3(position.x, position.y, position.z),
            new THREE.Vector3(position.x, position.y + 1.8, position.z),
            0.5
        );
        
        this.loadModel(modelPath);
    }
    
    async loadModel(path) {
        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('libs/jsm/libs/draco/gltf/');
        loader.setDRACOLoader(dracoLoader);
        
        try {
            const gltf = await loader.loadAsync(path);
            this.mesh = gltf.scene;
            this.mesh.position.copy(this.position);
            
            // Setup animations
            this.mixer = new AnimationMixer(this.mesh);
            gltf.animations.forEach(clip => {
                this.animations.set(clip.name, clip);
            });
            
            // Setup default animations
            this.setupAnimations();
            this.playAnimation('idle');
            
        } catch (error) {
            console.warn(`Falha ao carregar modelo ${path}, usando geometria básica`);
            this.createBasicCharacter();
        }
    }
    
    setupAnimations() {
        // Map animation names to states
        const animationMap = {
            'idle': ['idle', 'Idle', 'T-Pose'],
            'walk': ['walk', 'Walk', 'walking'],
            'run': ['run', 'Run', 'running'],
            'throw': ['throw', 'Throw', 'throwing'],
            'hit': ['hit', 'Hit', 'damage']
        };
        
        for (const [state, possibleNames] of Object.entries(animationMap)) {
            for (const name of possibleNames) {
                if (this.animations.has(name)) {
                    this.animations.set(state, this.animations.get(name));
                    break;
                }
            }
        }
    }
    
    playAnimation(animationName, crossfadeDuration = 0.3) {
        if (!this.animations.has(animationName)) return;
        
        const newAction = this.mixer.clipAction(this.animations.get(animationName));
        
        if (this.currentAction && this.currentAction !== newAction) {
            this.currentAction.fadeOut(crossfadeDuration);
        }
        
        newAction.reset().fadeIn(crossfadeDuration).play();
        this.currentAction = newAction;
    }
    
    setState(newState) {
        if (this.state !== newState) {
            this.state = newState;
            this.playAnimation(newState);
        }
    }
    
    update(deltaTime, worldOctree) {
        // Update physics
        this.updatePhysics(deltaTime, worldOctree);
        
        // Update animations
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }
        
        // Update AI or input
        if (this.team === 'enemy') {
            this.updateAI(deltaTime);
        }
        
        // Sync mesh position with physics
        if (this.mesh) {
            this.mesh.position.copy(this.capsule.start);
        }
    }
    
    updatePhysics(deltaTime, worldOctree) {
        // Apply gravity
        this.velocity.y += -30 * deltaTime; // gravity
        
        // Apply movement
        const deltaPosition = this.velocity.clone().multiplyScalar(deltaTime);
        this.capsule.translate(deltaPosition);
        
        // Collision detection with world
        const result = worldOctree.capsuleIntersect(this.capsule);
        if (result) {
            this.capsule.translate(result.normal.multiplyScalar(result.depth));
            if (result.normal.y > 0) {
                this.velocity.y = 0; // Stop falling when on ground
            }
        }
    }
}
```

### 3. **Sistema de Projéteis (Bolas de Neve)**

Baseado no exemplo FPS do Three.js:

```javascript
class Snowball {
    constructor(startPosition, direction, speed = 20) {
        this.position = startPosition.clone();
        this.velocity = direction.clone().normalize().multiplyScalar(speed);
        this.lifetime = 3.0;
        this.radius = 0.15;
        
        // Visual
        this.geometry = new THREE.IcosahedronGeometry(this.radius, 2);
        this.material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.8,
            metalness: 0.1
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.copy(this.position);
        this.mesh.castShadow = true;
        
        // Physics
        this.sphere = new THREE.Sphere(this.position, this.radius);
        
        // Trail effect
        this.createTrail();
    }
    
    createTrail() {
        // Particle system for snow trail
        const trailGeometry = new THREE.BufferGeometry();
        const trailMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.02,
            transparent: true,
            opacity: 0.6
        });
        
        this.trail = new THREE.Points(trailGeometry, trailMaterial);
        this.trailPoints = [];
    }
    
    update(deltaTime, worldOctree, characters) {
        // Update position
        this.velocity.y += -9.81 * deltaTime; // gravity
        const deltaPosition = this.velocity.clone().multiplyScalar(deltaTime);
        this.position.add(deltaPosition);
        this.mesh.position.copy(this.position);
        this.sphere.center.copy(this.position);
        
        // Update trail
        this.updateTrail();
        
        // Check collision with world
        if (this.checkWorldCollision(worldOctree)) {
            return false; // Destroy snowball
        }
        
        // Check collision with characters
        for (const character of characters) {
            if (this.checkCharacterCollision(character)) {
                this.hitCharacter(character);
                return false; // Destroy snowball
            }
        }
        
        // Check lifetime
        this.lifetime -= deltaTime;
        return this.lifetime > 0;
    }
    
    checkWorldCollision(worldOctree) {
        const intersections = worldOctree.sphereIntersect(this.sphere);
        return intersections.length > 0;
    }
    
    checkCharacterCollision(character) {
        const distance = this.position.distanceTo(character.position);
        return distance < (this.radius + character.capsule.radius);
    }
    
    hitCharacter(character) {
        character.takeDamage(25);
        character.setState('hit');
        
        // Create impact effect
        this.createImpactEffect();
    }
}
```

### 4. **Sistema de Ambiente Dinâmico**

```javascript
class SnowEnvironment {
    constructor() {
        this.scene = new THREE.Scene();
        this.worldOctree = new Octree();
        this.setupLighting();
        this.setupSkybox();
        this.setupTerrain();
        this.setupWeatherEffects();
    }
    
    setupLighting() {
        // Ambient light for overall scene illumination
        const ambientLight = new THREE.AmbientLight(0x87CEEB, 0.4);
        this.scene.add(ambientLight);
        
        // Directional light for snow environment
        const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
        sunLight.position.set(50, 100, 50);
        sunLight.castShadow = true;
        
        // Configure shadow camera
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.1;
        sunLight.shadow.camera.far = 500;
        sunLight.shadow.camera.left = -50;
        sunLight.shadow.camera.right = 50;
        sunLight.shadow.camera.top = 50;
        sunLight.shadow.camera.bottom = -50;
        
        this.scene.add(sunLight);
        
        // Hemisphere light for realistic sky lighting
        const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0xffffff, 0.6);
        this.scene.add(hemisphereLight);
    }
    
    setupSkybox() {
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            'assets/skybox/winter_px.jpg',
            'assets/skybox/winter_nx.jpg',
            'assets/skybox/winter_py.jpg',
            'assets/skybox/winter_ny.jpg',
            'assets/skybox/winter_pz.jpg',
            'assets/skybox/winter_nz.jpg'
        ]);
        this.scene.background = texture;
        this.scene.environment = texture;
    }
    
    setupTerrain() {
        // Snow-covered ground
        const groundGeometry = new THREE.PlaneGeometry(100, 100, 100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.8,
            metalness: 0.1
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Add to octree for collision detection
        this.worldOctree.fromGraphNode(ground);
        
        // Create barriers/obstacles
        this.createBarriers();
    }
    
    createBarriers() {
        const barrierGeometry = new THREE.BoxGeometry(2, 2, 0.5);
        const barrierMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513
        });
        
        const positions = [
            { x: -10, z: 0 }, { x: 10, z: 0 },
            { x: 0, z: -10 }, { x: 0, z: 10 },
            { x: -5, z: -5 }, { x: 5, z: 5 },
            { x: -5, z: 5 }, { x: 5, z: -5 }
        ];
        
        positions.forEach(pos => {
            const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
            barrier.position.set(pos.x, 1, pos.z);
            barrier.castShadow = true;
            barrier.receiveShadow = true;
            this.scene.add(barrier);
            
            // Add to octree for collision
            this.worldOctree.fromGraphNode(barrier);
        });
    }
    
    setupWeatherEffects() {
        // Falling snow particles
        this.createSnowfall();
        
        // Wind effects
        this.windStrength = 0.1;
        this.windDirection = new THREE.Vector3(1, 0, 0);
    }
    
    createSnowfall() {
        const particleCount = 5000;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 200;
            positions[i + 1] = Math.random() * 50;
            positions[i + 2] = (Math.random() - 0.5) * 200;
            
            velocities[i] = (Math.random() - 0.5) * 0.1;
            velocities[i + 1] = -Math.random() * 2 - 1;
            velocities[i + 2] = (Math.random() - 0.5) * 0.1;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        
        const snowMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 2,
            transparent: true,
            opacity: 0.8
        });
        
        this.snowfall = new THREE.Points(particles, snowMaterial);
        this.scene.add(this.snowfall);
    }
    
    update(deltaTime) {
        this.updateSnowfall(deltaTime);
    }
    
    updateSnowfall(deltaTime) {
        const positions = this.snowfall.geometry.attributes.position.array;
        const velocities = this.snowfall.geometry.attributes.velocity.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Apply wind
            velocities[i] += this.windDirection.x * this.windStrength * deltaTime;
            velocities[i + 2] += this.windDirection.z * this.windStrength * deltaTime;
            
            // Update position
            positions[i] += velocities[i] * deltaTime * 10;
            positions[i + 1] += velocities[i + 1] * deltaTime * 10;
            positions[i + 2] += velocities[i + 2] * deltaTime * 10;
            
            // Reset if below ground
            if (positions[i + 1] < 0) {
                positions[i] = (Math.random() - 0.5) * 200;
                positions[i + 1] = 50;
                positions[i + 2] = (Math.random() - 0.5) * 200;
            }
        }
        
        this.snowfall.geometry.attributes.position.needsUpdate = true;
    }
}
```

### 5. **Game State Manager**

```javascript
class GameState {
    constructor() {
        this.state = 'menu'; // menu, playing, paused, gameOver
        this.score = { player: 0, enemy: 0 };
        this.timeRemaining = 300; // 5 minutes
        this.playerTeam = [];
        this.enemyTeam = [];
        this.snowballs = [];
    }
    
    setState(newState) {
        const oldState = this.state;
        this.state = newState;
        this.onStateChange(oldState, newState);
    }
    
    onStateChange(oldState, newState) {
        switch (newState) {
            case 'playing':
                this.startGame();
                break;
            case 'paused':
                this.pauseGame();
                break;
            case 'gameOver':
                this.endGame();
                break;
        }
    }
    
    startGame() {
        this.timeRemaining = 300;
        this.score = { player: 0, enemy: 0 };
        console.log('🎮 Game Started!');
    }
    
    update(deltaTime) {
        if (this.state === 'playing') {
            this.timeRemaining -= deltaTime;
            if (this.timeRemaining <= 0) {
                this.setState('gameOver');
            }
        }
    }
}
```

## 🎯 Próximos Passos de Implementação

1. **Integrar Sistema de Personagens** - Substituir geometrias básicas por caracteres animados
2. **Implementar Física Avançada** - Usar Octree para colisões precisas
3. **Adicionar Efeitos Visuais** - Partículas, trails, impactos
4. **Otimizar Performance** - LOD, frustum culling, object pooling
5. **Implementar IA Avançada** - Behavior trees para inimigos
6. **Adicionar Sistema de Audio** - Sons 3D posicionais
7. **Criar Interface Avançada** - HUD, menus, configurações

## 📊 Estrutura de Arquivos Organizada

```
game/
├── js/
│   ├── engine/
│   │   ├── FlashFreezeEngine.js
│   │   ├── AssetManager.js
│   │   └── SceneManager.js
│   ├── entities/
│   │   ├── Character.js (atualizado)
│   │   ├── Snowball.js (melhorado)
│   │   └── Environment.js
│   ├── systems/
│   │   ├── PhysicsManager.js
│   │   ├── InputManager.js
│   │   └── AudioManager.js
│   └── ui/
│       ├── UIManager.js (atualizado)
│       └── GameHUD.js
├── assets/
│   ├── models/
│   │   ├── characters/
│   │   └── environment/
│   ├── textures/
│   ├── skyboxes/
│   └── audio/
└── shaders/
    ├── snow.vert
    └── snow.frag
```

Esta implementação elevará significativamente o nível técnico do projeto, incorporando as melhores práticas do Three.js estudadas nos exemplos oficiais.
