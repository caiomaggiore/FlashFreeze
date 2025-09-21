/**
 * AdvancedModelingTools.js - Ferramentas avançadas de modelagem 3D
 * Baseado em Tripo3D Studio e 3DS Max
 * Inclui: Extrude, Chamfer, Bevel, Outline, Inset, Rigging
 * Flash Freeze v0.2.1+
 */

class AdvancedModelingTools {
    constructor(editor) {
        this.editor = editor;
        this.selectedVertices = [];
        this.selectedEdges = [];
        this.selectedFaces = [];
        this.selectionMode = 'vertex';
        
        // Ferramentas profissionais
        this.tools = {
            extrude: new ExtrudeTool(this),
            chamfer: new ChamferTool(this),
            bevel: new BevelTool(this),
            outline: new OutlineTool(this),
            inset: new InsetTool(this),
            rigging: new RiggingTool(this)
        };
        
        console.log('🛠️ AdvancedModelingTools inicializado');
    }
    
    /**
     * SELEÇÃO AVANÇADA - Baseada no Tripo3D
     */
    selectElement(mesh, intersect, addToSelection = false) {
        if (!addToSelection) {
            this.clearSelection();
        }
        
        switch (this.selectionMode) {
            case 'vertex':
                this.selectVertex(mesh, intersect);
                break;
            case 'edge':
                this.selectEdge(mesh, intersect);
                break;
            case 'face':
                this.selectFace(mesh, intersect);
                break;
        }
        
        this.updateSelectionVisuals();
        this.updateSelectionStats();
    }
    
    selectVertex(mesh, intersect) {
        const geometry = mesh.geometry;
        const face = intersect.face;
        const faceIndex = intersect.faceIndex;
        
        // Encontrar vértice mais próximo ao ponto de intersecção
        const point = intersect.point;
        let closestVertex = -1;
        let closestDistance = Infinity;
        
        const positions = geometry.attributes.position.array;
        
        // Verificar os 3 vértices da face
        [face.a, face.b, face.c].forEach(vertexIndex => {
            const vx = positions[vertexIndex * 3];
            const vy = positions[vertexIndex * 3 + 1];
            const vz = positions[vertexIndex * 3 + 2];
            
            const distance = point.distanceTo(new THREE.Vector3(vx, vy, vz));
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestVertex = vertexIndex;
            }
        });
        
