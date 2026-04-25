import * as B from '@babylonjs/core';

import { ModelInstance } from '../managers/ModelManager';

export class TerrainCell {

    public scene : B.Scene;

    public gridX: number;
    public gridY: number;

    public x: number;
    public y: number;
    public z: number;

    public collapsed: boolean;
    public chosenTile: number | null;
    public traversal: number | null;

    public marked: boolean = false;
    public markerMesh: B.AbstractMesh;

    public modelKey: string | null;
    public static cellSize = 5;
    public meshSize = TerrainCell.cellSize * .95;//* .5;
    public mesh!: B.AbstractMesh | null;
    public meshNode!: B.TransformNode | null;

    constructor(
        scene: B.Scene,
        x: number, y: number, z: number,
        tileType: number,
        traversal: number,
        modelKey: string,
    ) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.z = z;
        
        this.chosenTile = tileType;
        this.collapsed = true;
        this.traversal = traversal;

        this.modelKey = modelKey;
        this.changeMesh();
    }

    public changeMesh(/* key:string */) : void {
        this.disposeMesh();
        
        const key = !this.modelKey ? 'terrain_default' : this.modelKey;

        const instance = ModelInstance.createInstance(key, `cell_${this.x}_${this.z}`);

        instance.scaling = new B.Vector3(this.meshSize, this.meshSize, this.meshSize);
        instance.position = new B.Vector3(
            this.x * TerrainCell.cellSize,
            this.y * TerrainCell.cellSize,
            this.z * TerrainCell.cellSize
        );

        this.mesh = instance;
        
    }


    public mark(): void {

        if (this.markerMesh){
            this.markerMesh.dispose();
            this.markerMesh = null;
        }

        const instance = ModelInstance.createInstance('marcador', `marcador_${this.x}_${this.z}`);
        instance.position = new B.Vector3(
            this.x * TerrainCell.cellSize,
            this.y * TerrainCell.cellSize + .5,
            this.z * TerrainCell.cellSize
        );

        this.markerMesh = instance;

        this.marked = true;
    }

    
    public reset(): void {
        if (this.markerMesh){
            this.markerMesh.dispose();
            this.markerMesh = null;
        }

        this.marked = false;
    }


    public disposeMesh() : void {

        if (this.markerMesh){
            this.markerMesh.dispose();
            this.markerMesh = null;
        }

        if (this.meshNode){
            this.meshNode.dispose(); 
            this.meshNode = null;
        }

        if(this.mesh){
            this.mesh.dispose();
            this.mesh = null;
        }

    }



}