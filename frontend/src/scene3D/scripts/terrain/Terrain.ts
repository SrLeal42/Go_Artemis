import * as B from '@babylonjs/core';

import { TerrainTypes, TILE_ID_TO_TYPE } from './TerrainTypes';

import { TerrainCell } from './TerrainCell';

import { WFCSolver } from '../wfc/WFCSolver';
import wfcRules from '../wfc/WFC_Rules.json';

export class Terrain {

    public scene: B.Scene;

    public terrainGrid : Map<string, TerrainCell> = new Map();;
    
    public gridSize = 5;

    public wfcSolver : WFCSolver;

    public spawnPosition: { x: number; z: number } = { x: 0, z: 0 };

    public isInicialized = false;

    constructor(scene : B.Scene){
        this.scene = scene;
    }

    public async initialize(): Promise<void> {

        this.wfcSolver = new WFCSolver(wfcRules, this.gridSize);

        this.initializeGrid();

        this.isInicialized = true; 
    }

    // private debugPrintGrid(result: Map<string, string>): void {
    //     // Mapa de símbolos curtos para cada tile
    //     const symbols: Record<string, string> = {
    //         "TRANSPONIVEL": "·",
    //         "OBSTACULO":    "█",
    //         "OBJETIVO":     "★",
    //         "SURGIMENTO":   "◎",
    //     };

    //     console.log("\n=== WFC Result ===");

    //     for (let z = -this.gridSize; z <= this.gridSize; z++) {
    //         let row = "";
    //         for (let x = -this.gridSize; x <= this.gridSize; x++) {
    //             const tile = result.get(`${x},${z}`);
    //             row += (symbols[tile ?? ""] ?? "?") + " ";
    //         }
    //         console.log(row);
    //     }

    //     console.log("==================\n");
    //     console.log("Legenda: · = Transponível | █ = Obstáculo | ★ = Objetivo | ◎ = Surgimento");
    // }



    private initializeGrid(): void {
        const result = this.wfcSolver.solve();

        if (!result) {
            console.error("ERRO: Falha ao gerar terreno via WFC!");
            return;
        }

        for (let x = -this.gridSize; x <= this.gridSize; x++) {
            for (let z = -this.gridSize; z <= this.gridSize; z++) {

                const tileId = result.get(`${x},${z}`)!;

                const tileType = TILE_ID_TO_TYPE[tileId] ?? TerrainTypes.TRANSPONIVEL;

                if (tileType === TerrainTypes.SURGIMENTO) {
                    this.spawnPosition = { x, z };
                }

                this.createCell(x, 0, z, tileType);

            }
        }

    }


    private createCell(x: number, y: number, z: number, tileType: number): void {

        const cellKey = `${x},${y},${z}`;

        const newCell = new TerrainCell(this.scene, x, y, z, tileType);

        this.terrainGrid.set(cellKey, newCell);

    }



}