import * as B from '@babylonjs/core';

import { ModelInstance } from '../managers/ModelManager';

import { ALL_BLINKING_LIGHTS, type BlinkingLightConfig } from '../utilities/LightingConstants';


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
    public meshSize = TerrainCell.cellSize * .98;//* .5;
    public mesh!: B.AbstractMesh | null;
    public meshNode!: B.TransformNode | null;
    
    // Para os modelos com luz piscando
    public glowMesh!: B.AbstractMesh | null; 
    public glowLights: B.PointLight[] = [];

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

        for (const lightConfig of ALL_BLINKING_LIGHTS) {
            if (this.modelKey === lightConfig.MODEL_KEY) {
                this.setupGlowLights(lightConfig);
                break;
            }
        }

        this.mesh = instance;
        
    }


    private setupGlowLights(config: BlinkingLightConfig): void {
        
        const glow = ModelInstance.createInstance(config.GLOW_KEY, `cell_glow_${this.x}_${this.z}`);
        glow.scaling = new B.Vector3(this.meshSize, this.meshSize, this.meshSize);
        glow.position = new B.Vector3(
            this.x * TerrainCell.cellSize,
            this.y * TerrainCell.cellSize,
            this.z * TerrainCell.cellSize
        );
        this.glowMesh = glow;

        const lampPositions = ModelInstance.getModelPositions(config.GLOW_KEY);
        const cellOrigin = new B.Vector3(
            this.x * TerrainCell.cellSize,
            this.y * TerrainCell.cellSize,
            this.z * TerrainCell.cellSize
        );

        for (let i = 0; i < lampPositions.length; i++) {
            const light = new B.PointLight(
                `light_${config.MODEL_KEY}_${this.x}_${this.z}_${i}`,
                cellOrigin.add(lampPositions[i].scale(this.meshSize)),
                this.scene
            );
            light.intensity = config.POINT_INITIAL_INTENSITY;
            light.diffuse = config.COLOR.clone();
            light.range = config.POINT_RANGE;
            this.glowLights.push(light);
        }


    }




    public mark(): void {

        if (this.marked) {
            return;
        }

        if (this.markerMesh){
            this.markerMesh.dispose();
            this.markerMesh = null;
        }

        const instance = ModelInstance.createInstance('marcador', `marcador_${this.x}_${this.z}`);
        instance.position = new B.Vector3(
            this.x * TerrainCell.cellSize,
            this.y * TerrainCell.cellSize,
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

        if (this.glowMesh) {
            this.glowMesh.dispose();
            this.glowMesh = null;
        }

        for (const light of this.glowLights) {
            light.dispose();
        }
        this.glowLights = [];


    }



}