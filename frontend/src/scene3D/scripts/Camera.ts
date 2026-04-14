import * as B from '@babylonjs/core';

export class Camera {

    public scene: B.Scene;
    public canvas: HTMLCanvasElement;

    public roverMesh : B.Mesh;

    public arcCamera: B.ArcRotateCamera;
    public arcCameraRadius = 10;

    public topDownCamera: B.UniversalCamera;
    public topDownCameraHeight = 60;

    private isTopViewActive: boolean = false;

    constructor(scene: B.Scene, canvas: HTMLCanvasElement, roverMesh: B.Mesh) {
        this.scene = scene;
        this.canvas = canvas;

        this.roverMesh = roverMesh;

        this.arcCamera = new B.ArcRotateCamera("roverCamera", -Math.PI / 2, Math.PI / 3, this.arcCameraRadius, B.Vector3.Zero(), scene);
        this.arcCamera.setTarget(roverMesh); // Fixa os olhos no carrinho!
        
        this.arcCamera.lowerRadiusLimit = 4;
        this.arcCamera.upperBetaLimit = (Math.PI / 2) * 0.9; 

        // Liga os crontoles do mouse na câmera atual
        this.arcCamera.attachControl(this.canvas, true);
        
        this.topDownCamera = new B.UniversalCamera("skyCamera", new B.Vector3(0, this.topDownCameraHeight, 0), scene);
        this.topDownCamera.setTarget(B.Vector3.Zero()); // Olha direto pro centro do chão
        
        this.scene.activeCamera = this.topDownCamera; // this.arcCamera  
        
    }

    public toggleCamera() {
        this.scene.activeCamera?.detachControl();

        if (this.isTopViewActive) {
            this.scene.activeCamera = this.arcCamera;
            this.isTopViewActive = false;
            this.scene.activeCamera.attachControl(this.canvas, true);
        } else {
            this.scene.activeCamera = this.topDownCamera;
            this.isTopViewActive = true;
        }
    
    }
}
