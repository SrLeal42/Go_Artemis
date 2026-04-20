export const SimulationStatus = {
    IDLE: 0,
    RUNNING: 1,
    ERROR: 2,
    END: 3,
    SUCCESS: 4
} as const;

export type SimulationStatus = typeof SimulationStatus[keyof typeof SimulationStatus];