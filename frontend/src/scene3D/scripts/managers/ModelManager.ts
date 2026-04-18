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

        // Um mestre POR tipo de terreno, cada um com seu material
        const masterTransponivel = B.MeshBuilder.CreatePlane("master_transponivel", {}, this.scene)
        masterTransponivel.material = MaterialInstance.getMaterial("terrain_transponivel");
        masterTransponivel.rotation = new B.Vector3(Math.PI/2, 0, 0);
        masterTransponivel.setEnabled(false);
        this.masterMeshes.set("terrain_transponivel", masterTransponivel);

        const masterObstaculo = B.MeshBuilder.CreatePlane("master_obstaculo", {}, this.scene)
        masterObstaculo.material = MaterialInstance.getMaterial("terrain_obstaculo");
        masterObstaculo.rotation = new B.Vector3(Math.PI/2, 0, 0);
        masterObstaculo.setEnabled(false);
        this.masterMeshes.set("terrain_obstaculo", masterObstaculo);

        const masterObjetivo = B.MeshBuilder.CreatePlane("master_objetivo", {}, this.scene)
        masterObjetivo.material = MaterialInstance.getMaterial("terrain_objetivo");
        masterObjetivo.rotation = new B.Vector3(Math.PI/2, 0, 0);
        masterObjetivo.setEnabled(false);
        this.masterMeshes.set("terrain_objetivo", masterObjetivo);

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