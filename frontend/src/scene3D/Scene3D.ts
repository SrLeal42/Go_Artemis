import * as B from '@babylonjs/core';

import { Camera } from './scripts/Camera';
import { Terrain } from './scripts/terrain/Terrain';
import { Rover } from './scripts/rover/Rover';
import { Goal } from './scripts/Goal';

import { MaterialInstance } from './scripts/managers/MaterialManager';
import { ModelInstance } from './scripts/managers/ModelManager';

import { TerrainTypes, TileTraversal } from './scripts/terrain/TerrainTypes';
import { RoverRelativeDirection, RoverWorldDirection } from './scripts/rover/RoverDirection';

export class Scene3D {

  public canvas : HTMLCanvasElement
  public engine : B.Engine;
  public scene : B.Scene;

  public camera : Camera;

  public terrain : Terrain;

  public goal : Goal;

  public rover : Rover;

  private resizeObserver: ResizeObserver | null = null;

  constructor(canvas : HTMLCanvasElement) {
    this.canvas = canvas;
    this.engine = new B.Engine(this.canvas, true);

    const scene = this.createScene();
    this.scene = scene;

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


  private createScene() : B.Scene {

    const scene = new B.Scene(this.engine);
    scene.clearColor = new B.Color4(0.06, 0.09, 0.16, 1);

    const light = new B.HemisphericLight("light", new B.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    MaterialInstance.initialize(scene);
    ModelInstance.initialize(scene);


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

    }

    return false;
  }


  public resetRover(): void {
    const spawn = this.terrain.spawnPosition;
    this.rover.setGridPosition(spawn.x, spawn.z);
    this.rover.facingDirection = RoverWorldDirection.NORTH;
    
    if (this.rover.pivot) {
        this.rover.pivot.rotation.y = 0;
    }

  }


  public regenerateTerrain(): void {
    this.terrain.generate();
    
    this.goal.dispose();
    const goalPos = this.terrain.goalPosition;
    this.goal = new Goal(this.scene, goalPos.x, goalPos.z);
    
    this.resetRover();

  }


  public dispose() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    this.scene.dispose();
    this.engine.dispose();
  }


}


