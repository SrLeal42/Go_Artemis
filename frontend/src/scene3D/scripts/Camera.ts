import * as B from '@babylonjs/core';

export class Camera {

    public scene: B.Scene;
    public canvas: HTMLCanvasElement;

    public roverPivot : B.TransformNode;

    public arcCamera: B.ArcRotateCamera;
    public arcCameraRadius = 10;

    public topDownCamera: B.UniversalCamera;
    public topDownCameraHeight = 60;

    private isTopViewActive: boolean = true;

    constructor(scene: B.Scene, canvas: HTMLCanvasElement, roverPivot: B.TransformNode) {
        this.scene = scene;
        this.canvas = canvas;

        this.roverPivot = roverPivot;

        this.arcCamera = new B.ArcRotateCamera("roverCamera", -Math.PI / 2, Math.PI / 3, this.arcCameraRadius, B.Vector3.Zero(), scene);
        this.arcCamera.setTarget(roverPivot);
        
        this.arcCamera.lowerRadiusLimit = 4;
        this.arcCamera.upperBetaLimit = (Math.PI / 2) * 0.9; 

        // Liga os crontoles do mouse na câmera atual
        this.arcCamera.attachControl(this.canvas, true);
        
        this.topDownCamera = new B.UniversalCamera("skyCamera", new B.Vector3(0, this.topDownCameraHeight, 0), scene);
        this.topDownCamera.setTarget(B.Vector3.Zero());
        
        this.scene.activeCamera =  this.topDownCamera;
        
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
