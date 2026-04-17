// scene3D/scripts/managers/MaterialManager.ts
import * as B from '@babylonjs/core';
import { TerrainTypes } from '../terrain/TerrainTypes';

export class MaterialManager {

    private static instance: MaterialManager | null = null;

    private scene: B.Scene;
    private materials: Map<string, B.Material> = new Map();

    private constructor(scene: B.Scene) {
        this.scene = scene;
        this.initializeMaterials();
    }

    public static initialize(scene: B.Scene): MaterialManager {
        if (!MaterialManager.instance) {
            MaterialManager.instance = new MaterialManager(scene);
        }
        return MaterialManager.instance;
    }

    public static getInstance(): MaterialManager {
        if (!MaterialManager.instance) {
            throw new Error("MaterialManager não foi inicializado. Chame initialize() primeiro.");
        }
        return MaterialManager.instance;
    }

    // Registra todos os materiais do jogo aqui
    private initializeMaterials(): void {
        // --- Materiais do Terreno ---
        const matTransponivel = new B.StandardMaterial("mat_transponivel", this.scene);
        matTransponivel.disableLighting = true;
        matTransponivel.emissiveColor = new B.Color3(0.2, 0.4, 0.8);
        this.materials.set("terrain_transponivel", matTransponivel);

        const matObstaculo = new B.StandardMaterial("mat_obstaculo", this.scene);
        matObstaculo.disableLighting = true;
        matObstaculo.emissiveColor = new B.Color3(0.8, 0.2, 0.2);
        this.materials.set("terrain_obstaculo", matObstaculo);

        const matObjetivo = new B.StandardMaterial("mat_objetivo", this.scene);
        matObjetivo.disableLighting = true;
        matObjetivo.emissiveColor = new B.Color3(0.2, 0.8, 0.2);
        this.materials.set("terrain_objetivo", matObjetivo);

        // --- Material do Rover ---
        const matRover = new B.StandardMaterial("mat_rover", this.scene);
        matRover.disableLighting = true;
        matRover.emissiveColor = new B.Color3(0.9, 0.4, 0.1);
        this.materials.set("rover_body", matRover);

        const matRoverFrente = new B.StandardMaterial("mat_rover_frente", this.scene);
        matRoverFrente.disableLighting = true;
        matRoverFrente.emissiveColor = new B.Color3(0.1, 0.1, 0.1);
        this.materials.set("rover_frente", matRoverFrente);
    }

    // Método público para pegar um material por chave
    public getMaterial(key: string): B.Material {
        const mat = this.materials.get(key);
        if (!mat) {
            throw new Error(`Material "${key}" não encontrado no MaterialManager.`);
        }
        return mat;
    }

    // Atalho útil: pega o material pelo TerrainType diretamente
    public getTerrainMaterial(type: number): B.Material {
        switch (type) {
            case TerrainTypes.TRANSPONIVEL: return this.getMaterial("terrain_transponivel");
            case TerrainTypes.OBSTACULO:    return this.getMaterial("terrain_obstaculo");
            case TerrainTypes.OBJETIVO:     return this.getMaterial("terrain_objetivo");
            default: return this.getMaterial("terrain_transponivel");
        }
    }
}
