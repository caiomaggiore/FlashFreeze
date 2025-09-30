/**
 * Barrier - Barreira de gelo que oferece proteção
 * Funciona como cobertura contra projéteis, exceto quando vêm de cima
 */
class Barrier {
    constructor(x, z, width = 2, height = 2, depth = 0.5) {
        this.position = { x, z };
        this.dimensions = { width, height, depth };
        
        // Visual and physics
        this.mesh = null;
        this.body = null;
        
        this.init();
    }

    init() {
        this.createMesh();
        this.createPhysicsBody();
    }

    createMesh() {
        // Ice barrier visual
        const geometry = new THREE.BoxGeometry(
            this.dimensions.width,
            this.dimensions.height,
            this.dimensions.depth
        );
        
        // Ice-like material
        const material = new THREE.MeshLambertMaterial({ 
            color: 0x87CEEB, // Light blue ice color
            transparent: true,
            opacity: 0.7
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(
            this.position.x, 
            this.dimensions.height / 2, // Center vertically
            this.position.z
        );
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Add ice texture effect
        this.addIceEffect();
    }

    addIceEffect() {
        // Add some sparkle points to make it look more icy
        const sparkleGeometry = new THREE.BufferGeometry();
        const sparkleCount = 30;
        const positions = new Float32Array(sparkleCount * 3);
        
        for (let i = 0; i < sparkleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * this.dimensions.width;     // x
            positions[i3 + 1] = (Math.random() - 0.5) * this.dimensions.height; // y
            positions[i3 + 2] = (Math.random() - 0.5) * this.dimensions.depth;  // z
        }
        
        sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const sparkleMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.05,
            transparent: true,
            opacity: 0.8
        });
        
        const sparkles = new THREE.Points(sparkleGeometry, sparkleMaterial);
        this.mesh.add(sparkles);
        
        // Animate sparkles
        let time = 0;
        const animateSparkles = () => {
            time += 0.016;
            sparkles.material.opacity = 0.4 + 0.4 * Math.sin(time * 2);
            requestAnimationFrame(animateSparkles);
        };
        animateSparkles();
    }

    createPhysicsBody() {
        const { Box, Vec3, Body, Material } = window.CannonClasses || {};
        if (!Box || !Vec3 || !Body || !Material) {
            console.error('Cannon.js classes not available');
            return;
        }
        
        const shape = new Box(new Vec3(
            this.dimensions.width / 2,
            this.dimensions.height / 2,
            this.dimensions.depth / 2
        ));
        
        this.body = new Body({ 
            mass: 0, // Static barrier
            shape: shape,
            material: new Material('barrier')
        });
        
        this.body.position.set(
            this.position.x,
            this.dimensions.height / 2,
            this.position.z
        );
    }

    // Check if a character is protected by this barrier from a given direction
    providesProtection(characterPos, projectilePos) {
        // Simple line-of-sight blocking
        // This is a basic implementation - could be improved with proper ray casting
        
        const barrierPos = this.mesh.position;
        
        // Check if barrier is between character and projectile (roughly)
        const charToBarrier = {
            x: barrierPos.x - characterPos.x,
            z: barrierPos.z - characterPos.z
        };
        
        const charToProjectile = {
            x: projectilePos.x - characterPos.x,
            z: projectilePos.z - characterPos.z
        };
        
        // Normalize vectors
        const charToBarrierLen = Math.sqrt(charToBarrier.x * charToBarrier.x + charToBarrier.z * charToBarrier.z);
        const charToProjectileLen = Math.sqrt(charToProjectile.x * charToProjectile.x + charToProjectile.z * charToProjectile.z);
        
        if (charToBarrierLen === 0 || charToProjectileLen === 0) return false;
        
        charToBarrier.x /= charToBarrierLen;
        charToBarrier.z /= charToBarrierLen;
        charToProjectile.x /= charToProjectileLen;
        charToProjectile.z /= charToProjectileLen;
        
        // Check if vectors are roughly in the same direction
        const dotProduct = charToBarrier.x * charToProjectile.x + charToBarrier.z * charToProjectile.z;
        
        // If dot product is high and barrier is closer than projectile, it provides protection
        return dotProduct > 0.7 && charToBarrierLen < charToProjectileLen;
    }

    // Check if projectile can hit character behind this barrier
    blocksProjectile(characterPos, projectilePos, projectileHeight) {
        // If projectile is high enough, it can go over the barrier
        if (projectileHeight > this.dimensions.height + 1) {
            return false;
        }
        
        // Otherwise, check if barrier blocks the path
        return this.providesProtection(characterPos, projectilePos);
    }

    update(deltaTime) {
        // Barriers are static, but we could add effects here
        // For example, melting over time, or visual effects
    }

    // Get barrier bounds for AI pathfinding
    getBounds() {
        return {
            minX: this.position.x - this.dimensions.width / 2,
            maxX: this.position.x + this.dimensions.width / 2,
            minZ: this.position.z - this.dimensions.depth / 2,
            maxZ: this.position.z + this.dimensions.depth / 2,
            height: this.dimensions.height
        };
    }

    // Check if a position is inside the barrier (for collision avoidance)
    containsPoint(x, z) {
        const bounds = this.getBounds();
        return x >= bounds.minX && x <= bounds.maxX && 
               z >= bounds.minZ && z <= bounds.maxZ;
    }

    // Get the closest safe position outside the barrier
    getClosestSafePosition(x, z) {
        const bounds = this.getBounds();
        const centerX = this.position.x;
        const centerZ = this.position.z;
        
        // Calculate distances to each edge
        const distances = [
            { pos: { x: bounds.minX - 0.5, z }, dist: Math.abs(x - (bounds.minX - 0.5)) }, // Left
            { pos: { x: bounds.maxX + 0.5, z }, dist: Math.abs(x - (bounds.maxX + 0.5)) }, // Right
            { pos: { x, z: bounds.minZ - 0.5 }, dist: Math.abs(z - (bounds.minZ - 0.5)) }, // Front
            { pos: { x, z: bounds.maxZ + 0.5 }, dist: Math.abs(z - (bounds.maxZ + 0.5)) }  // Back
        ];
        
        // Return the closest safe position
        distances.sort((a, b) => a.dist - b.dist);
        return distances[0].pos;
    }
}
