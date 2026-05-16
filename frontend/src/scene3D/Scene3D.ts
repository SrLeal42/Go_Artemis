import * as B from '@babylonjs/core';

import { Camera } from './scripts/Camera';
import { Terrain } from './scripts/terrain/Terrain';
import { Rover } from './scripts/rover/Rover';
import { Goal } from './scripts/Goal';

import { MaterialInstance } from './scripts/managers/MaterialManager';
import { ModelInstance } from './scripts/managers/ModelManager';
import { SoundInstance } from './scripts/managers/SoundManager';

import { TerrainTypes, TileTraversal } from './scripts/terrain/TerrainTypes';
import { RoverRelativeDirection } from './scripts/rover/RoverDirection';

import { ALL_BLINKING_LIGHTS, SPAWN_LIGHT, GLOW_LAYER, SCENE_LIGHTING } from './scripts/utilities/LightingConstants';

export class Scene3D {

  public canvas : HTMLCanvasElement
  public engine : B.Engine;
  public scene : B.Scene;

  public camera : Camera;

  public terrain : Terrain;

  public goal : Goal;

  public rover : Rover;

  private resizeObserver: ResizeObserver | null = null;
  
  public readonly _readyPromise: Promise<void>;

  constructor(canvas : HTMLCanvasElement, onProgress?: (loaded: number, total: number) => void) {
    this.canvas = canvas;
    this.engine = new B.Engine(this.canvas, true);
    
    ModelInstance.onProgress = onProgress;
    this._readyPromise = this.initialize();

  }


  public async initialize() : Promise<void> {
    const scene = await this.createScene();
    this.scene = scene;

    const glowMats: Map<string, B.StandardMaterial> = new Map();
    for (const config of ALL_BLINKING_LIGHTS) {
        const master = ModelInstance.getMasterMesh(config.GLOW_KEY);
        const mat = MaterialInstance.getMaterial(config.GLOW_KEY) as B.StandardMaterial;
        master.material = mat;
        glowMats.set(config.GLOW_KEY, mat);
    }

    // Aumentando o limite de luzes simultaneas na cena;
    scene.materials.forEach(mat => {
        if (mat instanceof B.StandardMaterial || mat instanceof B.PBRMaterial) {
            mat.maxSimultaneousLights = SCENE_LIGHTING.MAX_SIMULTANEOUS_LIGHTS;
        }
    });

    scene.registerBeforeRender(() => {
    
      for (const config of ALL_BLINKING_LIGHTS) {
        const t = (Math.sin(performance.now() * config.BLINK_SPEED) + 1) / 2;
        
        const mat = glowMats.get(config.GLOW_KEY)!;
        const intensity = t * config.EMISSIVE_MAX + config.EMISSIVE_MIN;
        mat.emissiveColor = new B.Color3(
            intensity * config.COLOR.r,
            intensity * config.COLOR.g,
            intensity * config.COLOR.b,
        );
        
        // Busca a célula correspondente
        const pos = config === SPAWN_LIGHT
            ? this.terrain.spawnPosition
            : this.terrain.goalPosition;
    
        const cell = this.terrain.terrainGrid.get(`${pos.x},0,${pos.z}`);
    
        if (cell?.glowLights) {
            for (const light of cell.glowLights) {
                light.intensity = t * config.POINT_INTENSITY_MAX + config.POINT_INTENSITY_MIN;
            }
        }
    
      }
    
    
    });


    if (this.canvas.parentElement) {
      this.resizeObserver = new ResizeObserver(() => {
          this.engine.resize();
      });
      // Manda ele ligar o sensor de perímetro na div que embala o Canvas!
      this.resizeObserver.observe(this.canvas.parentElement);
    }

    this.engine.runRenderLoop(function () {
        scene.render();
    });

  }


  private async createScene() : Promise<B.Scene> {

    const scene = new B.Scene(this.engine);
    scene.clearColor = new B.Color4(0.06, 0.09, 0.16, 1);

    const light = new B.HemisphericLight("light", new B.Vector3(0, 1, 0), scene);
    light.intensity = SCENE_LIGHTING.HEMISPHERIC_INTENSITY;

    // GlowLayer para bloom automático em materiais emissivos
    const glowLayer = new B.GlowLayer("glowLayer", scene, {
        blurKernelSize: GLOW_LAYER.BLUR_KERNEL_SIZE,
    });
    glowLayer.intensity = GLOW_LAYER.INTENSITY;

    MaterialInstance.initialize(scene);
    await ModelInstance.initialize(scene);
    await SoundInstance.initialize();


    this.terrain = new Terrain(scene);
    this.terrain.initialize();

    const goalPos = this.terrain.goalPosition;
    this.goal = new Goal(scene, goalPos.x, goalPos.z);

    const spawn = this.terrain.spawnPosition;
    this.rover = new Rover(scene, spawn.x, spawn.z);

    this.camera = new Camera(scene, this.canvas, this.rover.pivot)

    return scene;

  }


  public checkGoalReached(): boolean {
    const [rx, rz] = this.rover.getGridPosition();
    return this.goal.isAtPosition(rx, rz);
  }


  public checkConditionOnMap(cond: string, dir: string): boolean {

    const relativeDir = RoverRelativeDirection[dir as keyof typeof RoverRelativeDirection];
    // Pega a coordenada da célula ao lado do Rover
    const [checkX, checkZ] = this.rover.getAdjacentGridPosition(relativeDir);
    // Consulta o terreno nessa posição
    const cellKey = `${checkX},0,${checkZ}`;
    const cell = this.terrain.terrainGrid.get(cellKey);
    
    if (!cell) return cond === "BORDA"; // Fora do mapa / Verificação da condição BORDA
    
    // Verifica a condição
    switch(cond){
      case "OBSTACULO":
        return cell.traversal === TileTraversal.BLOCKED;
      case "OBJETIVO":
        return cell.chosenTile === TerrainTypes.OBJETIVO;
      case "LIVRE":
        return cell.traversal === TileTraversal.PASSABLE;
      case "MARCADO":
        return cell.marked === true;

    }

    return false;
  }

  public reset(): void {
    this.resetRover();
    this.terrain.reset();
  }

  public resetRover(): void {
    const spawn = this.terrain.spawnPosition;
    this.rover.reset(spawn.x, spawn.z);
  }


  public regenerateTerrain(): void {
    this.terrain.generate();
    
    this.goal.dispose();
    const goalPos = this.terrain.goalPosition;
    this.goal = new Goal(this.scene, goalPos.x, goalPos.z);
    
    this.resetRover();

  }

  public markCurrentCell(): void {
      const [rx, rz] = this.rover.getGridPosition();
      const cellKey = `${rx},0,${rz}`;
      const cell = this.terrain.terrainGrid.get(cellKey);
      if (cell) {
          cell.mark();
      }
  }


  public dispose() {
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    SoundInstance.dispose();
    
    if (this.scene){
      this.scene.dispose();
    }

    if (this.engine){
      this.engine.dispose();
    }

  }


}


