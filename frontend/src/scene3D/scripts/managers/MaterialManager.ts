import * as B from '@babylonjs/core';

class MaterialManager {

    private scene: B.Scene;
    private materials: Map<string, B.Material> = new Map();


    public async initialize(scene: B.Scene): Promise<void> {
        this.scene = scene;        
        this.initializeMaterials();

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

        const matObjetivoCubo = new B.StandardMaterial("mat_objetivo_cubo", this.scene);
        matObjetivoCubo.disableLighting = true;
        matObjetivoCubo.emissiveColor = new B.Color3(0, 1, 0);
        this.materials.set("objetivo_cubo", matObjetivoCubo);

        const matSurgimento = new B.StandardMaterial("mat_surgimento", this.scene);
        matSurgimento.disableLighting = true;
        matSurgimento.emissiveColor = new B.Color3(0.9, 0.8, 0.2);
        this.materials.set("terrain_surgimento", matSurgimento);

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

}


export const MaterialInstance = new MaterialManager();
