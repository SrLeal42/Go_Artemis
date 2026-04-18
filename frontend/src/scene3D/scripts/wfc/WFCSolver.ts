// wfc/WFCSolver.ts
import type { WFCRulesData, /*TileRule,*/ TilePlacement, WFCCell, Direction } from './WFCTypes';
import { ALL_DIRECTIONS, DIR_OFFSETS } from './WFCTypes';

export class WFCSolver {

    private rules: WFCRulesData;
    private gridSize: number;
    private grid: Map<string, WFCCell> = new Map();

    // Lookup pré-computado: para cada tile, para cada direção, quais tiles são permitidos
    private adjacencyMap: Map<string, Record<Direction, Set<string>>> = new Map();

    constructor(rules: WFCRulesData, gridSize: number) {
        this.rules = rules;
        this.gridSize = gridSize;
        this.buildAdjacencyMap();
    }


    // =============================================
    //  SETUP
    // =============================================

    // Pré-computa as adjacências em Sets para lookup O(1)
    private buildAdjacencyMap(): void {
        for (const tile of this.rules.tiles) {
            const dirMap = {} as Record<Direction, Set<string>>;
            for (const dir of ALL_DIRECTIONS) {
                dirMap[dir] = new Set(tile.adjacency[dir]);
            }
            this.adjacencyMap.set(tile.id, dirMap);
        }
    }

    // Cria o grid com todas as células não-colapsadas
    // Apenas tiles com weight > 0 entram como possibilidade inicial
    private initializeGrid(): void {
        this.grid.clear();

        const normalTileIds = this.rules.tiles
            .filter(t => t.weight > 0)
            .map(t => t.id);

        for (let x = -this.gridSize; x <= this.gridSize; x++) {
            for (let z = -this.gridSize; z <= this.gridSize; z++) {
                this.grid.set(`${x},${z}`, {
                    x,
                    z,
                    possibleTiles: new Set(normalTileIds),
                    collapsed: false,
                    chosenTile: null,
                });
            }
        }
    }


    // =============================================
    //  PRE-SEED (tiles especiais)
    // =============================================

    private preSeedSpecialTiles(): boolean {
        const specialTiles = this.rules.tiles.filter(t => t.placement);
        const placedPositions: Array<{ x: number; z: number }> = [];

        for (const tile of specialTiles) {
            const placement = tile.placement!;

            for (let i = 0; i < placement.count; i++) {
                const candidates = this.getValidPlacementPositions(placement, placedPositions);

                if (candidates.length === 0) {
                    console.error(`WFC: Sem posição válida para pré-colocar "${tile.id}"`);
                    return false;
                }

                // Sorteia uma posição entre as válidas
                const pos = candidates[Math.floor(Math.random() * candidates.length)];
                const key = `${pos.x},${pos.z}`;
                const cell = this.grid.get(key)!;

                // Força o colapso
                cell.possibleTiles = new Set([tile.id]);
                cell.collapsed = true;
                cell.chosenTile = tile.id;

                placedPositions.push(pos);

                // Propaga restrições a partir desta célula
                const valid = this.propagate(cell);
                if (!valid) return false;
            }
        }

        return true;
    }

    private getValidPlacementPositions(
        placement: TilePlacement,
        alreadyPlaced: Array<{ x: number; z: number }>
    ): Array<{ x: number; z: number }> {

        const valid: Array<{ x: number; z: number }> = [];
        const minEdge = placement.minDistFromEdge;
        const minDist = placement.minDistBetweenSpecials;

        // Limites internos considerando distância da borda
        const innerMin = -this.gridSize + minEdge;
        const innerMax =  this.gridSize - minEdge;

        for (let x = innerMin; x <= innerMax; x++) {
            for (let z = innerMin; z <= innerMax; z++) {

                // Distância Manhattan de todos os especiais já colocados
                const tooClose = alreadyPlaced.some(p =>
                    Math.abs(p.x - x) + Math.abs(p.z - z) < minDist
                );

                if (!tooClose) {
                    valid.push({ x, z });
                }
            }
        }

        return valid;
    }


    // =============================================
    //  OBSERVE — encontrar a célula com menor entropia
    // =============================================

