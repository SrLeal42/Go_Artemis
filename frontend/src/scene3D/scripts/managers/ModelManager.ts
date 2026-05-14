import * as B from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

import { MaterialInstance } from './MaterialManager';
import { type AnimatedModelInstance } from './AnimationManager';

import { SPAWN_LIGHT, GOAL_LIGHT } from '../utilities/LightingConstants';

class ModelManager {

    private scene: B.Scene;
    private masterMeshes: Map<string, B.Mesh> = new Map();

    private modelPositions: Map<string, B.Vector3[]> = new Map();

    private animatedContainers: Map<string, B.AssetContainer> = new Map();

    public onProgress?: (loaded: number, total: number) => void;

    public async initialize(scene: B.Scene): Promise<void> {

        this.scene = scene;
        await this.initializeModels();

    }


    // Registra todos os modelos mestres aqui
    private async initializeModels(): Promise<void> {

        const masterObjetivoCube = B.MeshBuilder.CreateBox("master_objetivo_cubo", {}, this.scene);
        masterObjetivoCube.material = MaterialInstance.getMaterial("objetivo_cubo");
        masterObjetivoCube.setEnabled(false);
        this.masterMeshes.set("objetivo_cubo", masterObjetivoCube);

        const loadTasks = [
            () => this.loadModel("terrain_default",        "/models/terrain/TRANSPONIVEL.glb", .5),
            () => this.loadModel("terrain_transponivel",   "/models/terrain/TRANSPONIVEL.glb", .5),
            () => this.loadModel("terrain_cratera",        "/models/terrain/CRATERA.glb", .5, new B.Vector3(0, 0, 0)),
            () => this.loadModel("terrain_rocha",          "/models/terrain/ROCHA.glb", .5),
            () => this.loadModel("terrain_objetivo",       "/models/terrain/OBJETIVO_BASE.glb", .5),
            () => this.loadModel("terrain_objetivo_glow",  "/models/terrain/OBJETIVO_BULBO.glb", .5, new B.Vector3(0, 0, 0)),
            () => this.loadModel("terrain_surgimento",     "/models/terrain/SURGIMENTO_BASE.glb", 1),
            () => this.loadModel("terrain_surgimento_glow","/models/terrain/SURGIMENTO_BULBO.glb", 1),
            // MONTANHA
            () => this.loadModel("terrain_montanha_norte",     "/models/terrain/montanha/MONTANHA_BORDA.glb", .5, new B.Vector3(0, 0, 0)),
            () => this.loadModel("terrain_montanha_oeste",     "/models/terrain/montanha/MONTANHA_BORDA.glb", .5, new B.Vector3(0, Math.PI/2, 0)),
            () => this.loadModel("terrain_montanha_leste",     "/models/terrain/montanha/MONTANHA_BORDA.glb", .5, new B.Vector3(0, -Math.PI/2, 0)),
            () => this.loadModel("terrain_montanha_sul",       "/models/terrain/montanha/MONTANHA_BORDA.glb", .5, new B.Vector3(0, Math.PI, 0)),
            () => this.loadModel("terrain_montanha_noroeste",  "/models/terrain/montanha/MONTANHA_CANTO.glb", .5, new B.Vector3(0, 0, 0)),
            () => this.loadModel("terrain_montanha_nordeste",  "/models/terrain/montanha/MONTANHA_CANTO.glb", .5, new B.Vector3(0, -Math.PI/2, 0)),
            () => this.loadModel("terrain_montanha_sudeste",  "/models/terrain/montanha/MONTANHA_CANTO.glb", .5, new B.Vector3(0, Math.PI, 0)),
            () => this.loadModel("terrain_montanha_sudoeste",  "/models/terrain/montanha/MONTANHA_CANTO.glb", .5, new B.Vector3(0, Math.PI/2, 0)),
            () => this.loadModel("terrain_montanha_centro",  "/models/terrain/montanha/MONTANHA_CENTRO.glb", .5, new B.Vector3(0, 0, 0)),
            // CRATERA GRANDE
            () => this.loadModel("terrain_cratera_norte",  "/models/terrain/cratera_grande/CRATERA_GRANDE_BORDA.glb", .5, new B.Vector3(0, 0, 0)),
            () => this.loadModel("terrain_cratera_oeste",  "/models/terrain/cratera_grande/CRATERA_GRANDE_BORDA.glb", .5, new B.Vector3(0, Math.PI/2, 0)),
            () => this.loadModel("terrain_cratera_leste",  "/models/terrain/cratera_grande/CRATERA_GRANDE_BORDA.glb", .5, new B.Vector3(0, -Math.PI/2, 0)),
            () => this.loadModel("terrain_cratera_sul",    "/models/terrain/cratera_grande/CRATERA_GRANDE_BORDA.glb", .5, new B.Vector3(0, Math.PI, 0)),
            () => this.loadModel("terrain_cratera_noroeste",    "/models/terrain/cratera_grande/CRATERA_GRANDE_CANTO.glb", .5, new B.Vector3(0, 0, 0)),
            () => this.loadModel("terrain_cratera_nordeste",    "/models/terrain/cratera_grande/CRATERA_GRANDE_CANTO.glb", .5, new B.Vector3(0, -Math.PI/2, 0)),
            () => this.loadModel("terrain_cratera_sudeste",    "/models/terrain/cratera_grande/CRATERA_GRANDE_CANTO.glb", .5, new B.Vector3(0, Math.PI, 0)),
            () => this.loadModel("terrain_cratera_sudoeste",    "/models/terrain/cratera_grande/CRATERA_GRANDE_CANTO.glb", .5, new B.Vector3(0, Math.PI/2, 0)),
            () => this.loadModel("terrain_cratera_centro",    "/models/terrain/cratera_grande/CRATERA_GRANDE_CENTRO.glb", .5, new B.Vector3(0, 0, 0)),
            // OUTROS
            () => this.loadModel("marcador",               "/models/others/MARCADOR.glb", 2),
            // () => this.loadModel("rover",                  "/models/rover/ROVER.glb", 1),
            () => this.loadAnimatedModel("rover", "/models/rover/ROVER.glb", 1, new B.Vector3(0, 0, 0)),
        ];


        const total = loadTasks.length;
        let loaded = 0;

        // Executa todos em paralelo, mas reporta a cada conclusão
        await Promise.all(
        loadTasks.map(task => 
                task().then(() => {
                    loaded++;
                    this.onProgress?.(loaded, total);
                })
            )
        );


    }


