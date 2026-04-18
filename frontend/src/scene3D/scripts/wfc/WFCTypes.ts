// === Tipos extraídos do JSON de regras ===

export interface TilePlacement {
    count: number;
    minDistFromEdge: number;
    minDistBetweenSpecials: number;
}

export interface TileRule {
    id: string;
    weight: number;
    placement?: TilePlacement;
    adjacency: Record<Direction, string[]>;
}

export interface WFCRulesData {
    tiles: TileRule[];
}

// === Estado interno do solver ===

export interface WFCCell {
    x: number;
    z: number;
    possibleTiles: Set<string>;
    collapsed: boolean;
    chosenTile: string | null;
}

// === Direções ===

export type Direction = "north" | "south" | "east" | "west";

export const OPPOSITE_DIR: Record<Direction, Direction> = {
    north: "south",
    south: "north",
    east: "west",
    west: "east",
};

// Offset no grid para cada direção (deltaX, deltaZ)
export const DIR_OFFSETS: Record<Direction, [number, number]> = {
    north: [0, -1],
    south: [0,  1],
    east:  [1,  0],
    west:  [-1, 0],
};

export const ALL_DIRECTIONS: Direction[] = ["north", "south", "east", "west"];