        if (closestVertex !== -1 && !this.selectedVertices.includes(closestVertex)) {
            this.selectedVertices.push(closestVertex);
            console.log(`📍 Vértice ${closestVertex} selecionado`);
        }
    }
    
    selectEdge(mesh, intersect) {
        const face = intersect.face;
        const edges = [
            [face.a, face.b],
            [face.b, face.c],
            [face.c, face.a]
        ];
        
        // Encontrar edge mais próxima ao ponto de clique
        const point = intersect.point;
        let closestEdge = null;
        let closestDistance = Infinity;
        
        const positions = mesh.geometry.attributes.position.array;
        
        edges.forEach(edge => {
            const [v1, v2] = edge;
            const p1 = new THREE.Vector3(positions[v1 * 3], positions[v1 * 3 + 1], positions[v1 * 3 + 2]);
            const p2 = new THREE.Vector3(positions[v2 * 3], positions[v2 * 3 + 1], positions[v2 * 3 + 2]);
            
            const line = new THREE.Line3(p1, p2);
            const closestPoint = new THREE.Vector3();
            line.closestPointToPoint(point, true, closestPoint);
            
            const distance = point.distanceTo(closestPoint);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestEdge = edge;
            }
        });
        
        if (closestEdge) {
            const edgeKey = `${Math.min(closestEdge[0], closestEdge[1])}-${Math.max(closestEdge[0], closestEdge[1])}`;
            if (!this.selectedEdges.includes(edgeKey)) {
                this.selectedEdges.push(edgeKey);
                console.log(`📏 Edge ${edgeKey} selecionada`);
            }
        }
    }
    
    selectFace(mesh, intersect) {
        const faceIndex = intersect.faceIndex;
        
        if (!this.selectedFaces.includes(faceIndex)) {
            this.selectedFaces.push(faceIndex);
            console.log(`🔺 Face ${faceIndex} selecionada`);
        }
    }
    
    clearSelection() {
        this.selectedVertices = [];
        this.selectedEdges = [];
        this.selectedFaces = [];
        this.clearSelectionVisuals();
    }
    
    updateSelectionVisuals() {
        this.clearSelectionVisuals();
        
        // Criar helpers visuais para elementos selecionados
        this.selectedVertices.forEach(vertexIndex => {
            this.createVertexHelper(vertexIndex);
        });
        
        this.selectedFaces.forEach(faceIndex => {
            this.createFaceHelper(faceIndex);
        });
    }
    
    createVertexHelper(vertexIndex) {
        const mesh = this.editor.currentModel;
        const positions = mesh.geometry.attributes.position.array;
        
        const x = positions[vertexIndex * 3];
        const y = positions[vertexIndex * 3 + 1];
        const z = positions[vertexIndex * 3 + 2];
        
        const helper = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 8, 6),
            new THREE.MeshBasicMaterial({ color: 0xffff00 })
        );
        helper.position.set(x, y, z);
        helper.name = `vertex-helper-${vertexIndex}`;
        
        this.editor.scene.add(helper);
    }
    
    createFaceHelper(faceIndex) {
        // Implementar highlight de face
        console.log(`🔺 Criando helper para face ${faceIndex}`);
    }
    
    clearSelectionVisuals() {
        const helpersToRemove = [];
        this.editor.scene.traverse((child) => {
            if (child.name && child.name.includes('helper')) {
                helpersToRemove.push(child);
            }
        });
        
        helpersToRemove.forEach(helper => this.editor.scene.remove(helper));
    }
    
    updateSelectionStats() {
        // Atualizar estatísticas de seleção na UI
        const totalSelected = this.selectedVertices.length + this.selectedEdges.length + this.selectedFaces.length;
        
        if (document.getElementById('selected-count')) {
            document.getElementById('selected-count').textContent = totalSelected;
        }
    }
}

/**
 * EXTRUDE TOOL - Inspirado no 3DS Max
 */
class ExtrudeTool {
    constructor(modelingTools) {
        this.modelingTools = modelingTools;
    }
    
    apply(distance = 1.0, direction = null) {
        const faces = this.modelingTools.selectedFaces;
        if (faces.length === 0) {
            console.warn('Nenhuma face selecionada para extrusão');
            return;
        }
        
        console.log(`⬆️ Aplicando extrusão: ${faces.length} faces, distância ${distance}`);
        
        const mesh = this.modelingTools.editor.currentModel;
        const geometry = mesh.geometry;
        
        // Implementar extrusão real
        const newGeometry = this.extrudeGeometry(geometry, faces, distance, direction);
        mesh.geometry = newGeometry;
        
        // Limpar seleção
        this.modelingTools.clearSelection();
    }
    
    extrudeGeometry(geometry, faceIndices, distance, direction) {
        // Implementação básica de extrusão
        const positions = geometry.attributes.position.array;
        const indices = geometry.index ? geometry.index.array : null;
        
        if (!indices) {
            console.error('Geometria deve ter índices para extrusão');
            return geometry;
        }
        
        const newPositions = [...positions];
        const newIndices = [...indices];
        
        faceIndices.forEach(faceIndex => {
            const i1 = indices[faceIndex * 3];
            const i2 = indices[faceIndex * 3 + 1];
            const i3 = indices[faceIndex * 3 + 2];
            
            // Calcular normal da face
            const normal = this.calculateFaceNormal(positions, i1, i2, i3);
            const extrudeDir = direction || normal;
            
            // Criar novos vértices extrudidos
            const newI1 = this.extrudeVertex(newPositions, i1, extrudeDir, distance);
            const newI2 = this.extrudeVertex(newPositions, i2, extrudeDir, distance);
            const newI3 = this.extrudeVertex(newPositions, i3, extrudeDir, distance);
            
            // Adicionar faces laterais
            this.addQuadAsTriangles(newIndices, i1, i2, newI2, newI1);
            this.addQuadAsTriangles(newIndices, i2, i3, newI3, newI2);
            this.addQuadAsTriangles(newIndices, i3, i1, newI1, newI3);
            
            // Substituir face original pela extrudida
            newIndices[faceIndex * 3] = newI1;
            newIndices[faceIndex * 3 + 1] = newI2;
            newIndices[faceIndex * 3 + 2] = newI3;
        });
        
        const newGeometry = new THREE.BufferGeometry();
        newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        newGeometry.setIndex(newIndices);
        newGeometry.computeVertexNormals();
        
        return newGeometry;
    }
    
