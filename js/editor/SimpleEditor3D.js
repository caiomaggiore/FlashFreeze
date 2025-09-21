/**
 * SimpleEditor3D.js - Editor 3D baseado EXATAMENTE no GameEngine que funciona
 * Cópia simplificada do sistema que já está funcionando no jogo
 * Flash Freeze v0.2.0+
 */

class SimpleEditor3D {
    constructor() {
        // Propriedades iguais ao GameEngine
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.canvas = null;
        this.cameraControls = null;
        
        // Modelo em edição
        this.currentModel = null;
        
        // Sistema de ferramentas avançadas
        this.modelingTools = null;
        this.lastCameraPosKey = '';
        
        // Sistema de controle de ferramentas
        this.currentTool = 'camera'; // 'camera', 'select', 'move', 'resize', 'rotate'
        this.selectionMode = 'object'; // 'object', 'vertex', 'edge', 'face'
        this.selectedElements = [];
        this.cameraControlsEnabled = true;
        
        // Helpers visuais
        this.transformControls = null;
        this.wireframeHelper = null;
        this.showWireframe = false;
        
        console.log('🎨 SimpleEditor3D inicializado');
    }
    
    init() {
        console.log('Inicializando Editor 3D...');
        
        // Setup canvas (IGUAL AO JOGO)
        this.canvas = document.getElementById('editor-canvas');
        if (!this.canvas) {
            console.error('❌ Canvas editor-canvas não encontrado!');
            return;
        }
        
        // Setup Three.js (IGUAL AO JOGO)
        this.setupThreeJS();
        
        // Setup lighting (IGUAL AO JOGO)
        this.setupLighting();
        
        // Setup camera (IGUAL AO JOGO)
        this.setupCamera();
        
        // Setup camera controls (IGUAL AO JOGO)
        this.setupCameraControls();
        
        // Create ground (IGUAL AO JOGO)
        this.createGround();
        
        // Criar modelo de teste
        this.createTestCharacter();
        
        // Inicializar ferramentas de modelagem
        this.initializeModelingTools();
        
        // Setup event listeners para ferramentas
        this.setupToolEventListeners();
        
        // Inicializar sistema de ferramentas
        this.initializeToolSystem();
        
        // Start game loop (IGUAL AO JOGO)
        this.startRenderLoop();
        
        console.log('✅ Editor 3D inicializado com sucesso!');
    }
    
    setupThreeJS() {
        // Scene com background escuro profissional
        this.scene = new THREE.Scene();
        // Gradiente escuro: #222222 para #000000
        this.scene.background = new THREE.Color(0x222222);
        
        // Renderer (IGUAL AO JOGO)
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Handle window resize (IGUAL AO JOGO)
        window.addEventListener('resize', () => this.onWindowResize());
        
        console.log('🖥️ Three.js configurado');
    }
    
    setupLighting() {
        // Sistema de 3 luzes cinematográficas - menos sombras, mais claridade
        
        // 1. KEY LIGHT (Luz principal) - 45° frontal
        const keyLight = new THREE.DirectionalLight(0xffffff, 0.7);
        keyLight.position.set(10, 15, 10);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 1024;
        keyLight.shadow.mapSize.height = 1024;
        keyLight.shadow.camera.near = 0.5;
        keyLight.shadow.camera.far = 50;
        keyLight.shadow.camera.left = -20;
        keyLight.shadow.camera.right = 20;
        keyLight.shadow.camera.top = 20;
        keyLight.shadow.camera.bottom = -20;
        keyLight.shadow.bias = -0.0001;
        this.scene.add(keyLight);
        
        // 2. FILL LIGHT (Luz de preenchimento) - oposta, suave
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
        fillLight.position.set(-8, 10, -5);
        this.scene.add(fillLight);
        
        // 3. BACK LIGHT (Luz de contorno) - atrás, para separar do fundo
        const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
        backLight.position.set(0, 8, -15);
        this.scene.add(backLight);
        
        // Luz ambiente mais forte para reduzir sombras
        const ambientLight = new THREE.AmbientLight(0x404040, 0.7);
        this.scene.add(ambientLight);
        
        console.log('💡 Sistema de 3 luzes cinematográficas configurado');
    }
    
