import * as B from '@babylonjs/core';

import { TerrainCell } from '../terrain/TerrainCell';
import { RoverWorldDirection, RoverRelativeDirection } from './RoverDirection';

import { ModelInstance } from '../managers/ModelManager';

import { delay } from '../utilities/Utilities';

export class Rover {

    public scene: B.Scene;

    public gridX: number;
    public gridZ: number;

    public pivot : B.TransformNode;
    
    public roverSize = 1;
    public roverMesh? : B.InstancedMesh;

    public facingDirection: RoverWorldDirection = RoverWorldDirection.NORTH;
    // Tabela fixa: para cada direção absoluta, qual o deslocamento no grid (deltaX, deltaZ)
    private static readonly DIRECTION_OFFSETS: Record<number, [number, number]> = {
        [RoverWorldDirection.NORTH]: [0, -1],
        [RoverWorldDirection.EAST]:  [-1, 0],
        [RoverWorldDirection.SOUTH]: [0,  1],
        [RoverWorldDirection.WEST]:  [1,  0],
    };

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

        const rover = ModelInstance.createInstance("rover_body", "Rover");

        // Uma caixa placeholder apenas para poder ver onde esta a frente do Rover
        const frenteRover = ModelInstance.createInstance("rover_frente", "Rover_frente")

        frenteRover.position.z = -1;
        frenteRover.parent = rover;

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

    

    public getGridPosition(): [number, number] {
        return [this.gridX, this.gridZ]
    } 

    public getAdjacentGridPosition(relativeSide: RoverRelativeDirection): [number, number] {
    
        // Mapeia o lado relativo para um "offset de rotação" no círculo de direções
        // const relativeOffset: Record<string, number> = {
        //     "FRENTE":   0,
        //     "DIREITA":  1,
        //     "TRAS":     2,
        //     "ESQUERDA": 3,
        // };
        // Calcula a direção absoluta no mundo
        const absoluteDir = (this.facingDirection + relativeSide) % 4;
        // Consulta a tabela de offsets
        const [dx, dz] = Rover.DIRECTION_OFFSETS[absoluteDir];
        return [this.gridX + dx, this.gridZ + dz];
    }


    public async moveForward(value: number): Promise<void> {

        for (let i = 0; i < value; i++) {
            const [targetX, targetZ] = this.getAdjacentGridPosition(RoverRelativeDirection.FRENTE);
            this.setGridPosition(targetX, targetZ);

            await delay(1000);
        }

    }

    
    public async moveBackward(value : number): Promise<void> {

        for (let i = 0; i < value; i++) {
            const [targetX, targetZ] = this.getAdjacentGridPosition(RoverRelativeDirection.TRAS);
            this.setGridPosition(targetX, targetZ);


            this.setGridPosition(targetX, targetZ);

            await delay(2000);
        }

    }


    public async turn(relativeDir: RoverRelativeDirection): Promise<void> {
        const arrayRoverDirection = Object.values(RoverWorldDirection);
        
        // DIREITA (1): (facing + 1) % 4
        // ESQUERDA (3): (facing + 3) % 4
        this.facingDirection = arrayRoverDirection[(this.facingDirection + relativeDir) % 4];
        
        if (this.pivot) {
            this.pivot.rotation.y = this.facingDirection * (Math.PI / 2);
        }
        
        await delay(1000);

    }


}