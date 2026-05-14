import * as B from '@babylonjs/core';

import { TerrainCell } from '../terrain/TerrainCell';
import { RoverWorldDirection, RoverRelativeDirection } from './RoverDirection';

import { ModelInstance } from '../managers/ModelManager';
import { AnimationInstance } from '../managers/AnimationManager';

import { delay } from '../utilities/Utilities';

export class Rover {

    public scene: B.Scene;

    public gridX: number;
    public gridZ: number;

    public pivot : B.TransformNode;
    
    public roverSize = .1;
    public roverMesh? : B.Node;

    public facingDirection: RoverWorldDirection = RoverWorldDirection.NORTH;
    // Tabela fixa: para cada direção absoluta, qual o deslocamento no grid (deltaX, deltaZ)
    private static readonly DIRECTION_OFFSETS: Record<number, [number, number]> = {
        [RoverWorldDirection.NORTH]: [0, -1],
        [RoverWorldDirection.EAST]:  [-1, 0],
        [RoverWorldDirection.SOUTH]: [0,  1],
        [RoverWorldDirection.WEST]:  [1,  0],
    };

    // Animação para se mover
    private currentMovement: B.Animatable | null = null;
    private moveAnimX: B.Animation;
    private moveAnimZ: B.Animation;
    private moveAnimSpeed = .5;
    private idleAnimSpeed = .5;
    // private moveEasing: B.EasingFunction;

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

        const { rootNodes, animationGroups } = ModelInstance.spawnAnimated("rover", "rover_player");
        
        const roverRoot = rootNodes[0];

        // Guardar referência das animações para controle posterior
        AnimationInstance.register("rover", animationGroups);

        roverRoot.parent = pivot;
        
        this.pivot = pivot;
        this.roverMesh = roverRoot;

        this.pivot.position.y += .63//this.roverSize / 2; 
        // this.pivot.rotation = new B.Vector3(0, Math.PI, 0);
        this.pivot.scaling = new B.Vector3(this.roverSize, this.roverSize, this.roverSize);
        this.setGridPosition(this.gridX, this.gridZ);

        // Iniciando a animação idle
        AnimationInstance.play('rover', 'idle_animation', true, this.idleAnimSpeed);

        // Criando a animação para movimento
        const ease = new B.CubicEase();
        ease.setEasingMode(B.EasingFunction.EASINGMODE_EASEINOUT);
        
        this.moveAnimX = new B.Animation("roverMoveX", "position.x", AnimationInstance.fps,
            B.Animation.ANIMATIONTYPE_FLOAT,
            B.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        this.moveAnimX.setEasingFunction(ease);
        
        this.moveAnimZ = new B.Animation("roverMoveZ", "position.z", AnimationInstance.fps,
            B.Animation.ANIMATIONTYPE_FLOAT,
            B.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        this.moveAnimZ.setEasingFunction(ease);

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

    public async move(targetX: number, targetZ: number, direction: RoverRelativeDirection): Promise<void> {

        if (direction === RoverRelativeDirection.FRENTE){
            
            const duration = AnimationInstance.getDurationMs("rover", "girar-frente_animation") / this.moveAnimSpeed;
            
            AnimationInstance.play("rover", "girar-frente_animation", false, this.moveAnimSpeed);
            
            await this.animateToPosition(targetX, targetZ, duration);

        } else {
            
            await delay(2000);
            
            this.setGridPosition(targetX, targetZ);
        }    

    }


    public async turn(relativeDir: RoverRelativeDirection): Promise<void> {
        const arrayRoverDirection = Object.values(RoverWorldDirection);
        
        await delay(1000);

        // DIREITA (1): (facing + 1) % 4
        // ESQUERDA (3): (facing + 3) % 4
        this.facingDirection = arrayRoverDirection[(this.facingDirection + relativeDir) % 4];
        
        if (this.pivot) {
            this.pivot.rotation.y = this.facingDirection * (Math.PI / 2);
        }
        
        

    }


    private animateToPosition(targetX: number, targetZ: number, durationMs: number): Promise<void> {
        return new Promise((resolve) => {
            const worldX = targetX * TerrainCell.cellSize;
            const worldZ = targetZ * TerrainCell.cellSize;
            const totalFrames = Math.round((durationMs / 1000) * AnimationInstance.fps);

            // Só atualiza os keyframes — sem recriar nada
            this.moveAnimX.setKeys([
                { frame: 0, value: this.pivot.position.x },
                { frame: totalFrames, value: worldX }
            ]);

            this.moveAnimZ.setKeys([
                { frame: 0, value: this.pivot.position.z },
                { frame: totalFrames, value: worldZ }
            ]);
            
            this.currentMovement = this.scene.beginDirectAnimation(
                this.pivot,
                [this.moveAnimX, this.moveAnimZ],
                0, totalFrames,
                false, 1,
                () => {
                    this.gridX = targetX;
                    this.gridZ = targetZ;
                    this.pivot.position.x = worldX;
                    this.pivot.position.z = worldZ;
                    resolve();
                }
            );
        
            this.currentMovement.onAnimationEndObservable.addOnce(() => resolve());

        });

    }


    public reset(spawnX: number, spawnZ: number): void {
        this.scene.stopAnimation(this.pivot);
        this.currentMovement = null;
        
        AnimationInstance.stop("rover");
        
        this.setGridPosition(spawnX, spawnZ);
        
        this.facingDirection = RoverWorldDirection.NORTH;
        
        if (this.pivot) {
            this.pivot.rotation.y = 0;
        }
        
        AnimationInstance.play("rover", "idle_animation", true, this.idleAnimSpeed);
    }

}