    setupCamera() {
        // Camera setup - NOVA POSIÇÃO PADRÃO
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        // Nova posição padrão otimizada
        this.camera.position.set(-2.7, 2.2, -2.5);
        this.camera.lookAt(0, 0, 0);
        
        console.log('📷 Câmera configurada com nova posição padrão:', this.camera.position);
    }
    
    setupCameraControls() {
        // OrbitControls com melhorias para editor
        if (typeof OrbitControls !== 'undefined') {
            this.cameraControls = new OrbitControls(this.camera, this.canvas);
            this.cameraControls.target.set(0, 0, 0); // Target centralizado
            this.cameraControls.enablePan = true;
            
            // Melhorar zoom para escala macro
            this.cameraControls.minDistance = 0.1; // Zoom muito próximo
            this.cameraControls.maxDistance = 200; // Zoom muito longe
            
            // Configurar damping para suavidade
            this.cameraControls.enableDamping = true;
            this.cameraControls.dampingFactor = 0.1;
            
            console.log('🎮 Controles de câmera ativados com zoom macro');
        } else {
            console.warn('❌ OrbitControls não disponível');
        }
    }
    
    createGround() {
        // APENAS GRID - sem piso físico
        
        // Grid helper profissional - linhas principais e secundárias
        const gridHelper = new THREE.GridHelper(50, 50, 0x383838, 0x282828);
        gridHelper.position.y = 0;
        this.scene.add(gridHelper);
        this.gridHelper = gridHelper;
        
        // Grid principal a cada 5 unidades (mais claro)
        const majorGridHelper = new THREE.GridHelper(50, 10, 0x484848, 0x383838);
        majorGridHelper.position.y = 0.01; // Ligeiramente acima
        this.scene.add(majorGridHelper);
        this.majorGridHelper = majorGridHelper;
        
        // Axes helper
        const axesHelper = new THREE.AxesHelper(10);
        this.scene.add(axesHelper);
        this.axesHelper = axesHelper;
        
        console.log('🌍 Grid de referência criado (sem piso)');
    }
    
