export const RoverWorldDirection = {
    NORTH: 0, // Olha para +Z
    EAST: 1,  // Olha para +X
    SOUTH: 2, // Olha para -Z
    WEST: 3   // Olha para -X
} as const

export type RoverWorldDirection = typeof RoverWorldDirection[keyof typeof RoverWorldDirection];

export const RoverRelativeDirection = {
    FRENTE: 0,
    DIREITA: 1,
    TRAS: 2,
    ESQUERDA: 3
} as const

export type RoverRelativeDirection = typeof RoverRelativeDirection[keyof typeof RoverRelativeDirection];