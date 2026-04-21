import * as B from '@babylonjs/core';
import { TerrainCell } from './terrain/TerrainCell';
import { ModelInstance } from './managers/ModelManager';

export class Goal {

    public scene: B.Scene;
    
    public gridX: number;
    public gridZ: number;

    public mesh: B.InstancedMesh;

    constructor(scene: B.Scene, gridX: number, gridZ: number) {
        this.scene = scene;

        this.gridX = gridX;
        this.gridZ = gridZ;

        this.mesh = ModelInstance.createInstance("objetivo_cubo", "Goal");
        
        this.mesh.position.x = gridX * TerrainCell.cellSize;
        this.mesh.position.z = gridZ * TerrainCell.cellSize;
        this.mesh.position.y = 1;
    }

    public isAtPosition(x: number, z: number): boolean {
        return this.gridX === x && this.gridZ === z;
    }

    public dispose(): void {
        if (this.mesh) {
            this.mesh.dispose();
        }
    }
    
}
