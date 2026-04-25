import * as B from '@babylonjs/core';
import { MaterialInstance } from './MaterialManager';

class ModelManager {

    private scene: B.Scene;
    private masterMeshes: Map<string, B.Mesh> = new Map();

    public async initialize(scene: B.Scene): Promise<void> {

        this.scene = scene;
        this.initializeModels();

    }


    // Registra todos os modelos mestres aqui
    private initializeModels(): void {
        
        this.registerTerrainPlane("terrain_default",       "terrain_transponivel");
        this.registerTerrainPlane("terrain_transponivel",  "terrain_transponivel");
        this.registerTerrainPlane("terrain_rocha",         "terrain_rocha");
        this.registerTerrainPlane("terrain_cratera",       "terrain_cratera");
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
    }


    // Cria uma instância de um modelo mestre
    public createInstance(masterKey: string, instanceName: string): B.InstancedMesh {
        const master = this.masterMeshes.get(masterKey);

        if (!master) {
            throw new Error(`Modelo mestre "${masterKey}" não encontrado no ModelManager.`);
        }

        return master.createInstance(instanceName);
    }


    private registerTerrainPlane(key: string, materialKey: string): void {
        const mesh = B.MeshBuilder.CreatePlane(`master_${key}`, {}, this.scene);
        mesh.material = MaterialInstance.getMaterial(materialKey);
        mesh.rotation = new B.Vector3(Math.PI / 2, 0, 0);
        mesh.setEnabled(false);
        this.masterMeshes.set(key, mesh);
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