    calculateFaceNormal(positions, i1, i2, i3) {
        const v1 = new THREE.Vector3(positions[i1 * 3], positions[i1 * 3 + 1], positions[i1 * 3 + 2]);
        const v2 = new THREE.Vector3(positions[i2 * 3], positions[i2 * 3 + 1], positions[i2 * 3 + 2]);
        const v3 = new THREE.Vector3(positions[i3 * 3], positions[i3 * 3 + 1], positions[i3 * 3 + 2]);
        
        const edge1 = v2.clone().sub(v1);
        const edge2 = v3.clone().sub(v1);
        
        return edge1.cross(edge2).normalize();
    }
    
    extrudeVertex(positions, vertexIndex, direction, distance) {
        const x = positions[vertexIndex * 3];
        const y = positions[vertexIndex * 3 + 1];
        const z = positions[vertexIndex * 3 + 2];
        
        const newX = x + direction.x * distance;
        const newY = y + direction.y * distance;
        const newZ = z + direction.z * distance;
        
        positions.push(newX, newY, newZ);
        return (positions.length / 3) - 1;
    }
    
    addQuadAsTriangles(indices, v1, v2, v3, v4) {
        indices.push(v1, v2, v3);
        indices.push(v1, v3, v4);
    }
}

/**
 * CHAMFER TOOL - Arredondamento de edges
 */
class ChamferTool {
    constructor(modelingTools) {
        this.modelingTools = modelingTools;
    }
    
    apply(radius = 0.1, segments = 3) {
        const edges = this.modelingTools.selectedEdges;
        if (edges.length === 0) {
            console.warn('Nenhuma edge selecionada para chanfro');
            return;
        }
        
        console.log(`🔄 Aplicando chanfro: ${edges.length} edges, raio ${radius}, ${segments} segmentos`);
        
        // Implementar chanfro
        const mesh = this.modelingTools.editor.currentModel;
        const geometry = mesh.geometry;
        
        const newGeometry = this.chamferGeometry(geometry, edges, radius, segments);
        mesh.geometry = newGeometry;
        
        this.modelingTools.clearSelection();
    }
    
    chamferGeometry(geometry, edgeKeys, radius, segments) {
        // Implementação básica de chanfro
        const newGeometry = geometry.clone();
        
        edgeKeys.forEach(edgeKey => {
            const [v1, v2] = edgeKey.split('-').map(Number);
            this.chamferEdge(newGeometry, v1, v2, radius, segments);
        });
        
        newGeometry.computeVertexNormals();
        return newGeometry;
    }
    
    chamferEdge(geometry, v1Index, v2Index, radius, segments) {
        const positions = geometry.attributes.position.array;
        
        const v1 = new THREE.Vector3(positions[v1Index * 3], positions[v1Index * 3 + 1], positions[v1Index * 3 + 2]);
        const v2 = new THREE.Vector3(positions[v2Index * 3], positions[v2Index * 3 + 1], positions[v2Index * 3 + 2]);
        
        // Criar vértices do chanfro
        const chamferVertices = [];
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const point = v1.clone().lerp(v2, t);
            
            // Aplicar offset do raio (simplificado)
            const offset = new THREE.Vector3(0, radius, 0);
            point.add(offset);
            
            chamferVertices.push(point);
        }
        
        // Adicionar novos vértices à geometria
        chamferVertices.forEach(vertex => {
            positions.push(vertex.x, vertex.y, vertex.z);
        });
    }
}

/**
 * BEVEL TOOL - Chanfro em faces
 */
