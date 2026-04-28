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

    CRATERA_NORTE: 14,
    CRATERA_OESTE: 15,
    CRATERA_LESTE: 16,
    CRATERA_SUL: 17,
    CRATERA_NOROESTE: 18,
    CRATERA_NORDESTE: 19,
    CRATERA_SUDESTE: 20,
    CRATERA_SUDOESTE: 21,
    CRATERA_CENTRO: 22,
} as const;

export type TerrainTypes = typeof TerrainTypes[keyof typeof TerrainTypes];

export const TILE_ID_TO_TYPE: Record<string, number> = {
    "TRANSPONIVEL": TerrainTypes.TRANSPONIVEL,
    "ROCHA":        TerrainTypes.ROCHA,
    "CRATERA":      TerrainTypes.CRATERA,
    "OBJETIVO":     TerrainTypes.OBJETIVO,
    "SURGIMENTO":   TerrainTypes.SURGIMENTO,

    "MONTANHA_NORTE":     TerrainTypes.MONTANHA_NORTE,
    "MONTANHA_OESTE":     TerrainTypes.MONTANHA_OESTE,
    "MONTANHA_LESTE":     TerrainTypes.MONTANHA_LESTE,
    "MONTANHA_SUL":       TerrainTypes.MONTANHA_SUL,
    "MONTANHA_NOROESTE":  TerrainTypes.MONTANHA_NOROESTE,
    "MONTANHA_NORDESTE":  TerrainTypes.MONTANHA_NORDESTE,
    "MONTANHA_SUDESTE":   TerrainTypes.MONTANHA_SUDESTE,
    "MONTANHA_SUDOESTE":  TerrainTypes.MONTANHA_SUDOESTE,
    "MONTANHA_CENTRO":    TerrainTypes.MONTANHA_CENTRO,

    "CRATERA_NORTE":      TerrainTypes.CRATERA_NORTE,
    "CRATERA_OESTE":      TerrainTypes.CRATERA_OESTE,
    "CRATERA_LESTE":      TerrainTypes.CRATERA_LESTE,
    "CRATERA_SUL":        TerrainTypes.CRATERA_SUL,
    "CRATERA_NOROESTE":   TerrainTypes.CRATERA_NOROESTE,
    "CRATERA_NORDESTE":   TerrainTypes.CRATERA_NORDESTE,
    "CRATERA_SUDESTE":    TerrainTypes.CRATERA_SUDESTE,
    "CRATERA_SUDOESTE":   TerrainTypes.CRATERA_SUDOESTE,
    "CRATERA_CENTRO":     TerrainTypes.CRATERA_CENTRO,
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
