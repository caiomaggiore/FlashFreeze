/**
 * GameEngine - Motor principal do jogo New War Snow
 * Gerencia renderização 3D, física e loop principal do jogo
 */
class GameEngine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.world = null; // Cannon.js physics world
        this.canvas = null;
        this.cameraControls = null;
        
        this.characters = [];
        this.snowballs = [];
        this.barriers = [];
        
        this.isRunning = false;
        this.lastTime = 0;
        
        this.init();
    }

    init() {
        console.log('Inicializando GameEngine...');
        
        // Setup canvas
        this.canvas = document.getElementById('game-canvas');
        
        // Setup Three.js
        this.setupThreeJS();
        
        // Setup Cannon.js physics
        this.setupPhysics();
        
        // Setup lighting
        this.setupLighting();
        
        // Setup camera position
        this.setupCamera();
        
        // Setup camera controls
        this.setupCameraControls();
        
        // Create ground
        this.createGround();
        
        console.log('GameEngine inicializado com sucesso!');
    }

    setupThreeJS() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xE6F3FF); // Cor de neve clara

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupPhysics() {
        // Try to use Cannon.js first, fallback to simple physics
        let CannonWorld, CannonVec3, CannonNaiveBroadphase, CannonMaterial, CannonContactMaterial;
        let CannonBody, CannonSphere, CannonBox, CannonPlane, CannonCylinder;
        let usingSimplePhysics = false;
        
        if (window.CANNON) {
            // Original Cannon.js
            CannonWorld = CANNON.World;
            CannonVec3 = CANNON.Vec3;
            CannonNaiveBroadphase = CANNON.NaiveBroadphase;
            CannonMaterial = CANNON.Material;
            CannonContactMaterial = CANNON.ContactMaterial;
            CannonBody = CANNON.Body;
            CannonSphere = CANNON.Sphere;
            CannonBox = CANNON.Box;
            CannonPlane = CANNON.Plane;
            CannonCylinder = CANNON.Cylinder;
            console.log('Usando Cannon.js original');
        } else if (window.CANNON_ES) {
            // Cannon-ES
            CannonWorld = CANNON_ES.World;
            CannonVec3 = CANNON_ES.Vec3;
            CannonNaiveBroadphase = CANNON_ES.NaiveBroadphase;
            CannonMaterial = CANNON_ES.Material;
            CannonContactMaterial = CANNON_ES.ContactMaterial;
            CannonBody = CANNON_ES.Body;
            CannonSphere = CANNON_ES.Sphere;
            CannonBox = CANNON_ES.Box;
            CannonPlane = CANNON_ES.Plane;
            CannonCylinder = CANNON_ES.Cylinder;
            console.log('Usando Cannon-ES');
        } else if (window.SimpleCannon) {
            // Fallback to simple physics
            CannonWorld = SimpleCannon.World;
            CannonVec3 = SimpleCannon.Vec3;
            CannonNaiveBroadphase = SimpleCannon.NaiveBroadphase;
            CannonMaterial = SimpleCannon.Material;
            CannonContactMaterial = SimpleCannon.ContactMaterial;
            CannonBody = SimpleCannon.Body;
            CannonSphere = SimpleCannon.Sphere;
            CannonBox = SimpleCannon.Box;
            CannonPlane = SimpleCannon.Plane;
            CannonCylinder = SimpleCannon.Cylinder;
            usingSimplePhysics = true;
            console.log('Usando sistema de física simplificado (fallback)');
        } else {
            console.error('Nenhum sistema de física disponível');
            return;
        }
        
        this.world = new CannonWorld();
        this.usingSimplePhysics = usingSimplePhysics;
        
        if (!usingSimplePhysics) {
            this.world.gravity.set(0, -9.82, 0); // Gravity
            this.world.broadphase = new CannonNaiveBroadphase();
            
            // Contact material (for snowball bouncing)
            const groundMaterial = new CannonMaterial('ground');
            const snowballMaterial = new CannonMaterial('snowball');
            
            const groundSnowballContact = new CannonContactMaterial(
                groundMaterial, 
                snowballMaterial, 
                {
                    friction: 0.3,
                    restitution: 0.2 // Small bounce
                }
            );
            
            this.world.addContactMaterial(groundSnowballContact);
        }
        
        // Store references for other classes
        window.CannonClasses = {
            World: CannonWorld,
            Vec3: CannonVec3,
            Body: CannonBody,
            Sphere: CannonSphere,
            Box: CannonBox,
            Plane: CannonPlane,
            Cylinder: CannonCylinder,
            Material: CannonMaterial,
            ContactMaterial: CannonContactMaterial
        };
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        
        // Shadow settings
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 200;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        
        this.scene.add(directionalLight);
    }

    setupCamera() {
        // Strategic camera view
        this.camera = new THREE.PerspectiveCamera(
            65, // Wide FOV for better battlefield view
            window.innerWidth / window.innerHeight, // Aspect ratio
            0.1, // Near
            1000 // Far
        );
        
        // Initial camera position (will be controlled by OrbitControls)
        this.camera.position.set(30, 35, 30);
        this.camera.lookAt(0, 0, 0);
        
        console.log('Câmera configurada - use mouse para controlar');
    }

    setupCameraControls() {
        if (typeof OrbitControls !== 'undefined') {
            this.cameraControls = new OrbitControls(this.camera, this.canvas);
            this.cameraControls.target.set(0, 0, 0);
            
            // Apply user's captured camera configuration
            this.cameraControls.setFromPosition(-12.8, 12.9, 16.8, 0.3, -2.9, 4.5);
            
            // Enable panning (X/Y movement)
            this.cameraControls.enablePan = true;
            
            console.log('Controles de câmera ativados - Mouse: rotacionar, Scroll: zoom, Shift+Mouse: pan');
        } else {
            console.warn('OrbitControls não disponível');
        }
    }

    createGround() {
        // Visual ground - improved for better visibility
        const groundGeometry = new THREE.PlaneGeometry(80, 80, 10, 10); // Larger with segments
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xF0F8FF, // Alice blue (slightly blue-tinted white)
            transparent: false,
            opacity: 1.0
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        ground.position.y = -0.1; // Below Y=0 so everything is above ground
        ground.receiveShadow = true;
        ground.isGround = true; // Mark for identification
        this.scene.add(ground);
        
        // Add grid lines at Y=0 level (reference level)
        const gridHelper = new THREE.GridHelper(80, 20, 0xCCCCCC, 0xE0E0E0);
        gridHelper.position.y = 0; // Exactly at Y=0 reference level
        this.scene.add(gridHelper);
        
        // Add coordinate axes for reference
        const axesHelper = new THREE.AxesHelper(15);
        axesHelper.position.y = 0.1;
        this.scene.add(axesHelper);
        
        // Add axis labels and rulers
        this.addAxisLabels();
        this.addAxisRulers();
        
        console.log('Chão criado com grid e eixos de coordenadas');

        // Physics ground
        const { Plane, Body, Material, Vec3 } = window.CannonClasses;
        const groundShape = new Plane();
        const groundBody = new Body({ 
            mass: 0, // Static
            material: new Material('ground')
        });
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);
        this.world.add(groundBody);
    }

    addAxisLabels() {
        // Create simple geometric labels for axes
        // X-axis label (Red block)
        const xLabelGeometry = new THREE.BoxGeometry(1.0, 0.3, 0.3);
        const xLabelMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const xLabel = new THREE.Mesh(xLabelGeometry, xLabelMaterial);
        xLabel.position.set(16, 0.5, 0);
        this.scene.add(xLabel);
        
        // Y-axis label (Green block) 
        const yLabelGeometry = new THREE.BoxGeometry(0.3, 1.0, 0.3);
        const yLabelMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const yLabel = new THREE.Mesh(yLabelGeometry, yLabelMaterial);
        yLabel.position.set(0, 16, 0);
        this.scene.add(yLabel);
        
        // Z-axis label (Blue block)
        const zLabelGeometry = new THREE.BoxGeometry(0.3, 0.3, 1.0);
        const zLabelMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        const zLabel = new THREE.Mesh(zLabelGeometry, zLabelMaterial);
        zLabel.position.set(0, 0.5, 16);
        this.scene.add(zLabel);
        
        console.log('Eixos de coordenadas adicionados: X=vermelho, Y=verde, Z=azul');
    }

    addAxisRulers() {
        // Add rulers to main axes with 0.5 unit marks
        
        // X-axis ruler (horizontal)
        for (let x = -15; x <= 15; x += 0.5) {
            if (x === 0) continue; // Skip center
            
            const tickGeometry = new THREE.BoxGeometry(0.05, 0.1, 0.05);
            const tickMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const tick = new THREE.Mesh(tickGeometry, tickMaterial);
            tick.position.set(x, 0.05, 0);
            this.scene.add(tick);
            
            // Labels every 5 units
            if (x % 5 === 0) {
                const canvas = document.createElement('canvas');
                canvas.width = 32;
                canvas.height = 16;
                const context = canvas.getContext('2d');
                
                context.fillStyle = '#ffffff';
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.fillStyle = '#ff0000';
                context.font = '12px Arial';
                context.textAlign = 'center';
                context.fillText(x.toString(), canvas.width / 2, 12);
                
                const texture = new THREE.CanvasTexture(canvas);
                const labelMaterial = new THREE.SpriteMaterial({ map: texture });
                const label = new THREE.Sprite(labelMaterial);
                label.position.set(x, 0.3, 0);
                label.scale.set(0.5, 0.25, 1);
                this.scene.add(label);
            }
        }
        
        // Z-axis ruler (depth)
        for (let z = -15; z <= 15; z += 0.5) {
            if (z === 0) continue; // Skip center
            
            const tickGeometry = new THREE.BoxGeometry(0.05, 0.1, 0.05);
            const tickMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
            const tick = new THREE.Mesh(tickGeometry, tickMaterial);
            tick.position.set(0, 0.05, z);
            this.scene.add(tick);
            
            // Labels every 5 units
            if (z % 5 === 0) {
                const canvas = document.createElement('canvas');
                canvas.width = 32;
                canvas.height = 16;
                const context = canvas.getContext('2d');
                
                context.fillStyle = '#ffffff';
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.fillStyle = '#0000ff';
                context.font = '12px Arial';
                context.textAlign = 'center';
                context.fillText(z.toString(), canvas.width / 2, 12);
                
                const texture = new THREE.CanvasTexture(canvas);
                const labelMaterial = new THREE.SpriteMaterial({ map: texture });
                const label = new THREE.Sprite(labelMaterial);
                label.position.set(0, 0.3, z);
                label.scale.set(0.5, 0.25, 1);
                this.scene.add(label);
            }
        }
        
        console.log('Réguas dos eixos adicionadas com marcas de 0.5 unidades');
    }

    addCharacter(character) {
        this.characters.push(character);
        this.scene.add(character.mesh);
        if (character.body) {
            if (this.usingSimplePhysics) {
                this.world.addBody(character.body);
            } else {
                this.world.add(character.body);
            }
        }
    }

    addSnowball(snowball) {
        this.snowballs.push(snowball);
        this.scene.add(snowball.mesh);
        if (snowball.body) {
            if (this.usingSimplePhysics) {
                this.world.addBody(snowball.body);
            } else {
                this.world.add(snowball.body);
            }
        }
    }

    addBarrier(barrier) {
        this.barriers.push(barrier);
        this.scene.add(barrier.mesh);
        if (barrier.body) {
            if (this.usingSimplePhysics) {
                this.world.addBody(barrier.body);
            } else {
                this.world.add(barrier.body);
            }
        }
    }

    removeSnowball(snowball) {
        const index = this.snowballs.indexOf(snowball);
        if (index > -1) {
            this.snowballs.splice(index, 1);
            this.scene.remove(snowball.mesh);
            if (snowball.body) {
                if (this.usingSimplePhysics) {
                    this.world.removeBody(snowball.body);
                } else {
                    this.world.remove(snowball.body);
                }
            }
        }
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now();
            this.gameLoop();
            console.log('Game loop iniciado!');
        }
    }

    stop() {
        this.isRunning = false;
        console.log('Game loop parado!');
    }

    gameLoop() {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;

        // Update physics
        this.world.step(deltaTime);

        // Update characters
        this.characters.forEach(character => {
            character.update(deltaTime);
        });

        // Update snowballs
        for (let i = this.snowballs.length - 1; i >= 0; i--) {
            const snowball = this.snowballs[i];
            snowball.update(deltaTime);
            
            // Remove snowballs that are too far or old
            if (snowball.shouldRemove()) {
                this.removeSnowball(snowball);
            }
        }

        // Render
        this.renderer.render(this.scene, this.camera);

        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Get characters by team
    getPlayerCharacters() {
        return this.characters.filter(char => char.team === 'player');
    }

    getEnemyCharacters() {
        return this.characters.filter(char => char.team === 'enemy');
    }

    // Utility methods
    getWorldPosition(screenX, screenY) {
        // Convert screen coordinates to world coordinates
        const mouse = new THREE.Vector2();
        mouse.x = (screenX / window.innerWidth) * 2 - 1;
        mouse.y = -(screenY / window.innerHeight) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);

        // Intersect with ground plane
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, intersection);

        return intersection;
    }
}