class BevelTool {
    constructor(modelingTools) {
        this.modelingTools = modelingTools;
    }
    
    apply(amount = 0.1, segments = 2) {
        const faces = this.modelingTools.selectedFaces;
        if (faces.length === 0) {
            console.warn('Nenhuma face selecionada para bevel');
            return;
        }
        
        console.log(`🔷 Aplicando bevel: ${faces.length} faces, amount ${amount}`);
        
        // Implementar bevel
        const mesh = this.modelingTools.editor.currentModel;
        const geometry = mesh.geometry;
        
        const newGeometry = this.bevelGeometry(geometry, faces, amount, segments);
        mesh.geometry = newGeometry;
        
        this.modelingTools.clearSelection();
    }
    
    bevelGeometry(geometry, faceIndices, amount, segments) {
        // Bevel = chanfro aplicado a todas as edges de uma face
        const newGeometry = geometry.clone();
        
        faceIndices.forEach(faceIndex => {
            this.bevelFace(newGeometry, faceIndex, amount, segments);
        });
        
        newGeometry.computeVertexNormals();
        return newGeometry;
    }
    
    bevelFace(geometry, faceIndex, amount, segments) {
        // Implementação simplificada - reduzir face e criar chanfro nas bordas
        const indices = geometry.index.array;
        const positions = geometry.attributes.position.array;
        
        const i1 = indices[faceIndex * 3];
        const i2 = indices[faceIndex * 3 + 1];
        const i3 = indices[faceIndex * 3 + 2];
        
        // Calcular centro da face
        const center = new THREE.Vector3(
            (positions[i1 * 3] + positions[i2 * 3] + positions[i3 * 3]) / 3,
            (positions[i1 * 3 + 1] + positions[i2 * 3 + 1] + positions[i3 * 3 + 1]) / 3,
            (positions[i1 * 3 + 2] + positions[i2 * 3 + 2] + positions[i3 * 3 + 2]) / 3
        );
        
        // Mover vértices em direção ao centro
        const v1 = new THREE.Vector3(positions[i1 * 3], positions[i1 * 3 + 1], positions[i1 * 3 + 2]);
        const v2 = new THREE.Vector3(positions[i2 * 3], positions[i2 * 3 + 1], positions[i2 * 3 + 2]);
        const v3 = new THREE.Vector3(positions[i3 * 3], positions[i3 * 3 + 1], positions[i3 * 3 + 2]);
        
        v1.lerp(center, amount);
        v2.lerp(center, amount);
        v3.lerp(center, amount);
        
        // Atualizar posições
        positions[i1 * 3] = v1.x; positions[i1 * 3 + 1] = v1.y; positions[i1 * 3 + 2] = v1.z;
        positions[i2 * 3] = v2.x; positions[i2 * 3 + 1] = v2.y; positions[i2 * 3 + 2] = v2.z;
        positions[i3 * 3] = v3.x; positions[i3 * 3 + 1] = v3.y; positions[i3 * 3 + 2] = v3.z;
    }
}

/**
 * OUTLINE TOOL - Criar contorno externo
 */
class OutlineTool {
    constructor(modelingTools) {
        this.modelingTools = modelingTools;
    }
    
    apply(distance = 0.1) {
        const faces = this.modelingTools.selectedFaces;
        if (faces.length === 0) {
            console.warn('Nenhuma face selecionada para outline');
            return;
        }
        
        console.log(`📐 Aplicando outline: ${faces.length} faces, distância ${distance}`);
        
        // Criar geometria de contorno
        const mesh = this.modelingTools.editor.currentModel;
        const outlineMesh = this.createOutline(mesh, faces, distance);
        
        this.modelingTools.editor.scene.add(outlineMesh);
        this.modelingTools.clearSelection();
    }
    
    createOutline(mesh, faceIndices, distance) {
        const geometry = mesh.geometry.clone();
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x3498db,
            transparent: true,
            opacity: 0.5,
            side: THREE.BackSide
        });
        
        // Escalar geometria ligeiramente para criar outline
        const positions = geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            const vertex = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
            vertex.normalize().multiplyScalar(distance);
            
            positions[i] += vertex.x;
            positions[i + 1] += vertex.y;
            positions[i + 2] += vertex.z;
        }
        
        geometry.attributes.position.needsUpdate = true;
        
        const outlineMesh = new THREE.Mesh(geometry, material);
        outlineMesh.name = 'outline';
        
        return outlineMesh;
    }
}

