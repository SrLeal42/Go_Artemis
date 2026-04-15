export const TerrainTypes = {
    TRANSPONIVEL: 0,
    OBSTACULO: 1,
    OBJETIVO: 2
} as const;

export type TerrainTypes = typeof TerrainTypes[keyof typeof TerrainTypes];
