import * as B from '@babylonjs/core';
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
    public mesh!: B.Mesh | null;
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

        const root = new B.TransformNode(`Root_Cell_${this.x},${this.z}`, this.scene);

        const plane = B.MeshBuilder.CreatePlane(`Plane_Cell_${this.x},${this.z}`, {}, this.scene)
        const planeMat = new B.StandardMaterial("cellMat", this.scene);
        planeMat.disableLighting = true;

        if (this.chosenTile === TerrainTypes.TRANSPONIVEL) {
            planeMat.emissiveColor = new B.Color3(0.2, 0.4, 0.8); // Azul (Caminho livre)
        } else if (this.chosenTile === TerrainTypes.OBSTACULO) {
            planeMat.emissiveColor = new B.Color3(0.8, 0.2, 0.2); // Vermelho (Parede/Pedra)
        } else if (this.chosenTile === TerrainTypes.OBJETIVO) {
            planeMat.emissiveColor = new B.Color3(0.2, 0.8, 0.2); // Verde (Chegada)
        }

        plane.material = planeMat;

        plane.parent = root;

        this.mesh = plane;
        this.meshNode = root;

        const position = new B.Vector3((this.x * TerrainCell.cellSize ), (this.y * TerrainCell.cellSize ), (this.z * TerrainCell.cellSize ))
        this.meshNode.rotation = new B.Vector3((Math.PI/2), 0, 0);
        this.meshNode.scaling = new B.Vector3(this.meshSize, this.meshSize, this.meshSize);
        this.meshNode.position = position;

        
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