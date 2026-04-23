export const TerrainTypes = {
    TRANSPONIVEL: 0,
    OBSTACULO: 1,
    OBJETIVO: 2,
    SURGIMENTO: 3
} as const;

export type TerrainTypes = typeof TerrainTypes[keyof typeof TerrainTypes];

export const TILE_ID_TO_TYPE: Record<string, number> = {
    "TRANSPONIVEL": TerrainTypes.TRANSPONIVEL,
    "OBSTACULO":    TerrainTypes.OBSTACULO,
    "OBJETIVO":     TerrainTypes.OBJETIVO,
    "SURGIMENTO":   TerrainTypes.SURGIMENTO,
};



export const TileTraversal = {
    PASSABLE: 0,
    BLOCKED: 1
} as const
export type TileTraversal = typeof TileTraversal[keyof typeof TileTraversal];


export const TILE_TRAVERSAL_TO_TYPE: Record<string, number> = {
    "passable": TileTraversal.PASSABLE,
    "blocked":    TileTraversal.BLOCKED,
};