    // Cria uma instância de um modelo mestre
    public createInstance(masterKey: string, instanceName: string): B.InstancedMesh {
        const master = this.masterMeshes.get(masterKey);

        if (!master) {
            throw new Error(`Modelo mestre "${masterKey}" não encontrado no ModelManager.`);
        }

        return master.createInstance(instanceName);
    }

    public createClone(masterKey: string, cloneName: string): B.Mesh {
        const master = this.masterMeshes.get(masterKey);
    
        if (!master) throw new Error(`Modelo "${masterKey}" não encontrado.`);
        
        const cloned = master.clone(cloneName, null)!;
        cloned.setEnabled(true);
    
        return cloned;
    }


    // private registerTerrainPlane(key: string, materialKey: string): void {
    //     const mesh = B.MeshBuilder.CreatePlane(`master_${key}`, {}, this.scene);
    //     mesh.material = MaterialInstance.getMaterial(materialKey);
    //     mesh.rotation = new B.Vector3(Math.PI / 2, 0, 0);
    //     mesh.setEnabled(false);
    //     this.masterMeshes.set(key, mesh);
    // }


    private async loadModel(
        key: string,
        path: string,
        scaleFactor?: number,
        rotateFactor?: B.Vector3
    ): Promise<void> {

        const result = await B.SceneLoader.ImportMeshAsync(
            "",       // meshNames: "" = importar tudo
            "",       // rootUrl: "" porque o path já é absoluto do servidor
            path,     // caminho do arquivo
            this.scene
        );

        // ImportMeshAsync retorna { meshes, particleSystems, skeletons, animationGroups }
        // meshes[0] geralmente é o __root__ (nó raiz do glTF)
        const root = result.meshes[0];
        root.setEnabled(false);

        // Se o modelo tiver sub-meshes, merge tudo em um único Mesh
        // para poder usar createInstance() depois
        const children = root.getChildMeshes(false) as B.Mesh[];
        
        // Normaliza InstancedMeshes → Mesh regulares
        const meshesForMerge: B.Mesh[] = [];

        for (const child of children) {
            const isInstance = child instanceof B.InstancedMesh;
            if (!isInstance && !(child instanceof B.Mesh)) continue;
            
            // Resolve o mesh: clone do source se instância, ou o próprio child
            const mesh = isInstance
                ? (child as B.InstancedMesh).sourceMesh.clone(`${child.name}_converted`, null)!
                : child as B.Mesh;
            
            // Captura a transform completa (incluindo parents)
            const world = child.computeWorldMatrix(true);
            const pos = new B.Vector3();
            const rot = new B.Quaternion();
            const scl = new B.Vector3();
            world.decompose(scl, rot, pos);
            mesh.parent = null;
            mesh.position = pos;
            mesh.rotationQuaternion = rot;
            mesh.scaling = scl;

            if (isInstance) child.dispose();

            meshesForMerge.push(mesh);
        }

        if (key === SPAWN_LIGHT.GLOW_KEY || key === GOAL_LIGHT.GLOW_KEY) { // Capturando a posição dos bulbos para poder criar os pointLights depois
            const positions = meshesForMerge.map(m => m.position.clone());
            this.modelPositions.set(key, positions);
        }

        if (meshesForMerge.length === 1) {
            const single = meshesForMerge[0];
            single.setEnabled(false);
        
            if (scaleFactor) {
                single.scaling = new B.Vector3(scaleFactor, scaleFactor, scaleFactor);
            }
        
            if (rotateFactor) {
                single.rotationQuaternion = null; // força usar euler
                single.rotation = rotateFactor;
            }
            single.bakeCurrentTransformIntoVertices();
            single.refreshBoundingInfo();
            this.masterMeshes.set(key, single);
        
        } else if (meshesForMerge.length > 1) {
        
            const merged = B.Mesh.MergeMeshes(
                meshesForMerge,
                true,
                true,
                undefined,
                false,
                true
            );
        
            if (merged) {
                merged.parent = null;
                merged.setEnabled(false);
                if (scaleFactor) {
                    merged.scaling = new B.Vector3(scaleFactor, scaleFactor, scaleFactor);
                }
         
                if (rotateFactor) {
                    merged.rotationQuaternion = null;
                    merged.rotation = rotateFactor;
                }
                merged.bakeCurrentTransformIntoVertices();
                merged.refreshBoundingInfo();
                this.masterMeshes.set(key, merged);
            }
        }

        root.dispose(); // Limpa o nó __root__ agora desnecessário
    }