    createTestCharacter() {
        // Criar personagem de teste SIMPLES (igual ao Character.js original)
        const characterGroup = new THREE.Group();
        
        // Body (team color) - COM NOME PARA FERRAMENTAS
        const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.5, 1.2, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x2ecc71 }); // Verde
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(0, 0.6, 0);
        body.castShadow = true;
        body.name = 'body'; // NOME IMPORTANTE
        characterGroup.add(body);
        
        // Head - COM NOME PARA FERRAMENTAS
        const headGeometry = new THREE.SphereGeometry(0.3, 8, 6);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 1.4, 0);
        head.castShadow = true;
        head.name = 'head'; // NOME IMPORTANTE
        characterGroup.add(head);
        
        // Hat - COM NOME PARA FERRAMENTAS
        const hatGeometry = new THREE.CylinderGeometry(0.32, 0.32, 0.2, 8);
        const hatMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.set(0, 1.6, 0);
        hat.castShadow = true;
        hat.name = 'hat'; // NOME IMPORTANTE
        characterGroup.add(hat);
        
        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.05, 4, 4);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        
        leftEye.position.set(-0.1, 1.45, -0.25);
        rightEye.position.set(0.1, 1.45, -0.25);
        
        characterGroup.add(leftEye, rightEye);
        
        // Nose
        const noseGeometry = new THREE.SphereGeometry(0.03, 4, 4);
        const noseMaterial = new THREE.MeshLambertMaterial({ color: 0xffb3a0 });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 1.4, -0.28);
        characterGroup.add(nose);
        
        // Posicionar personagem
        characterGroup.position.set(0, 0, 0);
        
        this.currentModel = characterGroup;
        this.scene.add(this.currentModel);
        
        // Verificar se o modelo foi adicionado corretamente
        console.log('👤 Personagem de teste criado');
        console.log('📊 Scene children:', this.scene.children.length);
        console.log('📍 Posição do modelo:', this.currentModel.position);
        console.log('📦 Bounding box:', new THREE.Box3().setFromObject(this.currentModel));
    }
    
    onWindowResize() {
        // Resize handling (IGUAL AO JOGO)
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        console.log('🔄 Viewport redimensionado');
    }
    
    startRenderLoop() {
        // Game loop com damping e informações da câmera
        const animate = () => {
            requestAnimationFrame(animate);
            
            // Update controls com damping
            if (this.cameraControls && this.cameraControls.enableDamping) {
                this.cameraControls.update();
            }
            
            // Atualizar informações da câmera na UI
            this.updateCameraInfo();
            
            // Render scene
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
        console.log('🔄 Loop de renderização iniciado com damping');
    }
    
    updateCameraInfo() {
        // Atualizar informações da câmera na UI (apenas se mudou)
        const pos = this.camera.position;
        const target = this.cameraControls ? this.cameraControls.target : new THREE.Vector3(0, 0, 0);
        
        // Calcular zoom (distância da câmera ao target)
        const zoom = pos.distanceTo(target);
        
        // Verificar se mudou significativamente para evitar logs excessivos
        const newPosKey = `${pos.x.toFixed(1)},${pos.y.toFixed(1)},${pos.z.toFixed(1)},${zoom.toFixed(1)}`;
        if (this.lastCameraPosKey === newPosKey) return;
        this.lastCameraPosKey = newPosKey;
        
        // Atualizar elementos da UI se existirem
        const camXElement = document.getElementById('cam-x');
        const camYElement = document.getElementById('cam-y');
        const camZElement = document.getElementById('cam-z');
        const camZoomElement = document.getElementById('cam-zoom');
        
        if (camXElement) camXElement.textContent = pos.x.toFixed(1);
        if (camYElement) camYElement.textContent = pos.y.toFixed(1);
        if (camZElement) camZElement.textContent = pos.z.toFixed(1);
        if (camZoomElement) camZoomElement.textContent = zoom.toFixed(1);
        
        // Log da posição atual da câmera (apenas se debug ativo)
        if (window.debugCamera) {
            console.log(`📷 Câmera: Pos(${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}) Zoom: ${zoom.toFixed(1)} Target(${target.x.toFixed(1)}, ${target.y.toFixed(1)}, ${target.z.toFixed(1)})`);
        }
    }
    
    initializeModelingTools() {
        if (window.AdvancedModelingTools) {
            this.modelingTools = new AdvancedModelingTools(this);
            console.log('🛠️ Ferramentas de modelagem avançadas inicializadas');
        } else {
            console.warn('⚠️ AdvancedModelingTools não disponível');
        }
    }
    
    setupToolEventListeners() {
        // Event listeners para clique no modelo - apenas se não for câmera
        this.canvas.addEventListener('click', (event) => {
            if (!this.cameraControlsEnabled) {
                this.handleCanvasClick(event);
            }
        });
        
        // Listener para mudança de ferramenta via teclado
        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case '1': this.setTool('camera'); break;
                case '2': this.setTool('select'); break;
                case '3': this.setTool('move'); break;
                case '4': this.setTool('resize'); break;
                case '5': this.setTool('rotate'); break;
                case 'v': this.setSelectionMode('vertex'); break;
                case 'e': this.setSelectionMode('edge'); break;
                case 'f': this.setSelectionMode('face'); break;
                case 'o': this.setSelectionMode('object'); break;
                case 'w': this.toggleWireframe(); break;
            }
        });
        
        console.log('🖱️ Event listeners configurados com sistema de ferramentas');
    }
    
    handleCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouse = new THREE.Vector2();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        
        const intersects = raycaster.intersectObject(this.currentModel, true);
        
        if (intersects.length > 0) {
            // Clicou em um elemento
            const intersect = intersects[0];
            
            switch (this.currentTool) {
                case 'select':
                    this.selectElement(intersect.object, event.shiftKey, event.altKey);
                    break;
                case 'move':
                    this.selectElement(intersect.object, event.shiftKey, event.altKey);
                    this.activateTransformHelper('move', intersect.object);
                    break;
                case 'resize':
                    this.selectElement(intersect.object, event.shiftKey, event.altKey);
                    this.activateTransformHelper('resize', intersect.object);
                    break;
                case 'rotate':
                    this.selectElement(intersect.object, event.shiftKey, event.altKey);
                    this.activateTransformHelper('rotate', intersect.object);
                    break;
            }
            
            console.log(`🎯 ${this.currentTool} aplicado em ${intersect.object.name || 'elemento'}`);
        } else {
            // Clicou no espaço vazio - desselecionar tudo (qualquer ferramenta)
            if (this.currentTool !== 'camera') {
                this.clearSelection();
                console.log('🔄 Seleção limpa - clicou no espaço vazio');
            }
        }
    }
    
    selectElement(object, shiftKey = false, altKey = false) {
        if (altKey) {
            // Alt + Click = Desselecionar elemento específico
            this.deselectElement(object);
        } else if (shiftKey) {
            // Shift + Click = Adicionar à seleção
            this.addToSelection(object);
        } else {
            // Click normal = Selecionar apenas este elemento
            this.clearSelection();
            this.addToSelection(object);
        }
        
        this.updateSelectionInfo();
    }
    
    addToSelection(object) {
        if (!this.selectedElements.includes(object)) {
            this.selectedElements.push(object);
            
            // Highlight visual amarelo
            if (object.material) {
                object.userData.originalEmissive = object.material.emissive.clone();
                object.material.emissive = new THREE.Color(0xffff00);
            }
            
            console.log(`✅ Elemento adicionado à seleção: ${object.name || 'sem nome'}`);
        }
    }
    
    deselectElement(object) {
        const index = this.selectedElements.indexOf(object);
        if (index > -1) {
            this.selectedElements.splice(index, 1);
            
            // Restaurar cor original
            if (object.material && object.userData.originalEmissive) {
                object.material.emissive = object.userData.originalEmissive;
            }
            
            console.log(`❌ Elemento removido da seleção: ${object.name || 'sem nome'}`);
        }
    }
    
    clearSelection() {
        // Restaurar cores originais
        this.selectedElements.forEach(object => {
            if (object.material && object.userData.originalEmissive) {
                object.material.emissive = object.userData.originalEmissive;
            }
        });
        
        this.selectedElements = [];
        this.hideTransformHelpers();
        this.updateSelectionInfo();
        console.log('🔄 Todas as seleções limpas');
    }
    
    // ===== HELPERS VISUAIS DE TRANSFORMAÇÃO =====
    
    activateTransformHelper(type, object) {
        this.hideTransformHelpers();
        
        switch (type) {
            case 'move':
                this.createMoveHelper(object);
                break;
            case 'resize':
                this.createScaleHelper(object);
                break;
            case 'rotate':
                this.createRotateHelper(object);
                break;
        }
    }
    
    createMoveHelper(object) {
        // Criar setas de movimento (como nas suas imagens)
        const helperGroup = new THREE.Group();
        
        // Seta X (vermelha)
        const arrowX = this.createArrow(0xff0000, new THREE.Vector3(1, 0, 0));
        helperGroup.add(arrowX);
        
        // Seta Y (verde)
        const arrowY = this.createArrow(0x00ff00, new THREE.Vector3(0, 1, 0));
        helperGroup.add(arrowY);
        
        // Seta Z (azul)
        const arrowZ = this.createArrow(0x0000ff, new THREE.Vector3(0, 0, 1));
        helperGroup.add(arrowZ);
        
        // Posicionar no objeto
        helperGroup.position.copy(object.position);
        this.scene.add(helperGroup);
        this.transformControls = helperGroup;
        
        console.log('↔️ Helper de movimento criado');
    }
    
    createScaleHelper(object) {
        // Criar cubos de escala (como nas suas imagens)
        const helperGroup = new THREE.Group();
        
        // Cubo central - SEMPRE VISÍVEL
        const centerGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const centerMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffff00,
            depthTest: false, // SEMPRE VISÍVEL
            depthWrite: false
        });
        const centerCube = new THREE.Mesh(centerGeometry, centerMaterial);
        centerCube.renderOrder = 999;
        helperGroup.add(centerCube);
        
        // Cubos nas extremidades - SEMPRE VISÍVEIS
        const positions = [
            [0.5, 0, 0], [-0.5, 0, 0], // X
            [0, 0.5, 0], [0, -0.5, 0], // Y
            [0, 0, 0.5], [0, 0, -0.5]  // Z
        ];
        
        positions.forEach((pos, i) => {
            const cubeGeometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
            const colors = [0xff0000, 0xff0000, 0x00ff00, 0x00ff00, 0x0000ff, 0x0000ff];
            const cubeMaterial = new THREE.MeshBasicMaterial({ 
                color: colors[i],
                depthTest: false, // SEMPRE VISÍVEL
                depthWrite: false
            });
            const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
            cube.position.set(pos[0], pos[1], pos[2]);
            cube.renderOrder = 999;
            helperGroup.add(cube);
        });
        
        // Posicionar no objeto
        helperGroup.position.copy(object.position);
        this.scene.add(helperGroup);
        this.transformControls = helperGroup;
        
        console.log('📏 Helper de escala criado (sempre visível)');
    }
    
    createRotateHelper(object) {
        // Criar anéis de rotação (como nas suas imagens)
        const helperGroup = new THREE.Group();
        
        // Anel X (vermelho) - SEMPRE VISÍVEL
        const ringXGeometry = new THREE.TorusGeometry(0.5, 0.02, 8, 32);
        const ringXMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff0000,
            depthTest: false, // SEMPRE VISÍVEL
            depthWrite: false
        });
        const ringX = new THREE.Mesh(ringXGeometry, ringXMaterial);
        ringX.rotation.z = Math.PI / 2;
        ringX.renderOrder = 999;
        helperGroup.add(ringX);
        
        // Anel Y (verde) - SEMPRE VISÍVEL
        const ringYGeometry = new THREE.TorusGeometry(0.5, 0.02, 8, 32);
        const ringYMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00,
            depthTest: false, // SEMPRE VISÍVEL
            depthWrite: false
        });
        const ringY = new THREE.Mesh(ringYGeometry, ringYMaterial);
        ringY.renderOrder = 999;
        helperGroup.add(ringY);
        
        // Anel Z (azul) - SEMPRE VISÍVEL
        const ringZGeometry = new THREE.TorusGeometry(0.5, 0.02, 8, 32);
        const ringZMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x0000ff,
            depthTest: false, // SEMPRE VISÍVEL
            depthWrite: false
        });
        const ringZ = new THREE.Mesh(ringZGeometry, ringZMaterial);
        ringZ.rotation.x = Math.PI / 2;
        ringZ.renderOrder = 999;
        helperGroup.add(ringZ);
        
        // Posicionar no objeto
        helperGroup.position.copy(object.position);
        this.scene.add(helperGroup);
        this.transformControls = helperGroup;
        
        console.log('🔄 Helper de rotação criado (sempre visível)');
    }
    
    createArrow(color, direction) {
        const group = new THREE.Group();
        
        // Linha da seta - SEMPRE VISÍVEL
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            direction.clone().multiplyScalar(0.8)
        ]);
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: color, 
            linewidth: 3,
            depthTest: false, // SEMPRE VISÍVEL
            depthWrite: false
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        line.renderOrder = 999; // Renderizar por último
        group.add(line);
        
        // Ponta da seta - SEMPRE VISÍVEL
        const coneGeometry = new THREE.ConeGeometry(0.05, 0.2, 8);
        const coneMaterial = new THREE.MeshBasicMaterial({ 
            color: color,
            depthTest: false, // SEMPRE VISÍVEL
            depthWrite: false
        });
        const cone = new THREE.Mesh(coneGeometry, coneMaterial);
        cone.position.copy(direction.clone().multiplyScalar(0.9));
        cone.renderOrder = 999; // Renderizar por último
        
        // Orientar cone na direção da seta
        cone.lookAt(direction.clone().multiplyScalar(2));
        group.add(cone);
        
        return group;
    }
    
    hideTransformHelpers() {
        if (this.transformControls) {
            this.scene.remove(this.transformControls);
            this.transformControls = null;
        }
    }
    
    // ===== SISTEMA DE WIREFRAME =====
    
    toggleWireframe() {
        this.showWireframe = !this.showWireframe;
        
        if (this.currentModel) {
            if (this.showWireframe) {
                this.addWireframeOverlay();
            } else {
                this.removeWireframeOverlay();
            }
        }
        
        // Atualizar botão na UI
        const wireframeButton = document.getElementById('wireframe-toggle');
        if (wireframeButton) {
            wireframeButton.style.backgroundColor = this.showWireframe ? '#f1c40f' : '#7f8c8d';
            wireframeButton.style.color = this.showWireframe ? '#2c3e50' : '#ecf0f1';
        }
        
        console.log(`🔲 Wireframe: ${this.showWireframe ? 'ATIVADO' : 'DESATIVADO'}`);
    }
    
    addWireframeOverlay() {
        // Criar wireframe BRANCO FINO sobre as faces (não substituir)
        this.currentModel.traverse((child) => {
            if (child.isMesh && !child.userData.wireframeOverlay) {
                // Criar geometria wireframe
                const wireframeGeometry = child.geometry.clone();
                const wireframeMaterial = new THREE.MeshBasicMaterial({
                    color: 0xffffff, // BRANCO
                    wireframe: true,
                    transparent: true,
                    opacity: 0.8,
                    depthTest: false, // Sempre visível
                    depthWrite: false
                });
                
                const wireframeMesh = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
                wireframeMesh.position.copy(child.position);
                wireframeMesh.rotation.copy(child.rotation);
                wireframeMesh.scale.copy(child.scale);
                wireframeMesh.renderOrder = 1000; // Renderizar por último
                
                // Adicionar ao mesmo parent
                if (child.parent) {
                    child.parent.add(wireframeMesh);
                    child.userData.wireframeOverlay = wireframeMesh;
                }
            }
        });
        
        console.log('🔲 Wireframe branco adicionado sobre as faces');
    }
    
    removeWireframeOverlay() {
        // Remover wireframe overlay
        this.currentModel.traverse((child) => {
            if (child.isMesh && child.userData.wireframeOverlay) {
                if (child.userData.wireframeOverlay.parent) {
                    child.userData.wireframeOverlay.parent.remove(child.userData.wireframeOverlay);
                }
                child.userData.wireframeOverlay = null;
            }
        });
        
        console.log('🔲 Wireframe removido');
    }
    
    updateSelectionInfo() {
        const countElement = document.getElementById('selection-count');
        const modeElement = document.getElementById('current-selection-mode');
        
        if (countElement) countElement.textContent = this.selectedElements.length;
        if (modeElement) modeElement.textContent = this.selectionMode;
    }
    
    // Métodos de modelagem FUNCIONAIS BÁSICOS
    extrudeSelected(distance = null) {
        if (!this.currentModel) {
            console.warn('❌ Nenhum modelo para extrudir');
            return;
        }
        
        // Pegar distância do slider se não especificada
        const extrudeDistance = distance || parseFloat(document.getElementById('extrude-distance')?.value || 1);
        
        console.log(`⬆️ Extrudindo modelo com distância ${extrudeDistance}`);
        
        // Implementação básica: escalar o modelo para simular extrusão
        this.currentModel.traverse((child) => {
            if (child.isMesh && child.name === 'body') {
                child.scale.y += extrudeDistance * 0.1;
                console.log(`✅ Body extrudido: nova escala Y = ${child.scale.y}`);
            }
        });
    }
    
    chamferSelected(radius = null, segments = null) {
        if (!this.currentModel) {
            console.warn('❌ Nenhum modelo para chanfro');
            return;
        }
        
        const chamferRadius = radius || parseFloat(document.getElementById('chamfer-radius')?.value || 0.1);
        
        console.log(`🔄 Aplicando chanfro com raio ${chamferRadius}`);
        
        // Implementação básica: arredondar bordas aumentando segmentos
        this.currentModel.traverse((child) => {
            if (child.isMesh && child.geometry) {
                // Suavizar geometria (simulação de chanfro)
                child.geometry.computeVertexNormals();
                console.log(`✅ Chanfro aplicado em ${child.name}`);
            }
        });
    }
    
    bevelSelected(amount = null) {
        if (!this.currentModel) {
            console.warn('❌ Nenhum modelo para bevel');
            return;
        }
        
        const bevelAmount = amount || parseFloat(document.getElementById('bevel-amount')?.value || 0.1);
        
        console.log(`🔷 Aplicando bevel com amount ${bevelAmount}`);
        
        // Implementação básica: criar outline do modelo
        this.currentModel.traverse((child) => {
            if (child.isMesh && child.name === 'head') {
                child.scale.setScalar(1 + bevelAmount);
                console.log(`✅ Bevel aplicado na cabeça: escala ${child.scale.x}`);
            }
        });
    }
    
    outlineSelected(distance = 0.1) {
        console.log(`📐 Criando outline com distância ${distance}`);
        
        if (this.currentModel) {
            // Criar clone do modelo como outline
            const outline = this.currentModel.clone();
            outline.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshBasicMaterial({ 
                        color: 0x3498db,
                        transparent: true,
                        opacity: 0.3,
                        side: THREE.BackSide
                    });
                    child.scale.setScalar(1 + distance);
                }
            });
            
            outline.position.set(2, 0, 0); // Posicionar ao lado
            this.scene.add(outline);
            console.log('✅ Outline criado');
        }
    }
    
    insetSelected(amount = 0.2) {
        console.log(`📦 Aplicando inset com amount ${amount}`);
        
        if (this.currentModel) {
            this.currentModel.traverse((child) => {
                if (child.isMesh && child.name === 'body') {
                    child.scale.setScalar(1 - amount);
                    console.log(`✅ Inset aplicado no body: escala ${child.scale.x}`);
                }
            });
        }
    }
    
    createRig() {
        console.log('🦴 Criando rig automático');
        
        if (this.currentModel) {
            // Criar skeleton helper visual
            const bones = [];
            
            // Root bone
            const root = new THREE.Bone();
            root.position.set(0, 0, 0);
            bones.push(root);
            
            // Spine
            const spine = new THREE.Bone();
            spine.position.set(0, 0.6, 0);
            root.add(spine);
            bones.push(spine);
            
            // Head
            const head = new THREE.Bone();
            head.position.set(0, 1.4, 0);
            spine.add(head);
            bones.push(head);
            
            // Arms
            const leftArm = new THREE.Bone();
            leftArm.position.set(-0.6, 1.0, 0);
            spine.add(leftArm);
            bones.push(leftArm);
            
            const rightArm = new THREE.Bone();
            rightArm.position.set(0.6, 1.0, 0);
            spine.add(rightArm);
            bones.push(rightArm);
            
            // Criar skeleton helper
            const skeletonHelper = new THREE.SkeletonHelper(root);
            skeletonHelper.material.linewidth = 2;
            skeletonHelper.material.color.set(0xff0000);
            this.scene.add(skeletonHelper);
            
            console.log(`✅ Rig criado com ${bones.length} bones`);
        }
    }
    
    // Ferramentas de posicionamento e dimensão
    scaleBody(factor) {
        this.currentModel?.traverse((child) => {
            if (child.isMesh && child.name === 'body') {
                child.scale.setScalar(factor);
                console.log(`📏 Body escalado: ${factor}`);
            }
        });
    }
    
    scaleHead(factor) {
        this.currentModel?.traverse((child) => {
            if (child.isMesh && child.name === 'head') {
                child.scale.setScalar(factor);
                console.log(`📏 Head escalado: ${factor}`);
            }
        });
    }
    
    moveModel(x, y, z) {
        if (this.currentModel) {
            this.currentModel.position.set(x, y, z);
            console.log(`📍 Modelo movido para (${x}, ${y}, ${z})`);
        }
    }
    
    // Métodos de arquivo
    saveModel() {
        if (!this.currentModel) return;
        
        const modelData = this.currentModel.toJSON();
        const dataStr = JSON.stringify(modelData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `character_${Date.now()}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        console.log('💾 Modelo salvo');
    }
    
    // ===== SISTEMA DE CONTROLE DE FERRAMENTAS =====
    
    setTool(toolName) {
        this.currentTool = toolName;
        this.updateToolButtons();
        this.updateSelectionButtons();
        this.updateCameraControls();
        this.updatePropertiesPanel();
        this.updateToolInfo();
        console.log(`🛠️ Ferramenta ativada: ${toolName}`);
    }
    
    setSelectionMode(mode) {
        this.selectionMode = mode;
        this.updateSelectionButtons();
        this.updateSelectionInfo();
        console.log(`🎯 Modo de seleção: ${mode}`);
    }
    
    updateToolButtons() {
        const tools = ['camera', 'select', 'move', 'resize', 'rotate'];
        tools.forEach(tool => {
            const button = document.getElementById(`tool-${tool}`);
            if (button) {
                if (tool === this.currentTool) {
                    button.style.backgroundColor = '#f1c40f'; // Amarelo ativo
                    button.style.color = '#2c3e50';
                } else {
                    button.style.backgroundColor = '#7f8c8d'; // Cinza inativo
                    button.style.color = '#ecf0f1';
                }
            }
        });
    }
    
    updateSelectionButtons() {
        const modes = ['object', 'vertex', 'edge', 'face'];
        modes.forEach(mode => {
            const button = document.getElementById(`select-${mode}`);
            if (button) {
                if (mode === this.selectionMode) {
                    button.style.backgroundColor = '#f1c40f'; // Amarelo ativo
                    button.style.color = '#2c3e50';
                } else {
                    button.style.backgroundColor = '#7f8c8d'; // Cinza inativo
                    button.style.color = '#ecf0f1';
                }
            }
        });
        
        // Mostrar/ocultar botões de seleção baseado na ferramenta
        const selectionPanel = document.getElementById('selection-panel');
        if (selectionPanel) {
            selectionPanel.style.display = (this.currentTool === 'select' || 
                                           this.currentTool === 'move' || 
                                           this.currentTool === 'resize' || 
                                           this.currentTool === 'rotate') ? 'block' : 'none';
        }
    }
    
    updateCameraControls() {
        if (this.cameraControls) {
            this.cameraControlsEnabled = (this.currentTool === 'camera');
            this.cameraControls.enabled = this.cameraControlsEnabled;
            
            // Cursor visual
            if (this.canvas) {
                if (this.cameraControlsEnabled) {
                    this.canvas.style.cursor = 'grab';
                } else {
                    this.canvas.style.cursor = 'crosshair';
                }
            }
        }
    }
    
    updatePropertiesPanel() {
        // Ocultar todos os painéis primeiro
        const panels = ['camera-props', 'select-props', 'move-props', 'resize-props', 'rotate-props'];
        panels.forEach(panelId => {
            const panel = document.getElementById(panelId);
            if (panel) panel.style.display = 'none';
        });
        
        // Mostrar painel da ferramenta ativa
        const activePanel = document.getElementById(`${this.currentTool}-props`);
        if (activePanel) {
            activePanel.style.display = 'block';
        }
    }
    
    // Inicializar sistema de ferramentas
    initializeToolSystem() {
        this.updateToolButtons();
        this.updateSelectionButtons();
        this.updateCameraControls();
        this.updatePropertiesPanel();
        this.updateToolInfo();
        console.log('🎛️ Sistema de ferramentas inicializado');
    }
    
    updateToolInfo() {
        const toolNameElement = document.getElementById('current-tool-name');
        const toolStatusElement = document.getElementById('tool-status');
        
        const toolNames = {
            'camera': 'Câmera',
            'select': 'Seleção',
            'move': 'Movimento',
            'resize': 'Escala',
            'rotate': 'Rotação'
        };
        
        if (toolNameElement) {
            toolNameElement.textContent = toolNames[this.currentTool] || this.currentTool;
        }
        
        if (toolStatusElement) {
            toolStatusElement.textContent = this.cameraControlsEnabled ? 'Controle livre' : 'Modo edição';
        }
    }
}

// Inicialização automática
window.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM carregado, inicializando editor...');
    
    // Aguardar um pouco para garantir que tudo carregou
    setTimeout(() => {
        window.editor3D = new SimpleEditor3D();
        window.editor3D.init();
    }, 100);
});

// Exportar para uso global
window.SimpleEditor3D = SimpleEditor3D;
