import * as B from '@babylonjs/core';

import { ModelManager } from '../managers/ModelManager';

import { TerrainTypes } from './TerrainTypes';

export class TerrainCell {

    public scene : B.Scene;

    public gridX: number;
    public gridY: number;

    public x: number;
    public y: number;
    public z: number;

    public possibleTilesStart: Set<number>;
    public possibleTiles: Set<number>;
    public collapsed: boolean;
    public chosenTile: number | null;

    public static cellSize = 5;
    public meshSize = TerrainCell.cellSize * .95;//* .5;
    public mesh!: B.AbstractMesh | null;
    public meshNode!: B.TransformNode | null;

    constructor(
        scene: B.Scene,
        x: number,
        y: number,
        z: number,
        // totalNumTiles: number,
    ) {

        this.scene = scene;

        this.x = x;
        this.y = y;
        this.z = z;

        // const allPossibleNumericIDs = new Set<number>();
        // for (let i = 0; i < totalNumTiles; i++) {
        //     allPossibleNumericIDs.add(i);
        // }

        // this.possibleTilesStart = new Set(allPossibleNumericIDs);
        // this.possibleTiles = new Set(allPossibleNumericIDs);

        // this.collapsed = false;
        // this.chosenTile = null;

        // Pega todas as chaves numéricas do Enum (0, 1, 2 no caso)
        const possiveisTipos = [TerrainTypes.TRANSPONIVEL, TerrainTypes.OBSTACULO, TerrainTypes.OBJETIVO]; 

        // Sorteia um índice aleatório (0, 1 ou 2)
        const indiceSorteado = Math.floor(Math.random() * possiveisTipos.length);

        // Atribui o tipo sorteado à célula
        this.chosenTile = possiveisTipos[indiceSorteado];
        this.collapsed = true;


        this.changeMesh();

    }

    public changeMesh(/* key:string */) : void {
        this.disposeMesh();
        
        const modelManager = ModelManager.getInstance();
        
        let masterKey: string;
        
        switch (this.chosenTile) {
            case TerrainTypes.OBSTACULO: masterKey = "terrain_obstaculo"; break;
            case TerrainTypes.OBJETIVO:  masterKey = "terrain_objetivo";  break;
            default:                     masterKey = "terrain_transponivel"; break;
        }
        
        const instance = modelManager.createInstance(masterKey, `cell_${this.x}_${this.z}`);
        // console.log(instance.rotation)
        instance.scaling = new B.Vector3(this.meshSize, this.meshSize, this.meshSize);
        instance.position = new B.Vector3(
            this.x * TerrainCell.cellSize,
            this.y * TerrainCell.cellSize,
            this.z * TerrainCell.cellSize
        );

        this.mesh = instance;
        
    }


    public disposeMesh() : void {

        if (this.meshNode){
            this.meshNode.dispose(); 
            this.meshNode = null;
        }

        if(this.mesh){
            this.mesh = null;
        }

    }



}