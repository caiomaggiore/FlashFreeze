# 🎮 Guia de Maestria Three.js - Desenvolvimento Web 3D para Jogos

## 📚 Fundamentos Essenciais

### 1. **Arquitetura Core do Three.js**

#### **Componentes Fundamentais:**
- **Scene** - Container principal que agrupa todos os objetos 3D
- **Camera** - Define o ponto de vista (PerspectiveCamera, OrthographicCamera)
- **Renderer** - Renderiza a cena (WebGLRenderer, WebGPURenderer)
- **Geometry** - Define a forma dos objetos (BoxGeometry, SphereGeometry, etc.)
- **Material** - Define a aparência (MeshBasicMaterial, MeshStandardMaterial, etc.)
- **Mesh** - Combina Geometry + Material para criar objetos visíveis

#### **Hierarquia de Objetos:**
```javascript
Scene
├── Camera
├── Lights (AmbientLight, DirectionalLight, PointLight, etc.)
├── Meshes
│   ├── Geometry (vertices, faces, normals, UVs)
│   └── Material (color, texture, shader properties)
└── Helpers (GridHelper, AxesHelper, etc.)
```

### 2. **Sistema de Animações**

#### **AnimationMixer + AnimationClip:**
```javascript
// Carregar modelo com animações
const loader = new GLTFLoader();
loader.load('model.glb', (gltf) => {
    const model = gltf.scene;
    scene.add(model);
    
    // Criar mixer para animações
    const mixer = new AnimationMixer(model);
    
    // Reproduzir animação
    const action = mixer.clipAction(gltf.animations[0]);
    action.play();
    
    // No loop de animação
    mixer.update(deltaTime);
});
```

#### **KeyframeTrack System:**
- **PositionTrack** - Anima posição
- **RotationTrack** - Anima rotação  
- **ScaleTrack** - Anima escala
- **MorphTargetTrack** - Anima morph targets
- **QuaternionTrack** - Anima rotação com quaternions

### 3. **Sistema de Carregamento de Modelos**

#### **Formatos Suportados:**
- **GLTF/GLB** - Formato padrão (recomendado)
- **OBJ** - Simples, sem animações
- **FBX** - Com animações, mas pesado
- **DAE (Collada)** - XML-based
- **STL** - Apenas geometria

#### **Loaders Principais:**
```javascript
// GLTF Loader (recomendado)
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('path/to/draco/');

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
```

### 4. **Sistema de Iluminação**

#### **Tipos de Luz:**
- **AmbientLight** - Iluminação ambiente (sem direção)
- **DirectionalLight** - Luz solar (paralela)
- **PointLight** - Luz pontual (lâmpada)
- **SpotLight** - Luz focalizada (holofote)
- **HemisphereLight** - Luz do céu + solo
- **RectAreaLight** - Luz retangular (painel LED)

#### **Materiais por Tipo de Luz:**
- **MeshBasicMaterial** - Não afetado por luz
- **MeshLambertMaterial** - Difuso simples
- **MeshPhongMaterial** - Difuso + especular
- **MeshStandardMaterial** - PBR (recomendado)
- **MeshPhysicalMaterial** - PBR avançado

### 5. **Sistema de Física**

#### **Engines Suportados:**
- **Cannon.js** - JavaScript puro, mais leve
- **Ammo.js** - Port do Bullet Physics
- **Rapier** - Rust-based, muito performático

#### **Integração com Three.js:**
```javascript
import { RapierPhysics } from 'three/addons/physics/RapierPhysics.js';

// Inicializar física
const physics = await RapierPhysics();

// Criar corpo rígido
const rigidBody = physics.createRigidBody(rigidBodyDesc);
const collider = physics.createCollider(colliderDesc, rigidBody);

// Sincronizar com mesh
mesh.position.copy(rigidBody.translation());
mesh.quaternion.copy(rigidBody.rotation());
```

## 🎯 Padrões para Jogos

### 1. **Game Loop Pattern**
```javascript
function gameLoop() {
    const deltaTime = clock.getDelta();
    
    // Atualizar física
    physics.step();
    
    // Atualizar animações
    mixer.update(deltaTime);
    
    // Atualizar lógica do jogo
    updateGameLogic(deltaTime);
    
    // Renderizar
    renderer.render(scene, camera);
    
    requestAnimationFrame(gameLoop);
}
```

### 2. **Character Controller Pattern**
```javascript
class CharacterController {
    constructor(mesh, physicsBody) {
        this.mesh = mesh;
        this.physicsBody = physicsBody;
        this.velocity = new THREE.Vector3();
        this.isGrounded = false;
    }
    
    update(deltaTime, input) {
        // Aplicar movimento baseado em input
        this.applyMovement(input, deltaTime);
        
        // Aplicar gravidade
        this.applyGravity(deltaTime);
        
        // Atualizar posição do mesh
        this.syncMeshWithPhysics();
    }
}
```

### 3. **Scene Management Pattern**
```javascript
class SceneManager {
    constructor() {
        this.scenes = new Map();
        this.currentScene = null;
    }
    
    addScene(name, scene) {
        this.scenes.set(name, scene);
    }
    
    switchToScene(name) {
        if (this.currentScene) {
            this.currentScene.dispose();
        }
        this.currentScene = this.scenes.get(name);
    }
}
```

