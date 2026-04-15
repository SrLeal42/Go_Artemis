export const RoverDirection = {
    NORTH: 0, // Olha para +Z
    EAST: 1,  // Olha para +X
    SOUTH: 2, // Olha para -Z
    WEST: 3   // Olha para -X
} as const

export type RoverDirection = typeof RoverDirection[keyof typeof RoverDirection];