/**
 * Flash Freeze Editor 3D - Editor Moderno
 * Baseado nos padrões oficiais do Three.js
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

class FlashFreezeEditor {
    constructor() {
        this.scene = null;
        this.sceneHelpers = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.transformControls = null;
        this.selectedObject = null;
        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Loaders
        this.gltfLoader = null;
        this.objLoader = null;
        this.fbxLoader = null;
        this.dracoLoader = null;
        
        // UI State
        this.currentTool = 'select';
        this.lastRenderLogTime = 0; // Para controlar frequência dos logs
        this.renderLogInterval = 2000; // 2 segundos entre logs
        this.isMouseDown = false;
        this.isShiftDown = false;
        
        // Stats
        this.stats = {
            fps: 0,
            objectCount: 0
        };
        
        this.init();
    }
    
    async init() {
        console.log('🎮 Inicializando Flash Freeze Editor 3D...');
        
        try {
            this.setupScene();
            this.setupCamera();
            this.setupRenderer();
            this.setupControls();
            this.setupLoaders();
            this.setupEventListeners();
            this.setupUI();
            this.setupDefaultScene();
            
            // Iniciar com sidebar de ferramentas minimizado
            this.initializeDefaultState();
            
            this.animate();
            
            console.log('✅ Editor 3D inicializado com sucesso!');
            this.updateStatus('Editor pronto');
            
            // Atualizar lista da cena após inicialização completa
            setTimeout(() => {
                this.updateScenePanel();
            }, 100);
            
        } catch (error) {
            console.error('❌ Erro ao inicializar editor:', error);
            this.updateStatus('Erro na inicialização');
        }
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x2a2a2a);
        this.scene.fog = new THREE.Fog(0x2a2a2a, 10, 100);
        
        // Criar sceneHelpers separado (como no editor oficial)
        this.sceneHelpers = new THREE.Scene();
        
        // Adicionar luz ambiente
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        console.log('💡 Luz ambiente adicionada:', ambientLight);
        
        // Adicionar luz direcional
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.target.position.set(0, 0, 0);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        this.scene.add(directionalLight);
        this.scene.add(directionalLight.target);
        console.log('💡 Luz direcional adicionada:', directionalLight);
        
        // Adicionar helpers para luzes
        this.addLightHelpers();
        
        // Adicionar grid helper ao sceneHelpers
        const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x444444);
        this.sceneHelpers.add(gridHelper);
        
        // Adicionar eixos helper ao sceneHelpers
        const axesHelper = new THREE.AxesHelper(5);
        this.sceneHelpers.add(axesHelper);
        
        console.log('✅ Scene e SceneHelpers criados');
    }
    
    setupCamera() {
        const container = document.getElementById('viewport');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.set(3, 3, 3);
        this.camera.lookAt(0, 0, 0);
        
        console.log('📷 Câmera criada:', this.camera);
        console.log('📷 Posição da câmera:', this.camera.position);
        console.log('📷 Câmera olhando para:', this.camera.getWorldDirection(new THREE.Vector3()));
        console.log('📷 FOV:', this.camera.fov);
        console.log('📷 Aspect ratio:', this.camera.aspect);
        console.log('📷 Near:', this.camera.near);
        console.log('📷 Far:', this.camera.far);
    }
    
    setupRenderer() {
        const container = document.getElementById('viewport');
        
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1;
        
        console.log('🎨 Renderer criado:', this.renderer);
        console.log('🎨 Tamanho:', container.clientWidth, 'x', container.clientHeight);
        console.log('🎨 Pixel ratio:', window.devicePixelRatio);
        console.log('🎨 Shadow map enabled:', this.renderer.shadowMap.enabled);
        
        container.appendChild(this.renderer.domElement);
    }
    
    setupControls() {
        // Orbit controls para câmera
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 100;
        this.controls.maxPolarAngle = Math.PI / 2;
        
        console.log('🎮 OrbitControls criado:', this.controls);
        console.log('🎮 Target:', this.controls.target);
        console.log('🎮 Enabled:', this.controls.enabled);
        
        // Transform controls para objetos (como no editor oficial)
        try {
            console.log('🔧 Criando TransformControls...');
            console.log('🔧 Camera:', this.camera);
            console.log('🔧 Renderer domElement:', this.renderer.domElement);
            
            this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
            
            // Garantir que o TransformControls seja visível
            this.transformControls.visible = true;
            
            console.log('🔧 TransformControls criado:', this.transformControls);
            console.log('🔧 TransformControls.getHelper():', this.transformControls.getHelper());
            
            // Event listeners
            this.transformControls.addEventListener('change', () => {
                this.render();
            });
            this.transformControls.addEventListener('dragging-changed', (event) => {
                console.log('🔧 TransformControls dragging-changed:', event.value);
                this.controls.enabled = !event.value;
            });
            
            // Adicionar helper do TransformControls ao sceneHelpers (método correto)
            const helper = this.transformControls.getHelper();
            console.log('🔧 Helper a ser adicionado:', helper);
            console.log('🔧 Helper é Object3D?', helper instanceof THREE.Object3D);
            
            this.sceneHelpers.add(helper);
            
            console.log('✅ TransformControls criado com sucesso');
            console.log('✅ Helper adicionado ao sceneHelpers');
            console.log('✅ SceneHelpers children:', this.sceneHelpers.children.length);
            
        } catch (error) {
            console.error('❌ Erro ao criar TransformControls:', error);
            this.transformControls = null;
        }
    }
    
    setupLoaders() {
        // DRACO Loader para compressão
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath('../libs/jsm/libs/draco/gltf/');
        
        // GLTF Loader
        this.gltfLoader = new GLTFLoader();
        this.gltfLoader.setDRACOLoader(this.dracoLoader);
        
        // OBJ Loader
        this.objLoader = new OBJLoader();
        
        // FBX Loader
        this.fbxLoader = new FBXLoader();
    }
    
    setupEventListeners() {
        // Resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Mouse events
        this.renderer.domElement.addEventListener('mousedown', (event) => this.onMouseDown(event));
        this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event));
        this.renderer.domElement.addEventListener('mouseup', (event) => this.onMouseUp(event));
        this.renderer.domElement.addEventListener('click', (event) => this.onClick(event));
        
        // Keyboard events
        window.addEventListener('keydown', (event) => this.onKeyDown(event));
        window.addEventListener('keyup', (event) => this.onKeyUp(event));
        
        // File input
        const fileInput = document.getElementById('file-input');
        fileInput.addEventListener('change', (event) => this.onFileLoad(event));
        
        // Sidebar controls
        this.setupSidebarControls();
    }
    
    setupUI() {
        // Tool buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (event) => {
                this.setTool(event.currentTarget.dataset.tool);
            });
        });
        
        // Object buttons
        document.querySelectorAll('.object-btn').forEach(btn => {
            btn.addEventListener('click', (event) => {
                this.addObject(event.currentTarget.dataset.object);
            });
        });
        
        // Import buttons
        document.querySelectorAll('.import-btn').forEach(btn => {
            btn.addEventListener('click', (event) => {
                this.importFile(event.currentTarget.id);
            });
        });
        
        // Action buttons
        document.getElementById('new-scene').addEventListener('click', () => this.newScene());
        document.getElementById('save-scene').addEventListener('click', () => this.saveScene());
        document.getElementById('back-to-game').addEventListener('click', () => this.backToGame());
    }
    
    setupDefaultScene() {
        // Adicionar um cubo padrão
        this.addObject('box');
    }
    
    setTool(tool) {
        this.currentTool = tool;
        
        // Atualizar UI
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
        
        // Configurar transform controls se disponível
        if (this.transformControls) {
            switch (tool) {
                case 'select':
                    this.transformControls.setMode('translate');
                    break;
                case 'move':
                    this.transformControls.setMode('translate');
                    break;
                case 'rotate':
                    this.transformControls.setMode('rotate');
                    break;
                case 'scale':
                    this.transformControls.setMode('scale');
                    break;
            }
            // Garantir que o TransformControls seja visível
            this.transformControls.visible = true;
            console.log(`🔧 Ferramenta alterada para: ${tool}, modo: ${this.transformControls.mode}, visível: ${this.transformControls.visible}`);
        }
        
        this.updateStatus(`Ferramenta: ${tool}`);
    }
    
    addObject(type) {
        let geometry, material, mesh;
        
        switch (type) {
            case 'box':
                geometry = new THREE.BoxGeometry(1, 1, 1);
                material = new THREE.MeshStandardMaterial({ color: 0x00d4ff }); // Usar StandardMaterial para iluminação
                console.log('📦 Criando cubo - Geometria:', geometry, 'Material:', material);
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(0.5, 32, 32);
                material = new THREE.MeshStandardMaterial({ color: 0xff6b6b }); // Usar StandardMaterial para iluminação
                console.log('🔴 Criando esfera - Geometria:', geometry, 'Material:', material);
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
                material = new THREE.MeshStandardMaterial({ color: 0x4ecdc4 }); // Usar StandardMaterial para iluminação
                console.log('🔵 Criando cilindro - Geometria:', geometry, 'Material:', material);
                break;
            case 'plane':
                geometry = new THREE.PlaneGeometry(2, 2);
                material = new THREE.MeshStandardMaterial({ 
                    color: 0x95a5a6,
                    side: THREE.DoubleSide
                }); // Usar StandardMaterial para iluminação
                console.log('⬜ Criando plano - Geometria:', geometry, 'Material:', material);
                break;
            case 'light-ambient':
                const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
                this.scene.add(ambientLight);
                this.updateObjectCount();
                return;
            case 'light-directional':
                const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
                directionalLight.position.set(5, 5, 5);
                directionalLight.castShadow = true;
                this.scene.add(directionalLight);
                this.updateObjectCount();
                return;
            case 'light-point':
                const pointLight = new THREE.PointLight(0xffffff, 2, 100); // Intensidade maior
                pointLight.position.set(0, 5, 0);
                pointLight.castShadow = true;
                this.scene.add(pointLight);
                this.addLightHelper(pointLight); // Adicionar helper
                this.updateObjectCount();
                this.updateScenePanel(); // Atualizar lista da cena
                return;
        }
        
        if (geometry && material) {
            mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.userData = { type: type, id: Date.now() };
            
            console.log(`➕ Criando objeto ${type}:`, mesh);
            console.log(`➕ Geometria:`, geometry);
            console.log(`➕ Material:`, material);
            console.log(`➕ Posição inicial:`, mesh.position);
            
            this.scene.add(mesh);
            console.log(`➕ Objeto adicionado à cena. Total de objetos:`, this.scene.children.length);
            
            // TESTE: Verificar se o objeto está realmente na cena
            console.log(`🔍 TESTE - Objeto na cena?`, this.scene.getObjectByProperty('uuid', mesh.uuid));
            console.log(`🔍 TESTE - Material do objeto:`, mesh.material.type);
            console.log(`🔍 TESTE - Objeto visível?`, mesh.visible);
            console.log(`🔍 TESTE - Posição do objeto:`, mesh.position);
            
            this.selectObject(mesh);
            this.updateObjectCount();
            this.updateScenePanel(); // Atualizar lista da cena
            
            // Forçar renderização imediata após adicionar objeto
            this.render();
            console.log(`🎨 Renderização forçada após adicionar objeto`);
            
            this.updateStatus(`Objeto ${type} adicionado`);
        }
    }
    
    importFile(type) {
        const fileInput = document.getElementById('file-input');
        
        switch (type) {
            case 'import-gltf':
                fileInput.accept = '.glb,.gltf';
                break;
            case 'import-obj':
                fileInput.accept = '.obj';
                break;
            case 'import-fbx':
                fileInput.accept = '.fbx';
                break;
        }
        
        fileInput.click();
    }
    
    async onFileLoad(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        this.updateStatus('Carregando arquivo...');
        
        try {
            const url = URL.createObjectURL(file);
            let object;
            
            if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
                const gltf = await this.gltfLoader.loadAsync(url);
                console.log('📦 GLTF carregado:', gltf);
                
                // Adicionar cena principal
                if (gltf.scene) {
                    gltf.scene.userData = { 
                        type: 'imported', 
                        id: Date.now(),
                        filename: file.name
                    };
                    this.scene.add(gltf.scene);
                    console.log('✅ Cena GLTF adicionada');
                }
                
                // Adicionar câmeras
                if (gltf.cameras && gltf.cameras.length > 0) {
                    gltf.cameras.forEach(camera => {
                        camera.userData = { 
                            type: 'imported', 
                            id: Date.now(),
                            filename: file.name
                        };
                        this.scene.add(camera);
                        console.log('📷 Câmera GLTF adicionada:', camera);
                    });
                }
                
                // Adicionar luzes
                if (gltf.scene) {
                    gltf.scene.traverse((child) => {
                        if (child.isLight) {
                            console.log('💡 Luz GLTF encontrada:', child);
                        }
                    });
                }
                
                this.updateObjectCount();
                this.updateScenePanel();
                this.updateStatus(`Arquivo ${file.name} carregado`);
                
            } else if (file.name.endsWith('.obj')) {
                object = await this.objLoader.loadAsync(url);
            } else if (file.name.endsWith('.fbx')) {
                object = await this.fbxLoader.loadAsync(url);
            }
            
            if (object && !file.name.endsWith('.glb') && !file.name.endsWith('.gltf')) {
                // Ensure object has proper userData
                object.userData = { 
                    type: 'imported', 
                    id: Date.now(),
                    filename: file.name
                };
                
                // Make sure object is a proper THREE.Object3D
                if (object.isObject3D) {
                    this.scene.add(object);
                    this.selectObject(object);
                    this.updateObjectCount();
                    this.updateScenePanel();
                    this.updateStatus(`Arquivo ${file.name} carregado`);
                } else {
                    console.warn('Objeto importado não é um Object3D válido');
                    this.updateStatus('Erro: objeto inválido');
                }
            }
            
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Erro ao carregar arquivo:', error);
            this.updateStatus('Erro ao carregar arquivo');
        }
    }
    
    selectObject(object) {
        console.log('🎯 Selecionando objeto:', object);
        console.log('🎯 Tipo do objeto:', object.constructor.name);
        console.log('🎯 É Mesh?', object.isMesh);
        console.log('🎯 Posição:', object.position);
        
        // Verificar se o objeto está travado ou invisível
        if (object.userData && object.userData.locked) {
            console.log('🔒 Objeto travado, não pode ser selecionado');
            this.updateStatus('Objeto travado - não pode ser selecionado');
            return;
        }
        
        if (!object.visible) {
            console.log('👁️ Objeto invisível, não pode ser selecionado');
            this.updateStatus('Objeto invisível - não pode ser selecionado');
            return;
        }
        
        // Reset previous selection
        if (this.selectedObject && this.selectedObject.material) {
            if (Array.isArray(this.selectedObject.material)) {
                this.selectedObject.material.forEach(mat => {
                    if (mat.emissive) mat.emissive.setHex(0x000000);
                });
            } else if (this.selectedObject.material.emissive) {
                this.selectedObject.material.emissive.setHex(0x000000);
            }
        }
        
        this.selectedObject = object;
        
        // Atualizar painel de cena para mostrar seleção
        this.updateScenePanel();
        
        // Attach to transform controls if available (apenas se não estiver travado e visível)
        if (this.transformControls && !object.userData.locked && object.visible) {
            console.log('🔧 TransformControls antes do attach:', this.transformControls);
            console.log('🔧 TransformControls.object antes:', this.transformControls.object);
            
            this.transformControls.attach(object);
            
            // Garantir que o TransformControls seja visível
            this.transformControls.visible = true;
            
            // Aplicar o modo da ferramenta atual sem recursão
            if (this.transformControls) {
                switch (this.currentTool) {
                    case 'select':
                    case 'move':
                        this.transformControls.setMode('translate');
                        break;
                    case 'rotate':
                        this.transformControls.setMode('rotate');
                        break;
                    case 'scale':
                        this.transformControls.setMode('scale');
                        break;
                }
                this.transformControls.visible = true;
                console.log(`🔧 Modo aplicado: ${this.currentTool} -> ${this.transformControls.mode}`);
            }
            
            console.log('🔧 TransformControls após attach:', this.transformControls);
            console.log('🔧 TransformControls.object após:', this.transformControls.object);
            console.log('🔧 TransformControls.visible:', this.transformControls.visible);
            console.log('🔧 TransformControls.mode:', this.transformControls.mode);
        } else if (object.userData.locked) {
            console.log('🔒 Objeto travado - TransformControls não será anexado');
            if (this.transformControls) {
                this.transformControls.detach();
            }
        } else {
            console.warn('❌ TransformControls não disponível');
        }
        
        // Highlight selected object
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(mat => {
                    if (mat.emissive) mat.emissive.setHex(0x333333);
                });
            } else if (object.material.emissive) {
                object.material.emissive.setHex(0x333333);
            }
        }
        
        this.updatePropertiesPanel();
    }
    
    updatePropertiesPanel() {
        const panel = document.getElementById('properties-panel');
        
        if (!this.selectedObject) {
            panel.innerHTML = '<p class="no-selection">Nenhum objeto selecionado</p>';
            return;
        }
        
        const obj = this.selectedObject;
        const position = obj.position;
        const rotation = obj.rotation;
        const scale = obj.scale;
        
        // Get material info safely
        let materialInfo = '';
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                materialInfo = `
                    <div class="property-group">
                        <h4>Materiais (${obj.material.length})</h4>
                        <p>Múltiplos materiais</p>
                    </div>
                `;
            } else if (obj.material.color) {
                materialInfo = `
                    <div class="property-group">
                        <h4>Material</h4>
                        <div class="property">
                            <label>Cor:</label>
                            <input type="color" value="#${obj.material.color.getHexString()}" 
                                   class="color-input">
                        </div>
                    </div>
                `;
            } else {
                materialInfo = `
                    <div class="property-group">
                        <h4>Material</h4>
                        <p>Material sem propriedades de cor</p>
                    </div>
                `;
            }
        } else {
            materialInfo = `
                <div class="property-group">
                    <h4>Material</h4>
                    <p>Sem material</p>
                </div>
            `;
        }
        
        panel.innerHTML = `
            <div class="property-group">
                <h4>Transformação</h4>
                <div class="property">
                    <label>Posição X:</label>
                    <input type="number" value="${position.x.toFixed(2)}" step="0.1" 
                           data-axis="x" class="position-input">
                </div>
                <div class="property">
                    <label>Posição Y:</label>
                    <input type="number" value="${position.y.toFixed(2)}" step="0.1" 
                           data-axis="y" class="position-input">
                </div>
                <div class="property">
                    <label>Posição Z:</label>
                    <input type="number" value="${position.z.toFixed(2)}" step="0.1" 
                           data-axis="z" class="position-input">
                </div>
            </div>
            ${materialInfo}
        `;
        
        // Add event listeners to inputs
        this.setupPropertyInputs(panel);
    }
    
    setupPropertyInputs(panel) {
        // Position inputs
        const positionInputs = panel.querySelectorAll('.position-input');
        positionInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const axis = e.target.dataset.axis;
                const value = parseFloat(e.target.value);
                this.updateObjectPosition(axis, value);
            });
        });
        
        // Color input
        const colorInput = panel.querySelector('.color-input');
        if (colorInput) {
            colorInput.addEventListener('change', (e) => {
                this.setMaterialColor(e.target.value);
            });
        }
    }
    
    updateScenePanel() {
        const panel = document.getElementById('scene-panel');
        let html = '';
        
        // Listar câmera
        const cameraSelected = this.selectedObject === this.camera ? 'selected' : '';
        html += `
            <div class="scene-item ${cameraSelected}" data-uuid="${this.camera.uuid}" data-type="camera">
                <i class="fas fa-camera"></i>
                <span>Camera (${this.camera.position.x.toFixed(1)}, ${this.camera.position.y.toFixed(1)}, ${this.camera.position.z.toFixed(1)})</span>
                <div class="scene-item-actions">
                    <button class="scene-item-action lock ${this.camera.userData.locked ? 'checked' : ''}" title="Travar" onclick="event.stopPropagation(); window.editor.toggleLock('${this.camera.uuid}')">
                        <i class="fas fa-lock"></i>
                    </button>
                    <button class="scene-item-action visibility checked" title="Visibilidade" onclick="event.stopPropagation(); window.editor.toggleVisibility('${this.camera.uuid}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Listar objetos da cena
        this.scene.children.forEach((child, index) => {
            const selected = this.selectedObject === child ? 'selected' : '';
            const locked = child.userData.locked ? 'locked' : '';
            const hidden = !child.visible ? 'hidden' : '';
            
            if (child.isMesh) {
                const icon = this.getObjectIcon(child);
                html += `
                    <div class="scene-item ${selected} ${locked} ${hidden}" data-uuid="${child.uuid}" data-type="mesh">
                        <i class="${icon}"></i>
                        <span>${child.type} (${child.position.x.toFixed(1)}, ${child.position.y.toFixed(1)}, ${child.position.z.toFixed(1)})</span>
                        <div class="scene-item-actions">
                            <button class="scene-item-action lock ${child.userData.locked ? 'checked' : ''}" title="Travar" onclick="event.stopPropagation(); window.editor.toggleLock('${child.uuid}')">
                                <i class="fas fa-lock"></i>
                            </button>
                            <button class="scene-item-action visibility ${child.visible ? 'checked' : ''}" title="Visibilidade" onclick="event.stopPropagation(); window.editor.toggleVisibility('${child.uuid}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="scene-item-action delete" title="Deletar" onclick="event.stopPropagation(); window.editor.deleteObject('${child.uuid}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            } else if (child.isLight) {
                const icon = this.getLightIcon(child);
                html += `
                    <div class="scene-item ${selected} ${locked} ${hidden}" data-uuid="${child.uuid}" data-type="light">
                        <i class="${icon}"></i>
                        <span>${child.type} (${child.intensity})</span>
                        <div class="scene-item-actions">
                            <button class="scene-item-action lock ${child.userData.locked ? 'checked' : ''}" title="Travar" onclick="event.stopPropagation(); window.editor.toggleLock('${child.uuid}')">
                                <i class="fas fa-lock"></i>
                            </button>
                            <button class="scene-item-action visibility ${child.visible ? 'checked' : ''}" title="Visibilidade" onclick="event.stopPropagation(); window.editor.toggleVisibility('${child.uuid}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="scene-item-action delete" title="Deletar" onclick="event.stopPropagation(); window.editor.deleteObject('${child.uuid}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }
        });
        
        panel.innerHTML = html;
        
        // Adicionar event listeners para seleção
        panel.querySelectorAll('.scene-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.scene-item-action')) {
                    const uuid = item.dataset.uuid;
                    const type = item.dataset.type;
                    
                    if (type === 'camera') {
                        this.selectObject(this.camera);
                    } else {
                        const object = this.scene.getObjectByProperty('uuid', uuid);
                        if (object) {
                            this.selectObject(object);
                        }
                    }
                }
            });
        });
    }
    
    getObjectIcon(object) {
        if (object.geometry.type === 'BoxGeometry') return 'fas fa-cube';
        if (object.geometry.type === 'SphereGeometry') return 'fas fa-circle';
        if (object.geometry.type === 'CylinderGeometry') return 'fas fa-cylinder';
        if (object.geometry.type === 'PlaneGeometry') return 'fas fa-square';
        return 'fas fa-cube';
    }
    
    getLightIcon(light) {
        if (light.type === 'AmbientLight') return 'fas fa-sun';
        if (light.type === 'DirectionalLight') return 'fas fa-lightbulb';
        if (light.type === 'PointLight') return 'fas fa-circle';
        if (light.type === 'SpotLight') return 'fas fa-lightbulb';
        return 'fas fa-lightbulb';
    }
    
    selectObjectById(uuid) {
        const object = this.scene.getObjectByProperty('uuid', uuid);
        if (object) {
            this.selectObject(object);
        }
    }
    
    toggleLock(uuid) {
        if (uuid === this.camera.uuid) {
            this.camera.userData.locked = !this.camera.userData.locked;
            console.log(`🔒 Câmera ${this.camera.userData.locked ? 'travada' : 'destravada'}`);
            
            // Se a câmera foi travada e está selecionada, deselecionar
            if (this.camera.userData.locked && this.selectedObject === this.camera) {
                this.selectedObject = null;
                this.transformControls.detach();
                this.updatePropertiesPanel();
            }
        } else {
            const object = this.scene.getObjectByProperty('uuid', uuid);
            if (object) {
                object.userData.locked = !object.userData.locked;
                console.log(`🔒 Objeto ${object.type} ${object.userData.locked ? 'travado' : 'destravado'}`);
                
                // Se o objeto foi travado e está selecionado, deselecionar
                if (object.userData.locked && this.selectedObject === object) {
                    this.selectedObject = null;
                    this.transformControls.detach();
                    this.updatePropertiesPanel();
                }
            }
        }
        this.updateScenePanel();
    }
    
    toggleVisibility(uuid) {
        if (uuid === this.camera.uuid) {
            // Câmera não pode ser escondida
            console.log('⚠️ Câmera não pode ser escondida');
            return;
        }
        
        const object = this.scene.getObjectByProperty('uuid', uuid);
        if (object) {
            object.visible = !object.visible;
            console.log(`👁️ Objeto ${object.type} ${object.visible ? 'visível' : 'escondido'}`);
            this.updateScenePanel();
        }
    }
    
    deleteObject(uuid) {
        if (uuid === this.camera.uuid) {
            console.log('⚠️ Câmera não pode ser deletada');
            return;
        }
        
        const object = this.scene.getObjectByProperty('uuid', uuid);
        if (object) {
            // Deselecionar se for o objeto selecionado
            if (this.selectedObject === object) {
                this.selectedObject = null;
                this.transformControls.detach();
                this.updatePropertiesPanel();
            }
            
            this.scene.remove(object);
            this.updateObjectCount();
            this.updateScenePanel();
            console.log(`🗑️ Objeto ${object.type} deletado`);
        }
    }
    
    updateObjectPosition(axis, value) {
        if (!this.selectedObject) return;
        
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            this.selectedObject.position[axis] = numValue;
            
            // Update transform controls if attached
            if (this.transformControls.object === this.selectedObject) {
                this.transformControls.updateMatrixWorld();
            }
            
            this.updateStatus(`Posição ${axis.toUpperCase()}: ${numValue.toFixed(2)}`);
            console.log(`Posição ${axis} atualizada para:`, numValue);
        }
    }
    
    setMaterialColor(color) {
        if (!this.selectedObject || !this.selectedObject.material) return;
        
        const hexColor = color.replace('#', '0x');
        if (Array.isArray(this.selectedObject.material)) {
            this.selectedObject.material.forEach(mat => {
                if (mat.color) mat.color.setHex(parseInt(hexColor));
            });
        } else if (this.selectedObject.material.color) {
            this.selectedObject.material.color.setHex(parseInt(hexColor));
        }
        
        this.updateStatus(`Cor alterada: ${color}`);
    }
    
    newScene() {
        // Limpar cena atual
        while (this.scene.children.length > 0) {
            const child = this.scene.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.dispose());
                } else {
                    child.material.dispose();
                }
            }
            this.scene.remove(child);
        }
        
        // Recriar cena padrão
        this.setupScene();
        this.setupDefaultScene();
        this.selectedObject = null;
        this.transformControls.detach();
        this.updateObjectCount();
        this.updatePropertiesPanel();
        
        this.updateStatus('Nova cena criada');
    }
    
    saveScene() {
        const sceneData = {
            metadata: {
                version: '1.0',
                type: 'FlashFreezeScene',
                generator: 'Flash Freeze Editor 3D'
            },
            objects: []
        };
        
        this.scene.traverse((child) => {
            if (child.isMesh) {
                sceneData.objects.push({
                    type: child.userData.type || 'mesh',
                    position: child.position.toArray(),
                    rotation: child.rotation.toArray(),
                    scale: child.scale.toArray(),
                    material: {
                        color: child.material.color.getHex()
                    }
                });
            }
        });
        
        const dataStr = JSON.stringify(sceneData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'scene.json';
        link.click();
        
        this.updateStatus('Cena salva');
    }
    
    backToGame() {
        window.location.href = '../game/index.html';
    }
    
    onWindowResize() {
        const container = document.getElementById('viewport');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    onViewportResize() {
        // Redimensionar quando o viewport mudar
        this.onWindowResize();
    }
    
    onMouseDown(event) {
        this.isMouseDown = true;
    }
    
    onMouseMove(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Atualizar coordenadas no footer
        const coordinates = document.getElementById('coordinates');
        if (coordinates && this.selectedObject) {
            const pos = this.selectedObject.position;
            coordinates.textContent = `X: ${pos.x.toFixed(2)}, Y: ${pos.y.toFixed(2)}, Z: ${pos.z.toFixed(2)}`;
        }
    }
    
    onMouseUp(event) {
        this.isMouseDown = false;
    }
    
    onClick(event) {
        if (event.target === this.renderer.domElement) {
            this.raycaster.setFromCamera(this.mouse, this.camera);
            
            // Filter out helpers, controls, locked, and invisible objects from selection
            const selectableObjects = [];
            this.scene.traverse((child) => {
                if (child.isMesh && !child.isHelper && child !== this.transformControls && !child.userData.locked && child.visible) {
                    selectableObjects.push(child);
                }
            });
            
            // Also include light helpers for selection
            this.sceneHelpers.traverse((child) => {
                if (child.userData.type === 'light-helper' && child.visible) {
                    selectableObjects.push(child);
                }
            });
            
            const intersects = this.raycaster.intersectObjects(selectableObjects, true);
            
            if (intersects.length > 0) {
                const object = intersects[0].object;
                
                // Handle light helper selection
                if (object.userData.type === 'light-helper') {
                    this.selectObject(object.userData.light);
                } else if (object.isMesh) {
                    this.selectObject(object);
                }
            } else {
                // Only deselect if clicking on empty space (not on UI elements)
                if (event.target === this.renderer.domElement) {
                    // Verificar se clicou em área vazia do viewport
                    const rect = this.renderer.domElement.getBoundingClientRect();
                    const x = event.clientX - rect.left;
                    const y = event.clientY - rect.top;
                    
                    // Só deselecionar se clicou em área realmente vazia
                    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                        this.selectedObject = null;
                        this.transformControls.detach();
                        this.updatePropertiesPanel();
                        this.updateScenePanel();
                    }
                }
            }
        }
    }
    
    onKeyDown(event) {
        if (event.key === 'Shift') {
            this.isShiftDown = true;
        }
        
        if (event.key === 'Delete' && this.selectedObject) {
            this.scene.remove(this.selectedObject);
            this.selectedObject = null;
            this.transformControls.detach();
            this.updateObjectCount();
            this.updatePropertiesPanel();
        }
    }
    
    onKeyUp(event) {
        if (event.key === 'Shift') {
            this.isShiftDown = false;
        }
    }
    
    updateObjectCount() {
        let count = 0;
        this.scene.traverse((child) => {
            if (child.isMesh) count++;
        });
        
        this.stats.objectCount = count;
        document.getElementById('object-count').textContent = `Objetos: ${count}`;
    }
    
    updateStatus(message) {
        document.getElementById('status-text').textContent = message;
    }
    
    repositionFloatingElements() {
        // Reposicionar viewport-info baseado na largura do sidebar de ferramentas
        const leftSidebar = document.getElementById('left-sidebar');
        const viewportInfo = document.querySelector('.viewport-info');
        
        if (viewportInfo && leftSidebar) {
            // Calcular posição: largura do sidebar + 40px
            const sidebarWidth = leftSidebar.offsetWidth;
            const newLeftPosition = sidebarWidth + 40;
            
            // Aplicar apenas a posição left
            viewportInfo.style.left = `${newLeftPosition}px`;
            
            // Remover right para não interferir
            viewportInfo.style.right = 'auto';
        }
    }
    
    addLightHelpers() {
        // Adicionar helpers para todas as luzes existentes
        this.scene.traverse((child) => {
            if (child.isLight) {
                this.addLightHelper(child);
            }
        });
    }
    
    addLightHelper(light) {
        let helper;
        
        if (light.isDirectionalLight) {
            // Helper para luz direcional - mostra direção e área de sombra
            helper = new THREE.DirectionalLightHelper(light, 1, 0xffff00);
            helper.userData = { type: 'light-helper', light: light };
            
            // Garantir que o helper seja selecionável
            helper.visible = true;
            helper.userData.selectable = true;
        } else if (light.isPointLight) {
            // Helper para luz pontual - mostra posição e raio
            helper = new THREE.PointLightHelper(light, 1, 0xffff00);
            helper.userData = { type: 'light-helper', light: light };
        } else if (light.isSpotLight) {
            // Helper para luz spot - mostra cone de luz
            helper = new THREE.SpotLightHelper(light, 0xffff00);
            helper.userData = { type: 'light-helper', light: light };
        } else if (light.isAmbientLight) {
            // Para luz ambiente, criar um helper customizado que segue a posição
            const geometry = new THREE.SphereGeometry(0.3, 8, 6);
            const material = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true });
            helper = new THREE.Mesh(geometry, material);
            // Luz ambiente não tem posição específica, colocar no centro
            helper.position.set(0, 2, 0);
            helper.userData = { type: 'light-helper', light: light };
            
            // Atualizar posição do helper quando a luz se move
            light.addEventListener('change', () => {
                helper.position.copy(light.position);
            });
        }
        
        if (helper) {
            this.sceneHelpers.add(helper);
            console.log('💡 Helper adicionado para luz:', light.type);
        }
    }
    
    removeLightHelper(light) {
        // Remover helper da luz
        this.sceneHelpers.traverse((child) => {
            if (child.userData.type === 'light-helper' && child.userData.light === light) {
                this.sceneHelpers.remove(child);
                console.log('💡 Helper removido para luz:', light.type);
            }
        });
    }
    
    setupSidebarControls() {
        // Toggle buttons fixed on screen edges
        const leftToggleFixed = document.getElementById('left-toggle-fixed');
        const rightToggleFixed = document.getElementById('right-toggle-fixed');
        const leftSidebar = document.getElementById('left-sidebar');
        const rightSidebar = document.getElementById('right-sidebar');
        
        // Left sidebar controls
        if (leftToggleFixed && leftSidebar) {
            leftToggleFixed.addEventListener('click', () => {
                if (leftSidebar.classList.contains('minimized')) {
                    // Expandir do estado minimizado
                    leftSidebar.classList.remove('minimized');
                    leftSidebar.classList.add('visible');
                    leftToggleFixed.classList.add('hidden');
                    // Mostrar botão de minimizar
                    const minimizeBtn = document.getElementById('left-minimize-fixed');
                    if (minimizeBtn) minimizeBtn.classList.add('visible');
                } else {
                    // Abrir normalmente
                    leftSidebar.classList.add('visible');
                    leftToggleFixed.classList.add('hidden');
                    // Mostrar botão de minimizar
                    const minimizeBtn = document.getElementById('left-minimize-fixed');
                    if (minimizeBtn) minimizeBtn.classList.add('visible');
                }
            });
        }
        
        // Botão de minimizar (fora do sidebar)
        const leftMinimizeFixed = document.getElementById('left-minimize-fixed');
        if (leftMinimizeFixed && leftSidebar) {
            leftMinimizeFixed.addEventListener('click', () => {
                leftSidebar.classList.remove('visible');
                leftSidebar.classList.add('minimized');
                leftMinimizeFixed.classList.remove('visible');
                leftToggleFixed.classList.remove('hidden');
                // Mostrar botão de expandir
                const expandBtnFixed = document.getElementById('left-expand-fixed');
                if (expandBtnFixed) expandBtnFixed.classList.add('visible');
                // Reposicionar viewport-info
                this.repositionFloatingElements();
            });
            
            // Atualizar posição do botão de minimizar quando sidebar é redimensionado
            const updateMinimizeButtonPosition = () => {
                const sidebarWidth = leftSidebar.offsetWidth;
                leftMinimizeFixed.style.left = `${sidebarWidth}px`;
            };
            
            // Observar mudanças no sidebar
            const resizeObserver = new ResizeObserver(() => {
                updateMinimizeButtonPosition();
                // Reposicionar viewport-info quando sidebar muda de tamanho
                this.repositionFloatingElements();
            });
            resizeObserver.observe(leftSidebar);
        }
        
        // Atualizar posição do botão de minimizar do sidebar direito
        const rightMinimizeFixed = document.getElementById('right-minimize-fixed');
        if (rightMinimizeFixed && rightSidebar) {
            const updateRightMinimizeButtonPosition = () => {
                const sidebarWidth = rightSidebar.offsetWidth;
                rightMinimizeFixed.style.right = `${sidebarWidth}px`;
            };
            
            // Observar mudanças no sidebar direito
            const rightResizeObserver = new ResizeObserver(updateRightMinimizeButtonPosition);
            rightResizeObserver.observe(rightSidebar);
        }
        
        // Botão de expandir do sidebar minimizado (fora do sidebar)
        const expandBtnFixed = document.getElementById('left-expand-fixed');
        if (expandBtnFixed && leftSidebar) {
            expandBtnFixed.addEventListener('click', () => {
                leftSidebar.classList.remove('minimized');
                leftSidebar.classList.add('visible');
                leftToggleFixed.classList.add('hidden');
                expandBtnFixed.classList.remove('visible');
                // Mostrar botão de minimizar
                const minimizeBtn = document.getElementById('left-minimize-fixed');
                if (minimizeBtn) minimizeBtn.classList.add('visible');
                // Reposicionar viewport-info
                this.repositionFloatingElements();
            });
        }
        
        // Right sidebar controls
        if (rightToggleFixed && rightSidebar) {
            rightToggleFixed.addEventListener('click', () => {
                rightSidebar.classList.add('visible');
                rightToggleFixed.classList.add('hidden');
                // Mostrar botão de minimizar
                const minimizeBtn = document.getElementById('right-minimize-fixed');
                if (minimizeBtn) minimizeBtn.classList.add('visible');
            });
        }
        
        // Botão de minimizar do sidebar direito (fora do sidebar) - APENAS ESCONDER
        if (rightMinimizeFixed && rightSidebar) {
            rightMinimizeFixed.addEventListener('click', () => {
                rightSidebar.classList.remove('visible');
                rightMinimizeFixed.classList.remove('visible');
                rightToggleFixed.classList.remove('hidden');
                // NÃO mostrar botão de expandir - sidebar direito não tem modo minimizado
            });
        }
        
        // Botão de expandir do sidebar direito (fora do sidebar) - REMOVIDO
        // Sidebar direito não tem modo minimizado, apenas expandido ou escondido
        
        const rightClose = document.getElementById('right-sidebar-close');
        if (rightClose && rightSidebar) {
            rightClose.addEventListener('click', () => {
                rightSidebar.classList.remove('visible');
                rightToggleFixed.classList.remove('hidden');
            });
        }
        
        // Submenu controls
        this.setupSubmenuControls();
        
        // Resize handles
        this.setupResizeHandles();
    }
    
    setupResizeHandles() {
        const leftSidebar = document.getElementById('left-sidebar');
        const rightSidebar = document.getElementById('right-sidebar');
        
        // Left sidebar resize handles
        const leftHandleLeft = document.getElementById('left-resize-handle');
        const leftHandleRight = document.getElementById('left-resize-handle-right');
        
        if (leftHandleLeft && leftSidebar) {
            this.setupResizeHandle(leftHandleLeft, leftSidebar, 'left');
        }
        if (leftHandleRight && leftSidebar) {
            this.setupResizeHandle(leftHandleRight, leftSidebar, 'right');
        }
        
        // Right sidebar resize handles
        const rightHandleLeft = document.getElementById('right-resize-handle');
        const rightHandleRight = document.getElementById('right-resize-handle-right');
        
        if (rightHandleLeft && rightSidebar) {
            this.setupResizeHandle(rightHandleLeft, rightSidebar, 'left');
        }
        if (rightHandleRight && rightSidebar) {
            this.setupResizeHandle(rightHandleRight, rightSidebar, 'right');
        }
    }
    
    setupResizeHandle(handle, sidebar, side) {
        let isResizing = false;
        
        handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.addEventListener('mousemove', handleResize);
            document.addEventListener('mouseup', stopResize);
            e.preventDefault();
        });
        
        const handleResize = (e) => {
            if (!isResizing) return;
            
            let newWidth;
            if (side === 'left') {
                if (sidebar.classList.contains('left-sidebar')) {
                    newWidth = e.clientX;
                } else {
                    newWidth = window.innerWidth - e.clientX;
                }
            } else {
                if (sidebar.classList.contains('left-sidebar')) {
                    newWidth = e.clientX;
                } else {
                    newWidth = window.innerWidth - e.clientX;
                }
            }
            
            if (newWidth >= 200 && newWidth <= 500) {
                sidebar.style.width = newWidth + 'px';
            }
        };
        
        const stopResize = () => {
            isResizing = false;
            document.removeEventListener('mousemove', handleResize);
            document.removeEventListener('mouseup', stopResize);
        };
    }
    
        initializeDefaultState() {
            // Iniciar com sidebar de ferramentas minimizado
            const leftSidebar = document.getElementById('left-sidebar');
            const leftToggleFixed = document.getElementById('left-toggle-fixed');
            const leftExpandFixed = document.getElementById('left-expand-fixed');
            
            if (leftSidebar && leftToggleFixed && leftExpandFixed) {
                leftSidebar.classList.add('minimized');
                leftToggleFixed.classList.add('hidden');
                leftExpandFixed.classList.add('visible');
            }
            
            // Reposicionar elementos flutuantes na inicialização
            setTimeout(() => {
                this.repositionFloatingElements();
            }, 100);
        }
    
        setupSubmenuControls() {
            // Função para fechar todos os submenus
            const closeAllSubmenus = () => {
                const submenus = document.querySelectorAll('.submenu');
                submenus.forEach(submenu => {
                    submenu.style.display = 'none';
                });
            };
            
            // Controles para submenus de objetos
            const objectsGroupBtn = document.getElementById('objects-group-btn');
            const objectsSubmenu = document.getElementById('objects-submenu');
            
            if (objectsGroupBtn && objectsSubmenu) {
                objectsGroupBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isOpen = objectsSubmenu.style.display === 'flex';
                    closeAllSubmenus(); // Fechar todos primeiro
                    if (!isOpen) {
                        objectsSubmenu.style.display = 'flex';
                    }
                });
            }
            
            // Controles para submenus de luzes
            const lightsGroupBtn = document.getElementById('lights-group-btn');
            const lightsSubmenu = document.getElementById('lights-submenu');
            
            if (lightsGroupBtn && lightsSubmenu) {
                lightsGroupBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isOpen = lightsSubmenu.style.display === 'flex';
                    closeAllSubmenus(); // Fechar todos primeiro
                    if (!isOpen) {
                        lightsSubmenu.style.display = 'flex';
                    }
                });
            }
            
            // Controles para submenus de import
            const importGroupBtn = document.getElementById('import-group-btn');
            const importSubmenu = document.getElementById('import-submenu');
            
            if (importGroupBtn && importSubmenu) {
                importGroupBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isOpen = importSubmenu.style.display === 'flex';
                    closeAllSubmenus(); // Fechar todos primeiro
                    if (!isOpen) {
                        importSubmenu.style.display = 'flex';
                    }
                });
            }
            
            // Fechar submenus ao clicar fora
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.group-btn-container')) {
                    closeAllSubmenus();
                }
            });
        }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        
        // Atualizar controles
        this.controls.update();
        
        // Atualizar FPS
        this.stats.fps = Math.round(1 / deltaTime);
        document.getElementById('fps-counter').textContent = `FPS: ${this.stats.fps}`;
        
        // Renderizar
        this.render();
    }
    
    render() {
        // Definir viewport (como no editor oficial)
        const container = document.getElementById('viewport');
        this.renderer.setViewport(0, 0, container.offsetWidth, container.offsetHeight);
        
        // Renderizar cena principal primeiro
        this.renderer.render(this.scene, this.camera);
        
        // Renderizar helpers com autoClear = false (como no editor oficial)
        this.renderer.autoClear = false;
        this.renderer.render(this.sceneHelpers, this.camera);
        this.renderer.autoClear = true;
        
        // Debug: verificar se objetos estão sendo renderizados (apenas quando necessário)
        const currentTime = performance.now();
        if (currentTime - this.lastRenderLogTime > this.renderLogInterval) {
            if (this.scene.children.length > 0) {
                console.log('🎨 Renderizando - Scene objects:', this.scene.children.length);
                console.log('🎨 SceneHelpers objects:', this.sceneHelpers.children.length);
            }
            this.lastRenderLogTime = currentTime;
        }
    }
}

// Inicializar editor quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.editor = new FlashFreezeEditor();
});