    private observe(): WFCCell | null {
        let minEntropy = Infinity;
        let candidates: WFCCell[] = [];

        for (const cell of this.grid.values()) {
            if (cell.collapsed) continue;

            const entropy = cell.possibleTiles.size;

            if (entropy < minEntropy) {
                minEntropy = entropy;
                candidates = [cell];
            } else if (entropy === minEntropy) {
                candidates.push(cell);
            }
        }

        if (candidates.length === 0) return null; // Todas colapsadas

        // Desempate aleatório entre candidatos com mesma entropia
        return candidates[Math.floor(Math.random() * candidates.length)];
    }


    // =============================================
    //  COLLAPSE — escolher um tile (ponderado por weight)
    // =============================================

    private collapse(cell: WFCCell): void {
        const options = Array.from(cell.possibleTiles);

        // Monta array de pesos correspondentes
        const weights = options.map(id => {
            const rule = this.rules.tiles.find(t => t.id === id);
            return rule ? rule.weight : 0;
        });

        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let roll = Math.random() * totalWeight;

        // Roleta ponderada
        let chosenIndex = 0;
        for (let i = 0; i < weights.length; i++) {
            roll -= weights[i];
            if (roll <= 0) {
                chosenIndex = i;
                break;
            }
        }

        cell.chosenTile = options[chosenIndex];
        cell.possibleTiles = new Set([cell.chosenTile]);
        cell.collapsed = true;
    }


    // =============================================
    //  PROPAGATE — cascata de restrições via BFS
    // =============================================

    private propagate(startCell: WFCCell): boolean {
        const queue: WFCCell[] = [startCell];

        while (queue.length > 0) {
            const current = queue.shift()!;

            for (const dir of ALL_DIRECTIONS) {
                const [dx, dz] = DIR_OFFSETS[dir];
                const neighborKey = `${current.x + dx},${current.z + dz}`;

                const neighbor = this.grid.get(neighborKey);
                if (!neighbor || neighbor.collapsed) continue;

                // União de todos os tiles permitidos na direção 'dir'
                // considerando TODAS as possibilidades restantes na célula atual
                const allowed = new Set<string>();
                for (const tileId of current.possibleTiles) {
                    const adj = this.adjacencyMap.get(tileId);
                    if (adj) {
                        for (const a of adj[dir]) {
                            allowed.add(a);
                        }
                    }
                }

                // Intersecção: remove do vizinho tudo que NÃO está em 'allowed'
                const sizeBefore = neighbor.possibleTiles.size;

                for (const tile of neighbor.possibleTiles) {
                    if (!allowed.has(tile)) {
                        neighbor.possibleTiles.delete(tile);
                    }
                }

                // Contradição: vizinho ficou sem opções
                if (neighbor.possibleTiles.size === 0) {
                    return false;
                }

                // Se mudou, enfileira para propagar a cascata
                if (neighbor.possibleTiles.size < sizeBefore) {
                    queue.push(neighbor);
                }
            }
        }

        return true;
    }


    // =============================================
    //  SOLVE — orquestra tudo
    // =============================================

    public solve(maxRetries = 10): Map<string, string> | null {

        for (let attempt = 0; attempt < maxRetries; attempt++) {

            this.initializeGrid();

            // Fase 1: Pré-colocar tiles especiais e propagar
            if (!this.preSeedSpecialTiles()) {
                console.warn(`WFC: Pre-seed falhou na tentativa ${attempt + 1}`);
                continue;
            }

            // Fase 2: Loop WFC clássico
            let success = true;

            while (true) {
                const cell = this.observe();
                if (!cell) break; // Todas colapsadas — sucesso!

                this.collapse(cell);

                if (!this.propagate(cell)) {
                    success = false;
                    break; // Contradição
                }
            }

            if (success) {
                // Monta o resultado final: "x,z" → tileId
                const result = new Map<string, string>();
                for (const [key, cell] of this.grid) {
                    result.set(key, cell.chosenTile!);
                }
                return result;
            }

            console.warn(`WFC: Tentativa ${attempt + 1} gerou contradição, reiniciando...`);
        }

        console.error(`WFC: Falhou após ${maxRetries} tentativas`);
        return null;
    }
}
