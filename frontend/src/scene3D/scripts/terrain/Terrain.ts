import * as B from '@babylonjs/core';

import { TerrainTypes, TILE_ID_TO_TYPE, TileTraversal, TILE_TRAVERSAL_TO_TYPE } from './TerrainTypes';

import { TerrainCell } from './TerrainCell';

import { WFCSolver } from '../wfc/WFCSolver';
import wfcRules from '../wfc/WFC_Rules.json';

export class Terrain {

    public scene: B.Scene;

    public terrainGrid : Map<string, TerrainCell> = new Map();
    
    public gridSize = 5;

    public wfcSolver : WFCSolver;

    public goalPosition: { x: number; z: number } = { x: 0, z: 0 };
    public spawnPosition: { x: number; z: number } = { x: 0, z: 0 };

    public isInicialized = false;

    constructor(scene : B.Scene){
        this.scene = scene;
    }

    public async initialize(): Promise<void> {

        this.wfcSolver = new WFCSolver(wfcRules, this.gridSize);

        // this.initializeGrid();
        this.generate();

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


    private createCell(x: number, y: number, z: number, tileType: number, traversal: number, modelKey: string): void {

        const cellKey = `${x},${y},${z}`;

        const newCell = new TerrainCell(this.scene, x, y, z, tileType, traversal, modelKey);

        this.terrainGrid.set(cellKey, newCell);

    }



    public generate(): void {
        
        this.wfcSolver = new WFCSolver(wfcRules, this.gridSize);
        const result = this.wfcSolver.solve();
        
        if (!result) {
            console.error("ERRO: Falha ao regenerar terreno via WFC!");
            return;
        }

        for (let x = -this.gridSize; x <= this.gridSize; x++) {
            for (let z = -this.gridSize; z <= this.gridSize; z++) {
        
                const entry = result.get(`${x},${z}`)!;
                const tileType = TILE_ID_TO_TYPE[entry.tileId] ?? TerrainTypes.TRANSPONIVEL;
                const traversal = TILE_TRAVERSAL_TO_TYPE[entry.traversal] ?? TileTraversal.PASSABLE;
        
                if (tileType === TerrainTypes.SURGIMENTO) {
                    this.spawnPosition = { x, z };
                } else if (tileType === TerrainTypes.OBJETIVO) {
                    this.goalPosition = { x, z };
                }

                const cellKey = `${x},0,${z}`;
                
                const cell = this.terrainGrid.get(cellKey);
                
                if (cell) {
                    cell.chosenTile = tileType;
                    cell.traversal = traversal;
                    cell.modelKey = entry.modelKey;
                    cell.changeMesh(); // Já faz dispose da mesh antiga + cria a nova
                } else {
                    this.createCell(x, 0, z, tileType, traversal, entry.modelKey);
                }

            }
        }


    }


    public reset(): void {
        for (const cell of this.terrainGrid.values()){
            cell.reset();
        } 
    }



}