    private async loadAnimatedModel(
        key: string,
        path: string,
        scaleFactor?: number,
        rotateFactor?: B.Vector3
    ): Promise<void> {
        const container = await B.SceneLoader.LoadAssetContainerAsync("", path, this.scene);

        // Ajusta escala no root
        if (scaleFactor) {
            container.meshes[0].scaling.setAll(scaleFactor);
        }

        if (rotateFactor){
            container.meshes[0].rotationQuaternion = null;
            container.meshes[0].rotation.set(rotateFactor.x, rotateFactor.y, rotateFactor.z);
        }

        // Para todas as animações por padrão
        container.animationGroups.forEach(ag => ag.stop());

        this.animatedContainers.set(key, container);
    }



    public getModelPositions(key: string): B.Vector3[] {
        return this.modelPositions.get(key) ?? [];
    }


    // Retorna o mesh mestre diretamente (para casos especiais)
    public getMasterMesh(key: string): B.Mesh {
        const mesh = this.masterMeshes.get(key);

        if (!mesh) {
            throw new Error(`Modelo mestre "${key}" não encontrado no ModelManager.`);
        }

        return mesh;
    }

    public spawnAnimated(key: string, name: string) : AnimatedModelInstance {
        const container = this.animatedContainers.get(key);
        if (!container) {
            throw new Error(`Container animado "${key}" não encontrado.`);
        }

        const instance = container.instantiateModelsToScene(
            (sourceName) => `${name}_${sourceName}`
        );

        return {
            rootNodes: instance.rootNodes,
            animationGroups: instance.animationGroups,
            skeletons: instance.skeletons
        };
    }



}


export const ModelInstance = new ModelManager();