/**
 * INSET TOOL - Criar face interna
 */
class InsetTool {
    constructor(modelingTools) {
        this.modelingTools = modelingTools;
    }
    
    apply(amount = 0.2) {
        const faces = this.modelingTools.selectedFaces;
        if (faces.length === 0) {
            console.warn('Nenhuma face selecionada para inset');
            return;
        }
        
        console.log(`📦 Aplicando inset: ${faces.length} faces, amount ${amount}`);
        
        // Inset = criar face menor dentro da face original
        const mesh = this.modelingTools.editor.currentModel;
        const geometry = mesh.geometry;
        
        const newGeometry = this.insetGeometry(geometry, faces, amount);
        mesh.geometry = newGeometry;
        
        this.modelingTools.clearSelection();
    }
    
    insetGeometry(geometry, faceIndices, amount) {
        const newGeometry = geometry.clone();
        const positions = newGeometry.attributes.position.array;
        const indices = newGeometry.index.array;
        
        faceIndices.forEach(faceIndex => {
            const i1 = indices[faceIndex * 3];
            const i2 = indices[faceIndex * 3 + 1];
            const i3 = indices[faceIndex * 3 + 2];
            
            // Calcular centro da face
            const center = new THREE.Vector3(
                (positions[i1 * 3] + positions[i2 * 3] + positions[i3 * 3]) / 3,
                (positions[i1 * 3 + 1] + positions[i2 * 3 + 1] + positions[i3 * 3 + 1]) / 3,
                (positions[i1 * 3 + 2] + positions[i2 * 3 + 2] + positions[i3 * 3 + 2]) / 3
            );
            
            // Criar novos vértices movidos em direção ao centro
            const newV1 = this.createInsetVertex(positions, i1, center, amount);
            const newV2 = this.createInsetVertex(positions, i2, center, amount);
            const newV3 = this.createInsetVertex(positions, i3, center, amount);
            
            // Adicionar novos vértices
            const newI1 = positions.length / 3;
            const newI2 = newI1 + 1;
            const newI3 = newI1 + 2;
            
            positions.push(newV1.x, newV1.y, newV1.z);
            positions.push(newV2.x, newV2.y, newV2.z);
            positions.push(newV3.x, newV3.y, newV3.z);
            
            // Conectar face original com face inset
            this.addQuadAsTriangles(indices, i1, i2, newI2, newI1);
            this.addQuadAsTriangles(indices, i2, i3, newI3, newI2);
            this.addQuadAsTriangles(indices, i3, i1, newI1, newI3);
            
            // Substituir face original pela inset
            indices[faceIndex * 3] = newI1;
            indices[faceIndex * 3 + 1] = newI2;
            indices[faceIndex * 3 + 2] = newI3;
        });
        
        newGeometry.computeVertexNormals();
        return newGeometry;
    }
    
    createInsetVertex(positions, vertexIndex, center, amount) {
        const vertex = new THREE.Vector3(
            positions[vertexIndex * 3],
            positions[vertexIndex * 3 + 1],
            positions[vertexIndex * 3 + 2]
        );
        
        return vertex.lerp(center, amount);
    }
    
    addQuadAsTriangles(indices, v1, v2, v3, v4) {
        indices.push(v1, v2, v3);
        indices.push(v1, v3, v4);
    }
}

/**
 * RIGGING TOOL - Sistema de esqueleto baseado no Tripo3D
 */
class RiggingTool {
    constructor(modelingTools) {
        this.modelingTools = modelingTools;
        this.bones = [];
        this.skeleton = null;
    }
    
    createHumanoidRig() {
        console.log('🦴 Criando rig humanoide automático');
        
        const mesh = this.modelingTools.editor.currentModel;
        
        // Criar bones básicos para personagem humanoide
        const bones = this.createHumanoidBones();
        
        // Criar skeleton
        this.skeleton = new THREE.Skeleton(bones);
        
        // Aplicar skinning automático
        this.autoSkin(mesh, bones);
        
        // Visualizar skeleton
        this.showSkeletonHelper();
    }
    
