import * as B from '@babylonjs/core';


export class Scene3D {

  public canvas : HTMLCanvasElement
  public engine : B.Engine;
  public scene : B.Scene;

  private resizeObserver: ResizeObserver | null = null;

  constructor(canvas : HTMLCanvasElement) {
    this.canvas = canvas;
    const engine = new B.Engine(this.canvas, true);
    this.engine = engine;

    const scene = this.CreateScene();
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


  private CreateScene() : B.Scene {

    // 2. Cria a Cena e pinta o fundo com a mesma cor do nosso painel escuro
    const scene = new B.Scene(this.engine);
    scene.clearColor = new B.Color4(0.06, 0.09, 0.16, 1);

    // 3. Câmera Orbital (Deixa o usuário girar o cenário com o mouse)
    const camera = new B.ArcRotateCamera(
      "camera", 
      -Math.PI / 2, // Ângulo Inicial (Alpha)
      Math.PI / 3,  // Inclinação (Beta)
      12,           // Distância do Zoom
      B.Vector3.Zero(), 
      scene
    );
    camera.attachControl(this.canvas, true);
    camera.lowerRadiusLimit = 5; // Limita o Zoom máximo
    camera.upperRadiusLimit = 30; // Limita quão longe ele pode ir
    camera.upperBetaLimit = (Math.PI / 2) * 0.9; // Impede entrar "debaixo do chão"

    // 4. Luz Diurna
    const light = new B.HemisphericLight("light", new B.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    // 5. O Chão (Grid Virtual 10x10) usando subdivisions para cortar o plano
    const ground = B.MeshBuilder.CreateGround("ground", { width: 30, height: 30, subdivisions: 6 }, scene);
    const groundMat = new B.StandardMaterial("groundMat", scene);
    groundMat.wireframe = true; // Transformamos em um "Aramado" para parecer o Grid tático!
    groundMat.diffuseColor = new B.Color3(0.2, 0.4, 0.8); // Um azul digital 
    ground.material = groundMat;

    // 6. O Rover Primitivo (Nosso Cubo Laranja)
    const rover = B.MeshBuilder.CreateBox("rover", { size: 1 }, scene);
    rover.position.y = 0.5; // Sobe o cubo 0.5 para que ele "pise" no chão e não afunde metade 
    
    const roverMat = new B.StandardMaterial("roverMat", scene);
    roverMat.diffuseColor = new B.Color3(0.9, 0.4, 0.1); 
    rover.material = roverMat;


    return scene;

  } 


  public dispose() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    this.scene.dispose();
    this.engine.dispose();
  }


}


