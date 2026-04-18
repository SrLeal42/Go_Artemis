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
