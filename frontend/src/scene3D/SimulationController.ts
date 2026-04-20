import { Scene3D } from './Scene3D';
import { ASTEngine } from '../engineAST/scripts/ASTEngine';

import { RoverRelativeDirection, RoverWorldDirection } from './scripts/rover/RoverDirection';
import { TerrainTypes } from './scripts/terrain/TerrainTypes';
import { SimulationStatus } from './models/SimulationStatusTypes';

import type { CommandNode } from '../engineAST/models/CMDTypes';
import type { FlatAction } from '../engineAST/models/FlatActionType';

export class SimulationController {

    private scene3D: Scene3D;
    private status: SimulationStatus = SimulationStatus.IDLE;
    private isCancelled = false;

    constructor(scene3D: Scene3D) {
        this.scene3D = scene3D;
    }

    public getStatus(): SimulationStatus {
        return this.status;
    }

    /**
     * Cancela qualquer simulação em andamento e reposiciona o rover no spawn.
     */
    public reset(): void {
        this.isCancelled = true;
        this.status = SimulationStatus.IDLE;

        const spawn = this.scene3D.terrain.spawnPosition;
        this.scene3D.rover.setGridPosition(spawn.x, spawn.z);
        // Resetar a direção também
        this.scene3D.rover.facingDirection = RoverWorldDirection.NORTH;
        if (this.scene3D.rover.pivot) {
            this.scene3D.rover.pivot.rotation.y = 0;
        }
    }

    /**
     * Executa a simulação completa a partir de uma lista de comandos AST.
     */
    public async run(commands: CommandNode[]): Promise<void> {
        // Sempre reseta antes de começar
        this.reset();

        // Libera a flag depois do reset
        this.isCancelled = false;
        this.status = SimulationStatus.RUNNING;

        const engineIterator = ASTEngine.executeAST(commands, (cond, dir) => {
            return this.scene3D.checkConditionOnMap(cond, dir);
        });

        try {
            while (!this.isCancelled) {
                const step = engineIterator.next();

                if (step.done) {
                    console.log("🏁 Trajetória completa!");
                    this.status = SimulationStatus.END;
                    return;
                }

                await this.executeStep(step.value as FlatAction);

                if (this.scene3D.checkGoalReached()) {
                    console.log("🎯 Objetivo alcançado!");
                    this.status = SimulationStatus.SUCCESS;
                    return;
                }
            }
        } catch (error) {
            this.status = SimulationStatus.ERROR;
            console.error("💥 Simulação parou:", (error as Error).message);
            // Aqui no futuro você pode emitir um callback/evento pro React mostrar o erro na UI
        }
    }

    /**
     * Executa uma única ação, validando posição antes de mover.
     */
    private async executeStep(acao: FlatAction): Promise<void> {
        switch (acao.action) {
            case "AVANCA":
                await this.moveWithValidation(RoverRelativeDirection.FRENTE, acao.value);
                break;
            case "RECUA":
                await this.moveWithValidation(RoverRelativeDirection.TRAS, acao.value);
                break;
            case "GIRA": {
                const giraDir = RoverRelativeDirection[acao.direction as keyof typeof RoverRelativeDirection];
                await this.scene3D.rover.turn(giraDir);
                break;
            }
        }
    }

    /**
     * Move N células na direção relativa, validando CADA passo individual.
     */
    private async moveWithValidation(direction: RoverRelativeDirection, steps: number): Promise<void> {
        for (let i = 0; i < steps; i++) {
            if (this.isCancelled) return;

            const [targetX, targetZ] = this.scene3D.rover.getAdjacentGridPosition(direction);

            this.validatePosition(targetX, targetZ);

            // Seguro — move 1 célula
            await this.scene3D.rover.move(targetX, targetZ, direction);

        }
    }

    /**
     * Valida se uma posição é legal. Lança erro se não for.
     */
    private validatePosition(x: number, z: number): void {
        const gridSize = this.scene3D.terrain.gridSize;

        // 1. Bounds check
        if (x < -gridSize || x > gridSize || z < -gridSize || z > gridSize) {
            throw new Error(`Rover saiu do mapa! Posição (${x}, ${z}) está fora dos limites.`);
        }

        // 2. Obstacle check
        const cellKey = `${x},0,${z}`;
        const cell = this.scene3D.terrain.terrainGrid.get(cellKey);

        if (!cell) {
            throw new Error(`Célula (${x}, ${z}) não existe no terreno.`);
        }

        if (cell.chosenTile === TerrainTypes.OBSTACULO) {
            throw new Error(`Rover colidiu com obstáculo na posição (${x}, ${z})!`);
        }
    }

    /**
     * Para uma simulação em andamento (usado no cleanup do React).
     */
    public cancel(): void {
        this.isCancelled = true;
    }
}
