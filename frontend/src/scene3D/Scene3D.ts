import * as B from '@babylonjs/core';

import { Camera } from './scripts/Camera';
import { Terrain } from './scripts/terrain/Terrain';

export class Scene3D {

  public canvas : HTMLCanvasElement
  public engine : B.Engine;
  public scene : B.Scene;

  public camera : Camera;

  public terrain : Terrain;

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


    this.terrain = new Terrain(this.scene);
    this.terrain.initialize();

    // 6. O Rover Primitivo (Nosso Cubo Laranja)
    const rover = B.MeshBuilder.CreateBox("rover", { size: 1 }, scene);
    rover.position.y = 0.5; // Sobe o cubo 0.5 para que ele "pise" no chão e não afunde metade 
    
    const roverMat = new B.StandardMaterial("roverMat", scene);
    roverMat.diffuseColor = new B.Color3(0.9, 0.4, 0.1); 
    rover.material = roverMat;

    this.camera = new Camera(scene, this.canvas, rover)

    return scene;

  }


  public checkConditionOnMap(cond: string, dir: string): boolean {
    console.log(cond, dir)
    return false;
  }


  public moveForward(value : number): Promise<void> {
    return new Promise((resolve) => {
        console.log(`[INÍCIO] INICIANDO MOVIMENTO FRENTE: ${value} unidades`);
        

        setTimeout(() => {
            console.log(`[FIM] TERMINOU DE MOVER FRENTE`);
            resolve(); // Aqui é onde o Scene3D avisa: "Terminei! Pode mandar a próxima"
        }, value * 1000);
    });
  }

  public moveBackward(value : number): Promise<void> {
    return new Promise((resolve) => {
        console.log(`[INÍCIO] INICIANDO MOVIMENTO TRÁS: ${value} unidades`);
        
        setTimeout(() => {
            console.log(`[FIM] TERMINOU DE MOVER TRÁS`);
            resolve(); 
        }, value * 2000); // Demora 1 segundo vezes a quantidade dos blocos
    });
  }



  public dispose() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    this.scene.dispose();
    this.engine.dispose();
  }


}


