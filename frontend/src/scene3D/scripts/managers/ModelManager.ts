import * as B from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

import { MaterialInstance } from './MaterialManager';

class ModelManager {

    private scene: B.Scene;
    private masterMeshes: Map<string, B.Mesh> = new Map();

    public async initialize(scene: B.Scene): Promise<void> {

        this.scene = scene;
        await this.initializeModels();

    }


    // Registra todos os modelos mestres aqui
    private async initializeModels(): Promise<void> {
        
        // this.registerTerrainPlane("terrain_default",       "terrain_transponivel");
        // this.registerTerrainPlane("terrain_transponivel",  "terrain_transponivel");
        // this.registerTerrainPlane("terrain_rocha",         "terrain_rocha");
        // this.registerTerrainPlane("terrain_cratera",       "terrain_cratera");
        this.registerTerrainPlane("terrain_objetivo",      "terrain_objetivo");
        this.registerTerrainPlane("terrain_surgimento",    "terrain_surgimento");
        // Montanha
        this.registerTerrainPlane("terrain_montanha_norte",    "terrain_montanha_norte");
        this.registerTerrainPlane("terrain_montanha_oeste",    "terrain_montanha_oeste");
        this.registerTerrainPlane("terrain_montanha_leste",    "terrain_montanha_leste");
        this.registerTerrainPlane("terrain_montanha_sul",    "terrain_montanha_sul");
        this.registerTerrainPlane("terrain_montanha_noroeste",    "terrain_montanha_noroeste");
        this.registerTerrainPlane("terrain_montanha_nordeste",    "terrain_montanha_nordeste");
        this.registerTerrainPlane("terrain_montanha_sudeste",    "terrain_montanha_sudeste");
        this.registerTerrainPlane("terrain_montanha_sudoeste",    "terrain_montanha_sudoeste");
        this.registerTerrainPlane("terrain_montanha_centro",    "terrain_montanha_centro");
        // Cratera Grande
        this.registerTerrainPlane("terrain_cratera_norte",    "terrain_cratera_norte");
        this.registerTerrainPlane("terrain_cratera_oeste",    "terrain_cratera_oeste");
        this.registerTerrainPlane("terrain_cratera_leste",    "terrain_cratera_leste");
        this.registerTerrainPlane("terrain_cratera_sul",    "terrain_cratera_sul");
        this.registerTerrainPlane("terrain_cratera_noroeste",    "terrain_cratera_noroeste");
        this.registerTerrainPlane("terrain_cratera_nordeste",    "terrain_cratera_nordeste");
        this.registerTerrainPlane("terrain_cratera_sudeste",    "terrain_cratera_sudeste");
        this.registerTerrainPlane("terrain_cratera_sudoeste",    "terrain_cratera_sudoeste");
        this.registerTerrainPlane("terrain_cratera_centro",    "terrain_cratera_centro");

        const masterObjetivoCube = B.MeshBuilder.CreateBox("master_objetivo_cubo", {}, this.scene);
        masterObjetivoCube.material = MaterialInstance.getMaterial("objetivo_cubo");
        masterObjetivoCube.setEnabled(false);
        this.masterMeshes.set("objetivo_cubo", masterObjetivoCube);

        const masterRoverBody = B.MeshBuilder.CreateBox("master_rover_body", {}, this.scene);
        masterRoverBody.material = MaterialInstance.getMaterial("rover_body");
        masterRoverBody.setEnabled(false);
        this.masterMeshes.set("rover_body", masterRoverBody);

        const masterRoverFrente = B.MeshBuilder.CreateBox("master_rover_frente", {}, this.scene);
        masterRoverFrente.material = MaterialInstance.getMaterial("rover_frente");
        masterRoverFrente.setEnabled(false);
        this.masterMeshes.set("rover_frente", masterRoverFrente);

        // const masterMarcador = B.MeshBuilder.CreateBox("master_marcador", {}, this.scene);
        // masterMarcador.material = MaterialInstance.getMaterial("marcador");
        // masterMarcador.setEnabled(false);
        // this.masterMeshes.set("marcador", masterMarcador);



        await Promise.all([
            this.loadModel("terrain_default",        "/models/terrain/TRANSPONIVEL.glb", .5),
            this.loadModel("terrain_transponivel",   "/models/terrain/TRANSPONIVEL.glb", .5),
            this.loadModel("terrain_cratera",   "/models/terrain/CRATERA.glb", .5),
            this.loadModel("terrain_rocha",   "/models/terrain/ROCHA.glb", .5),
            this.loadModel("terrain_objetivo",   "/models/terrain/OBJETIVO.glb", .5),
            this.loadModel("marcador",   "/models/others/MARCADOR.glb", 2),
        ]);

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


    private registerTerrainPlane(key: string, materialKey: string): void {
        const mesh = B.MeshBuilder.CreatePlane(`master_${key}`, {}, this.scene);
        mesh.material = MaterialInstance.getMaterial(materialKey);
        mesh.rotation = new B.Vector3(Math.PI / 2, 0, 0);
        mesh.setEnabled(false);
        this.masterMeshes.set(key, mesh);
    }


    private async loadModel(
        key: string,
        path: string,
        scaleFactor?: number
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

        if (children.length === 1 && children[0] instanceof B.Mesh) {
            // Caso simples: modelo com um único mesh
            children[0].parent = null;
            children[0].setEnabled(false);
            
            if (scaleFactor) {
                children[0].scaling = new B.Vector3(scaleFactor, scaleFactor, scaleFactor);
            }
            children[0].bakeCurrentTransformIntoVertices();

            this.masterMeshes.set(key, children[0]);
        
        } else if (children.length > 1) {
            // Caso complexo: vários sub-meshes → merge
            const merged = B.Mesh.MergeMeshes(
                children.filter(m => m instanceof B.Mesh) as B.Mesh[],
                true,   // disposeSource
                true,   // allow32BitsIndices
                undefined,
                false,  // subdivideWithSubMeshes
                true    // multiMultiMaterials (preserva materiais do .glb)
            );
        
            if (merged) {
                merged.setEnabled(false);
                merged.parent = null; // desvincula do __root__
                
                if (scaleFactor) {
                    merged.scaling = new B.Vector3(scaleFactor, scaleFactor, scaleFactor);
                }
                merged.bakeCurrentTransformIntoVertices();

                this.masterMeshes.set(key, merged);
            }

        }

        root.dispose(); // Limpa o nó __root__ agora desnecessário
    }



    // Retorna o mesh mestre diretamente (para casos especiais)
    public getMasterMesh(key: string): B.Mesh {
        const mesh = this.masterMeshes.get(key);

        if (!mesh) {
            throw new Error(`Modelo mestre "${key}" não encontrado no ModelManager.`);
        }

        return mesh;
    }


}


export const ModelInstance = new ModelManager();