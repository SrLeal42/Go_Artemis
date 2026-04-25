export const TerrainTypes = {
    TRANSPONIVEL: 0,
    ROCHA: 1,
    OBJETIVO: 2,
    SURGIMENTO: 3,
    CRATERA: 4,

    MONTANHA_NORTE: 5,
    MONTANHA_OESTE: 6,
    MONTANHA_LESTE: 7,
    MONTANHA_SUL: 8,
    MONTANHA_NOROESTE: 9,
    MONTANHA_NORDESTE: 10,
    MONTANHA_SUDESTE: 11,
    MONTANHA_SUDOESTE: 12,
    MONTANHA_CENTRO: 13,
} as const;

export type TerrainTypes = typeof TerrainTypes[keyof typeof TerrainTypes];

export const TILE_ID_TO_TYPE: Record<string, number> = {
    "TRANSPONIVEL": TerrainTypes.TRANSPONIVEL,
    "ROCHA":        TerrainTypes.ROCHA,
    "CRATERA":      TerrainTypes.CRATERA,
    "OBJETIVO":     TerrainTypes.OBJETIVO,
    "SURGIMENTO":   TerrainTypes.SURGIMENTO,

    "MONTANHA_NORTE":   TerrainTypes.MONTANHA_NORTE,
    "MONTANHA_OESTE":   TerrainTypes.MONTANHA_OESTE,
    "MONTANHA_LESTE":   TerrainTypes.MONTANHA_LESTE,
    "MONTANHA_SUL":   TerrainTypes.MONTANHA_SUL,
    "MONTANHA_NOROESTE":   TerrainTypes.MONTANHA_NOROESTE,
    "MONTANHA_NORDESTE":   TerrainTypes.MONTANHA_NORDESTE,
    "MONTANHA_SUDESTE":   TerrainTypes.MONTANHA_SUDESTE,
    "MONTANHA_SUDOESTE":   TerrainTypes.MONTANHA_SUDOESTE,
    "MONTANHA_CENTRO":   TerrainTypes.MONTANHA_CENTRO,
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
