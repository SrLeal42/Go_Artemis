import * as B from '@babylonjs/core';

import { TerrainCell } from '../terrain/TerrainCell';
import { RoverWorldDirection, RoverRelativeDirection } from './RoverDirection';

import { ModelInstance } from '../managers/ModelManager';
import { AnimationInstance } from '../managers/AnimationManager';

import { delay, shortestAngleDelta } from '../utilities/Utilities';

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
    private readonly DIRECTION_MOVE_ANIMATIONS: Record<string, string> = {
        [RoverRelativeDirection.FRENTE]: 'girar-frente_animation',
        [RoverRelativeDirection.TRAS]: 'girar-tras_animation',
    };
    
    private turnAnimY: B.Animation;
    private turnAnimSpeed = .7;
    private readonly DIRECTION_TURN_ANIMATIONS: Record<string, string> = {
        [RoverRelativeDirection.DIREITA]: 'virar-esquerda_animation',
        [RoverRelativeDirection.ESQUERDA]: 'virar-direita_animation',
    };

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

        this.turnAnimY = new B.Animation("roverTurnY", "rotation.y", AnimationInstance.fps,
            B.Animation.ANIMATIONTYPE_FLOAT,
            B.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        this.turnAnimY.setEasingFunction(ease);

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
        
        const animName = this.DIRECTION_MOVE_ANIMATIONS[direction];            
        const duration = AnimationInstance.getDurationMs("rover", animName) / this.moveAnimSpeed;
          
        if (duration > 0){
  
            AnimationInstance.play("rover", animName, false, this.moveAnimSpeed);
            
            await this.animateToPosition(targetX, targetZ, duration);

        } else {
            
            await delay(1500);
            
            this.setGridPosition(targetX, targetZ);
        }    

    }


    public async turn(relativeDir: RoverRelativeDirection): Promise<void> {
        const arrayRoverDirection = Object.values(RoverWorldDirection);
        
        // await delay(1000);

        // DIREITA (1): (facing + 1) % 4
        // ESQUERDA (3): (facing + 3) % 4
        const newDirection = arrayRoverDirection[(this.facingDirection + relativeDir) % 4];
        const animName = this.DIRECTION_TURN_ANIMATIONS[relativeDir];
        
        const duration = AnimationInstance.getDurationMs("rover", animName) / this.turnAnimSpeed;
        
        this.facingDirection = arrayRoverDirection[(this.facingDirection + relativeDir) % 4];
        
        if (duration > 0) {
            // Toca a animação do modelo
            AnimationInstance.play("rover", animName, false, this.turnAnimSpeed);
            
            // Frame inicial para começar a rodar;
            // 12 é o frame no Blender; Provavelmente em 30 fps;
            // 2 por que aqui é 60 fps;
            // this.turnAnimSpeed para se adaptar a velocidade;
            const initialRotateFrame = 12 * 2 / this.turnAnimSpeed;
            const finalRotateFrame = 40 * 2 / this.turnAnimSpeed;
            // Interpola a rotação do pivot em sincronia
            await this.animateRotation(newDirection, duration, initialRotateFrame, finalRotateFrame);
        } else {
            await delay(1000);
        
            if (this.pivot) {
                this.pivot.rotation.y = newDirection * (Math.PI / 2);
            }
        }
        
        this.facingDirection = newDirection;
        

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


    private animateRotation(targetDirection: number, 
                            durationMs: number, 
                            rotationStartFrame: number = 0, 
                            rotationEndFrame: number = 0
                        ): Promise<void> {

        return new Promise((resolve) => {
            const targetY = targetDirection * (Math.PI / 2);
            const currentY = this.pivot.rotation.y;
            
            // Normaliza para pegar o caminho mais curto (-π a +π)
            const delta = shortestAngleDelta(currentY, targetY);
            
            const totalFrames = Math.round((durationMs / 1000) * AnimationInstance.fps);
            
            const clampedStart = Math.min(rotationStartFrame, totalFrames);
            const clampedEnd = Math.max(rotationEndFrame, clampedStart);

            this.turnAnimY.setKeys([
                { frame: 0,            value: currentY },           // mantém parado
                { frame: clampedStart, value: currentY },           // ainda parado até aqui
                { frame: clampedEnd,   value: currentY + delta },    // gira daqui até o fim
                { frame: totalFrames,  value: currentY + delta }    // gira daqui até o fim
            ]);
            
            this.scene.beginDirectAnimation(
                this.pivot,
                [this.turnAnimY],
                0, totalFrames,
                false, 1,
                () => {
                    this.pivot.rotation.y = targetY;
                    resolve();
                }
            );
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