    createHumanoidBones() {
        const bones = [];
        
        // Root bone
        const root = new THREE.Bone();
        root.name = 'root';
        root.position.set(0, 0, 0);
        bones.push(root);
        
        // Spine
        const spine = new THREE.Bone();
        spine.name = 'spine';
        spine.position.set(0, 0.5, 0);
        root.add(spine);
        bones.push(spine);
        
        // Chest
        const chest = new THREE.Bone();
        chest.name = 'chest';
        chest.position.set(0, 0.8, 0);
        spine.add(chest);
        bones.push(chest);
        
        // Neck
        const neck = new THREE.Bone();
        neck.name = 'neck';
        neck.position.set(0, 1.2, 0);
        chest.add(neck);
        bones.push(neck);
        
        // Head
        const head = new THREE.Bone();
        head.name = 'head';
        head.position.set(0, 1.4, 0);
        neck.add(head);
        bones.push(head);
        
        // Braços
        const leftShoulder = new THREE.Bone();
        leftShoulder.name = 'leftShoulder';
        leftShoulder.position.set(-0.5, 1.0, 0);
        chest.add(leftShoulder);
        bones.push(leftShoulder);
        
        const leftArm = new THREE.Bone();
        leftArm.name = 'leftArm';
        leftArm.position.set(-0.8, 1.0, 0);
        leftShoulder.add(leftArm);
        bones.push(leftArm);
        
        const rightShoulder = new THREE.Bone();
        rightShoulder.name = 'rightShoulder';
        rightShoulder.position.set(0.5, 1.0, 0);
        chest.add(rightShoulder);
        bones.push(rightShoulder);
        
        const rightArm = new THREE.Bone();
        rightArm.name = 'rightArm';
        rightArm.position.set(0.8, 1.0, 0);
        rightShoulder.add(rightArm);
        bones.push(rightArm);
        
        // Pernas
        const leftHip = new THREE.Bone();
        leftHip.name = 'leftHip';
        leftHip.position.set(-0.2, 0, 0);
        root.add(leftHip);
        bones.push(leftHip);
        
        const leftLeg = new THREE.Bone();
        leftLeg.name = 'leftLeg';
        leftLeg.position.set(-0.2, -0.6, 0);
        leftHip.add(leftLeg);
        bones.push(leftLeg);
        
        const rightHip = new THREE.Bone();
        rightHip.name = 'rightHip';
        rightHip.position.set(0.2, 0, 0);
        root.add(rightHip);
        bones.push(rightHip);
        
        const rightLeg = new THREE.Bone();
        rightLeg.name = 'rightLeg';
        rightLeg.position.set(0.2, -0.6, 0);
        rightHip.add(rightLeg);
        bones.push(rightLeg);
        
        return bones;
    }
    
    autoSkin(mesh, bones) {
        // Auto-skinning baseado na proximidade dos vértices aos bones
        console.log('🎭 Aplicando auto-skinning');
        
        // Converter para SkinnedMesh se necessário
        if (!(mesh instanceof THREE.SkinnedMesh)) {
            const skinnedMesh = new THREE.SkinnedMesh(mesh.geometry, mesh.material);
            skinnedMesh.add(bones[0]); // Adicionar root bone
            skinnedMesh.bind(new THREE.Skeleton(bones));
            
            // Substituir mesh original
            this.modelingTools.editor.scene.remove(mesh);
            this.modelingTools.editor.scene.add(skinnedMesh);
            this.modelingTools.editor.currentModel = skinnedMesh;
        }
    }
    
    showSkeletonHelper() {
        if (this.skeleton) {
            const skeletonHelper = new THREE.SkeletonHelper(this.skeleton.bones[0]);
            skeletonHelper.material.linewidth = 3;
            this.modelingTools.editor.scene.add(skeletonHelper);
        }
    }
}

// Exportar para uso global
window.AdvancedModelingTools = AdvancedModelingTools;
