// scene3D/scripts/managers/ModelManager.ts
import * as B from '@babylonjs/core';
import { MaterialManager } from './MaterialManager';

export class ModelManager {

    private static instance: ModelManager | null = null;

    private scene: B.Scene;
    private masterMeshes: Map<string, B.Mesh> = new Map();

    private constructor(scene: B.Scene) {
        this.scene = scene;
        this.initializeModels();
    }

    public static initialize(scene: B.Scene): ModelManager {

        if (!ModelManager.instance) {
            ModelManager.instance = new ModelManager(scene);
        }

        return ModelManager.instance;
    }

    public static getInstance(): ModelManager {

        if (!ModelManager.instance) {
            throw new Error("ModelManager não foi inicializado. Chame initialize() primeiro.");
        }

        return ModelManager.instance;
    }

    // Registra todos os modelos mestres aqui
    private initializeModels(): void {
        const matManager = MaterialManager.getInstance();

        // Um mestre POR tipo de terreno, cada um com seu material
        const masterTransponivel = B.MeshBuilder.CreatePlane("master_transponivel", {}, this.scene)
        masterTransponivel.material = matManager.getMaterial("terrain_transponivel");
        // masterTransponivel.alwaysSelectAsActiveMesh = true;
        // masterTransponivel.isVisible = false;
        masterTransponivel.setEnabled(false);
        this.masterMeshes.set("terrain_transponivel", masterTransponivel);

        const masterObstaculo = B.MeshBuilder.CreatePlane("master_obstaculo", {}, this.scene)
        masterObstaculo.material = matManager.getMaterial("terrain_obstaculo");
        // masterObstaculo.alwaysSelectAsActiveMesh = true;
        // masterObstaculo.isVisible = false;
        masterObstaculo.setEnabled(false);
        this.masterMeshes.set("terrain_obstaculo", masterObstaculo);

        const masterObjetivo = B.MeshBuilder.CreatePlane("master_objetivo", {}, this.scene)
        masterObjetivo.material = matManager.getMaterial("terrain_objetivo");
        // masterObjetivo.alwaysSelectAsActiveMesh = true;
        // masterObjetivo.isVisible = false;
        masterObjetivo.setEnabled(false);
        this.masterMeshes.set("terrain_objetivo", masterObjetivo);

        // Rover (esse já estava certo)
        const masterRoverBody = B.MeshBuilder.CreateBox("master_rover_body", {}, this.scene);
        masterRoverBody.material = matManager.getMaterial("rover_body");
        masterRoverBody.isVisible = false;
        this.masterMeshes.set("rover_body", masterRoverBody);
    }


    // Cria uma instância de um modelo mestre
    // public createInstance(masterKey: string, instanceName: string): B.InstancedMesh {
    //     const master = this.masterMeshes.get(masterKey);

    //     if (!master) {
    //         throw new Error(`Modelo mestre "${masterKey}" não encontrado no ModelManager.`);
    //     }

    //     return master.createInstance(instanceName);
    // }

    public createInstance(masterKey: string, instanceName: string): B.AbstractMesh | null {
        const master = this.masterMeshes.get(masterKey);

        if (!master) {
            throw new Error(`Modelo mestre "${masterKey}" não encontrado no ModelManager.`);
        }

        const instance = master.instantiateHierarchy(undefined, undefined);
        
        if (!instance) {
            console.warn(`Falha ao instanciar "${masterKey}"`);
            return null;
        }

        instance.setEnabled(true);
        instance.name = instanceName;

        // Se o root for um mesh, retorna ele. Senão, pega o primeiro filho.
        if (instance instanceof B.AbstractMesh) {
            return instance;
        }
        
        const meshes = instance.getChildMeshes(false);
        return meshes.length > 0 ? meshes[0] : null;
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
