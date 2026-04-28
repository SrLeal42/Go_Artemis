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
        // Terreno
        this.registerEmissive("terrain_transponivel", new B.Color3(0.2, 0.4, 0.8));
        this.registerEmissive("terrain_cratera",      new B.Color3(0.6, 0.2, 0.2));
        this.registerEmissive("terrain_rocha",        new B.Color3(0.8, 0.4, 0.2));
        this.registerEmissive("terrain_objetivo",     new B.Color3(0.2, 0.8, 0.2));
        this.registerEmissive("objetivo_cubo",        new B.Color3(0, 1, 0));
        this.registerEmissive("terrain_surgimento",   new B.Color3(0.9, 0.8, 0.2));
        // Montanha
        this.registerEmissive("terrain_montanha_norte",   new B.Color3(1, 1, 1));
        this.registerEmissive("terrain_montanha_oeste",   new B.Color3(.8, .8, .8));
        this.registerEmissive("terrain_montanha_leste",   new B.Color3(.6, .6, .6));
        this.registerEmissive("terrain_montanha_sul",   new B.Color3(.4, .4, .4));
        this.registerEmissive("terrain_montanha_noroeste",   new B.Color3(.3, .3, .3));
        this.registerEmissive("terrain_montanha_nordeste",   new B.Color3(.2, .2, .2));
        this.registerEmissive("terrain_montanha_sudeste",   new B.Color3(.1, .1, .1));
        this.registerEmissive("terrain_montanha_sudoeste",   new B.Color3(0, 0, 0));
        this.registerEmissive("terrain_montanha_centro",   new B.Color3(.9, .9, .9));
        // Cratera Grande
        this.registerEmissive("terrain_cratera_norte",   new B.Color3(1, .5, 1));
        this.registerEmissive("terrain_cratera_oeste",   new B.Color3(.8, 1, .8));
        this.registerEmissive("terrain_cratera_leste",   new B.Color3(.6, 1, .6));
        this.registerEmissive("terrain_cratera_sul",   new B.Color3(.4, 1, .4));
        this.registerEmissive("terrain_cratera_noroeste",   new B.Color3(.3, 1, .3));
        this.registerEmissive("terrain_cratera_nordeste",   new B.Color3(.2, 1, .2));
        this.registerEmissive("terrain_cratera_sudeste",   new B.Color3(.1, 1, .1));
        this.registerEmissive("terrain_cratera_sudoeste",   new B.Color3(0, 1, 0));
        this.registerEmissive("terrain_cratera_centro",   new B.Color3(.9, 1, .9));
        // Rover
        this.registerEmissive("rover_body",   new B.Color3(0.9, 0.4, 0.1));
        this.registerEmissive("rover_frente", new B.Color3(0.1, 0.1, 0.1));
        // Marcador
        this.registerEmissive("marcador", new B.Color3(1, 0, 0));
    }


    private registerEmissive(key: string, color: B.Color3): void {
        const mat = new B.StandardMaterial(`mat_${key}`, this.scene);
        mat.disableLighting = true;
        mat.emissiveColor = color;
        this.materials.set(key, mat);
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