## 🚀 Otimizações para Jogos

### 1. **Performance Rendering**
- **Frustum Culling** - Renderizar apenas objetos visíveis
- **LOD (Level of Detail)** - Modelos com diferentes níveis de detalhe
- **Instancing** - Múltiplas cópias do mesmo objeto
- **Occlusion Culling** - Não renderizar objetos atrás de outros

### 2. **Memory Management**
```javascript
// Limpar geometrias não utilizadas
geometry.dispose();

// Limpar materiais
material.dispose();

// Limpar texturas
texture.dispose();

// Limpar cena completa
scene.traverse((object) => {
    if (object.geometry) object.geometry.dispose();
    if (object.material) {
        if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
        } else {
            object.material.dispose();
        }
    }
});
```

### 3. **Asset Loading Strategy**
```javascript
class AssetManager {
    constructor() {
        this.loadingManager = new LoadingManager();
        this.textures = new Map();
        this.models = new Map();
        this.audio = new Map();
    }
    
    async loadAssets(manifest) {
        const promises = [];
        
        // Carregar texturas
        for (const [name, url] of manifest.textures) {
            promises.push(this.loadTexture(name, url));
        }
        
        // Carregar modelos
        for (const [name, url] of manifest.models) {
            promises.push(this.loadModel(name, url));
        }
        
        await Promise.all(promises);
    }
}
```

## 🎨 Shaders e Materiais Avançados

### 1. **Custom Shaders**
```javascript
const customMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0xff0000) }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform vec3 color;
        varying vec2 vUv;
        void main() {
            gl_FragColor = vec4(color, 1.0);
        }
    `
});
```

### 2. **Post-Processing Effects**
```javascript
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BloomPass } from 'three/addons/postprocessing/BloomPass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new BloomPass(1.25, 25, 4.0, 256));
```

## 🎮 Aplicação no Projeto Flash Freeze

### 1. **Estrutura de Personagens**
```javascript
class Character {
    constructor(modelPath, position) {
        this.mesh = null;
        this.mixer = null;
        this.animations = new Map();
        this.state = 'idle';
        this.loadModel(modelPath);
    }
    
    async loadModel(path) {
        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync(path);
        
        this.mesh = gltf.scene;
        this.mixer = new AnimationMixer(this.mesh);
        
        // Mapear animações
        gltf.animations.forEach(clip => {
            this.animations.set(clip.name, clip);
        });
        
        this.playAnimation('idle');
    }
    
    playAnimation(name) {
        if (this.animations.has(name)) {
            const action = this.mixer.clipAction(this.animations.get(name));
            action.reset().fadeIn(0.5).play();
        }
    }
}
```

### 2. **Sistema de Projéteis (Bolas de Neve)**
```javascript
class Snowball {
    constructor(position, velocity) {
        this.geometry = new THREE.SphereGeometry(0.1, 8, 6);
        this.material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        
        this.mesh.position.copy(position);
        this.velocity = velocity.clone();
        this.gravity = -9.81;
        this.lifetime = 3.0;
    }
    
    update(deltaTime) {
        this.velocity.y += this.gravity * deltaTime;
        this.mesh.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        
        this.lifetime -= deltaTime;
        return this.lifetime > 0;
    }
}
```

### 3. **Sistema de Ambiente**
```javascript
class Environment {
    constructor() {
        this.scene = new THREE.Scene();
        this.setupLighting();
        this.setupSkybox();
        this.setupGround();
    }
    
    setupLighting() {
        // Luz ambiente
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Luz direcional (sol)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }
    
    setupSkybox() {
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            'skybox/px.jpg', 'skybox/nx.jpg',
            'skybox/py.jpg', 'skybox/ny.jpg',
            'skybox/pz.jpg', 'skybox/nz.jpg'
        ]);
        this.scene.background = texture;
    }
}
```

## 📖 Recursos de Aprendizado

### 1. **Documentação Oficial**
- [Three.js Manual](https://threejs.org/manual/)
- [API Reference](https://threejs.org/docs/)
- [Examples](https://threejs.org/examples/)

### 2. **Exemplos Práticos no Projeto**
- `three.js-dev/examples/` - 200+ exemplos funcionais
- `three.js-dev/editor/` - Editor visual completo
- `three.js-dev/src/` - Código fonte para estudo

### 3. **Conceitos Avançados**
- **WebGL Shaders** - Para efeitos customizados
- **WebGPU** - Próxima geração de renderização
- **WebXR** - Realidade virtual/aumentada
- **Procedural Generation** - Geração procedural de conteúdo

## 🎯 Próximos Passos

1. **Implementar Character System** baseado nos padrões estudados
2. **Criar Asset Pipeline** para carregamento eficiente
3. **Desenvolver Physics Integration** com Cannon.js
4. **Otimizar Performance** para dispositivos móveis
5. **Adicionar Post-Processing** para efeitos visuais

---

*Este guia será continuamente atualizado conforme exploramos mais profundamente o Three.js e implementamos funcionalidades no projeto Flash Freeze.*
