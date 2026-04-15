import * as B from '@babylonjs/core';

import { TerrainCell } from '../terrain/TerrainCell';
import { RoverDirection } from './RoverDirection';

import { delay } from '../utilities/Utilities';

export class Rover {

    public scene: B.Scene;



    public gridX: number;
    public gridZ: number;

    public pivot : B.TransformNode;
    
    public roverSize = 1;
    public roverMesh? : B.Mesh;

    public facingDirection: RoverDirection = RoverDirection.NORTH;

    public isInicialized = false;

    constructor(scene: B.Scene, gridX: number, gridZ: number){

        this.scene = scene;

        this.gridX = gridX;
        this.gridZ = gridZ;

        this.initialize();

    }


    public async initialize(): Promise<void> {        
        this.createModel();

        this.isInicialized = true; 
    }



    private async createModel(): Promise<void> {

        const pivot = new B.TransformNode(`Pivot_Rover`, this.scene);

        const rover = B.MeshBuilder.CreateBox("rover", {}, this.scene);
        // rover.position.y = 0.5; // Sobe o cubo 0.5 para que ele "pise" no chão e não afunde metade 
        const roverMat = new B.StandardMaterial("roverMat", this.scene);
        roverMat.disableLighting = true;
        roverMat.emissiveColor = new B.Color3(0.9, 0.4, 0.1); 
        rover.material = roverMat;

        rover.parent = pivot;
        
        this.pivot = pivot;
        this.roverMesh = rover;

        this.pivot.position.y = this.roverSize / 2; 
        // this.meshNode.rotation = new B.Vector3((Math.PI/2), 0, 0);
        this.pivot.scaling = new B.Vector3(this.roverSize, this.roverSize, this.roverSize);
        this.setGridPosition(this.gridX, this.gridZ); 

    }


    
    public setGridPosition(gridX: number, gridZ: number) : void {
        // Atualiza as coordenadas virtuais
        this.gridX = gridX;
        this.gridZ = gridZ;
        // Converte para coordenadas reais do Mundo e move o Pivot
        if (this.pivot) {
            this.pivot.position.x = gridX * TerrainCell.cellSize;
            this.pivot.position.z = gridZ * TerrainCell.cellSize;
        }
    }

    public async moveForward(value: number): Promise<void> {
        console.log(`[INÍCIO] INICIANDO MOVIMENTO FRENTE: ${value} unidades`);

        for (let i = 0; i < value; i++) {
            let targetX = this.gridX;
            let targetZ = this.gridZ;
            // Calcula o destino baseado para onde ele tá olhando
            switch (this.facingDirection) {
                case RoverDirection.NORTH: targetZ -= 1; break;
                case RoverDirection.SOUTH: targetZ += 1; break;
                case RoverDirection.EAST:  targetX -= 1; break;
                case RoverDirection.WEST:  targetX += 1; break;
            }

            this.setGridPosition(targetX, targetZ);

            await delay(1000); // espera 1 segundo antes da próxima iteração
        }

        console.log(`[FIM] TERMINOU DE MOVER FRENTE`);
    }

    
    public async moveBackward(value : number): Promise<void> {
        console.log(`[INÍCIO] INICIANDO MOVIMENTO TRÁS: ${value} unidades`);
        
        for (let i = 0; i < value; i++) {
            let targetX = this.gridX;
            let targetZ = this.gridZ;
            // Calcula o destino baseado para onde ele tá olhando
            switch (this.facingDirection) {
                case RoverDirection.NORTH: targetZ += 1; break;
                case RoverDirection.SOUTH: targetZ -= 1; break;
                case RoverDirection.EAST:  targetX += 1; break;
                case RoverDirection.WEST:  targetX -= 1; break;
            }


            this.setGridPosition(targetX, targetZ);

            await delay(2000); // espera 1 segundo antes da próxima iteração
        }

        console.log(`[FIM] TERMINOU DE MOVER TRÁS`);

    }



}