/**
 * SimplePhysics - Sistema de física simplificado como fallback
 * Usado quando Cannon.js não está disponível
 */
class SimplePhysics {
    constructor() {
        this.bodies = [];
        this.gravity = { x: 0, y: -9.82, z: 0 };
        this.timeStep = 1/60;
    }

    addBody(body) {
        this.bodies.push(body);
    }

    removeBody(body) {
        const index = this.bodies.indexOf(body);
        if (index > -1) {
            this.bodies.splice(index, 1);
        }
    }

    step(deltaTime) {
        this.bodies.forEach(body => {
            if (body.mass > 0) { // Only move dynamic bodies
                // Apply gravity
                body.velocity.y += this.gravity.y * deltaTime;
                
                // Update position
                body.position.x += body.velocity.x * deltaTime;
                body.position.y += body.velocity.y * deltaTime;
                body.position.z += body.velocity.z * deltaTime;
                
                // Simple ground collision
                if (body.position.y < 0.5) {
                    body.position.y = 0.5;
                    body.velocity.y = Math.abs(body.velocity.y) * -0.3; // Bounce with energy loss
                    body.velocity.x *= 0.8; // Friction
                    body.velocity.z *= 0.8;
                    
                    // Trigger collision event if exists
                    if (body.onGroundHit) {
                        body.onGroundHit();
                    }
                }
                
                // Simple bounds checking
                const bounds = 25;
                if (Math.abs(body.position.x) > bounds || Math.abs(body.position.z) > bounds) {
                    if (body.onOutOfBounds) {
                        body.onOutOfBounds();
                    }
                }
            }
        });
        
        // Simple collision detection between bodies
        this.checkCollisions();
    }

    checkCollisions() {
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const bodyA = this.bodies[i];
                const bodyB = this.bodies[j];
                
                if (bodyA.mass === 0 && bodyB.mass === 0) continue; // Both static
                
                const distance = this.getDistance(bodyA.position, bodyB.position);
                const minDistance = (bodyA.radius || 0.5) + (bodyB.radius || 0.5);
                
                if (distance < minDistance) {
                    // Collision detected
                    if (bodyA.onCollision) {
                        bodyA.onCollision(bodyB);
                    }
                    if (bodyB.onCollision) {
                        bodyB.onCollision(bodyA);
                    }
                }
            }
        }
    }

    getDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dz = pos1.z - pos2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
}

// Simple physics body
class SimpleBody {
    constructor(options = {}) {
        this.position = { x: 0, y: 0, z: 0 };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.mass = options.mass || 0;
        this.radius = options.radius || 0.5;
        this.material = options.material || null;
        
        // Callbacks
        this.onCollision = null;
        this.onGroundHit = null;
        this.onOutOfBounds = null;
    }

    setPosition(x, y, z) {
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
    }

    setVelocity(x, y, z) {
        this.velocity.x = x;
        this.velocity.y = y;
        this.velocity.z = z;
    }

    addEventListener(event, callback) {
        if (event === 'collide') {
            this.onCollision = callback;
        }
    }
}

// Fallback classes to replace Cannon.js
window.SimpleCannon = {
    World: SimplePhysics,
    Body: SimpleBody,
    Vec3: class Vec3 {
        constructor(x = 0, y = 0, z = 0) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
    },
    Sphere: class Sphere {
        constructor(radius) {
            this.radius = radius;
        }
    },
    Box: class Box {
        constructor(halfExtents) {
            this.halfExtents = halfExtents;
        }
    },
    Plane: class Plane {},
    Cylinder: class Cylinder {
        constructor(radiusTop, radiusBottom, height, numSegments) {
            this.radiusTop = radiusTop;
            this.radiusBottom = radiusBottom;
            this.height = height;
            this.numSegments = numSegments;
        }
    },
    Material: class Material {
        constructor(name) {
            this.name = name;
        }
    },
    ContactMaterial: class ContactMaterial {
        constructor(materialA, materialB, options) {
            this.materialA = materialA;
            this.materialB = materialB;
            this.friction = options.friction || 0.3;
            this.restitution = options.restitution || 0.3;
        }
    },
    NaiveBroadphase: class NaiveBroadphase {}
};
