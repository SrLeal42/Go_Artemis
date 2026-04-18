import * as B from '@babylonjs/core';

import { Camera } from './scripts/Camera';
import { Terrain } from './scripts/terrain/Terrain';
import { Rover } from './scripts/rover/Rover';

import { MaterialInstance } from './scripts/managers/MaterialManager';
import { ModelInstance } from './scripts/managers/ModelManager';

import { TerrainTypes } from './scripts/terrain/TerrainTypes';
import { RoverRelativeDirection } from './scripts/rover/RoverDirection';

export class Scene3D {

  public canvas : HTMLCanvasElement
  public engine : B.Engine;
  public scene : B.Scene;

  public camera : Camera;

  public terrain : Terrain;

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

    // 2. Cria a Cena e pinta o fundo com a mesma cor do nosso painel escuro
    const scene = new B.Scene(this.engine);
    scene.clearColor = new B.Color4(0.06, 0.09, 0.16, 1);

    // 4. Luz Diurna
    const light = new B.HemisphericLight("light", new B.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    MaterialInstance.initialize(scene);
    ModelInstance.initialize(scene);


    this.terrain = new Terrain(scene);
    this.terrain.initialize();

    this.rover = new Rover(scene, 0, 0);

    this.camera = new Camera(scene, this.canvas, this.rover.pivot)

    return scene;

  }


  public checkConditionOnMap(cond: string, dir: string): boolean {
    console.log(cond, dir)
    const relativeDir = RoverRelativeDirection[dir as keyof typeof RoverRelativeDirection];
    // Pega a coordenada da célula ao lado do Rover
    const [checkX, checkZ] = this.rover.getAdjacentGridPosition(relativeDir);
    // Consulta o terreno nessa posição
    const cellKey = `${checkX},0,${checkZ}`;
    const cell = this.terrain.terrainGrid.get(cellKey);
    
    if (!cell) return false; // Fora do mapa
    
    // Verifica a condição
    switch(cond){
      case "OBSTACULO":
        return cell.chosenTile === TerrainTypes.OBSTACULO;
      case "OBJETIVO":
        return cell.chosenTile === TerrainTypes.OBJETIVO;
    }

    return false;
  }

  public dispose() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    this.scene.dispose();
    this.engine.dispose();
  }


}


