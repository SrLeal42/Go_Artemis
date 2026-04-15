import * as B from '@babylonjs/core';

import { TerrainCell } from './TerrainCell';

export class Terrain {

    public scene: B.Scene;

    public terrainGrid : Map<string, TerrainCell> = new Map();;
    
    public gridSize = 5;

    public isInicialized = false;

    constructor(scene : B.Scene){
        this.scene = scene;
    }

    public async initialize(): Promise<void> {        
        this.initializeGrid();

        this.isInicialized = true; 
    }

    private initializeGrid() : void {

        for(let x = -this.gridSize; x <= this.gridSize; x++){
            for(let z = -this.gridSize; z <= this.gridSize; z++){
                this.createCell(x, 0, z);
            }
        }

    }


    private createCell(x: number, y: number, z: number) : void {
        const cellKey = `${x},${y},${z}`;

        const newCell = new TerrainCell(this.scene, x, y, z);

        this.terrainGrid.set(cellKey, newCell);

    }



}