import { Color3 } from '@babylonjs/core';

// Tipo compartilhado para qualquer luz piscante
export interface BlinkingLightConfig {
    readonly MODEL_KEY: string;
    readonly GLOW_KEY: string;
    readonly MATERIAL_KEY: string;
    readonly COLOR: Color3;
    readonly BLINK_PERIOD: number;
    readonly BLINK_SPEED: number;
    readonly EMISSIVE_MIN: number;
    readonly EMISSIVE_MAX: number;
    readonly POINT_INTENSITY_MIN: number;
    readonly POINT_INTENSITY_MAX: number;
    readonly POINT_RANGE: number;
    readonly POINT_INITIAL_INTENSITY: number;
}

function createLightConfig(
    modelKey: string,
    glowKey: string,
    color: Color3,
    blinkPeriod: number,
    overrides?: Partial<Omit<BlinkingLightConfig, 'MODEL_KEY' | 'GLOW_KEY' | 'COLOR' | 'BLINK_PERIOD' | 'BLINK_SPEED' | 'MATERIAL_KEY'>>
): BlinkingLightConfig {
    return {
        MODEL_KEY: modelKey,
        GLOW_KEY: glowKey,
        MATERIAL_KEY: glowKey,
        COLOR: color,
        BLINK_PERIOD: blinkPeriod,
        BLINK_SPEED: (2 * Math.PI) / (blinkPeriod * 1000),
        EMISSIVE_MIN:    overrides?.EMISSIVE_MIN ?? 0.2,
        EMISSIVE_MAX:    overrides?.EMISSIVE_MAX ?? 0.8,
        POINT_INTENSITY_MIN:    overrides?.POINT_INTENSITY_MIN ?? 0.1,
        POINT_INTENSITY_MAX:    overrides?.POINT_INTENSITY_MAX ?? 1.5,
        POINT_RANGE:            overrides?.POINT_RANGE ?? 10,
        POINT_INITIAL_INTENSITY: overrides?.POINT_INITIAL_INTENSITY ?? 0.5,
    };
}

export const SPAWN_LIGHT = createLightConfig(
    'terrain_surgimento', 'terrain_surgimento_glow',
    new Color3(1, 0.15, 0.1),   // vermelho
    2.5
);

export const GOAL_LIGHT = createLightConfig(
    'terrain_objetivo', 'terrain_objetivo_glow',
    new Color3(0.15, 1, 0.1),   // verde
    1.5,
    { POINT_INTENSITY_MAX: 30, POINT_RANGE: 5 }
);

// Array de todas as luzes — para iterar nos loops
export const ALL_BLINKING_LIGHTS: BlinkingLightConfig[] = [SPAWN_LIGHT, GOAL_LIGHT];

export const GLOW_LAYER = {
    BLUR_KERNEL_SIZE: 32,
    INTENSITY:        0.8,
} as const;

export const SCENE_LIGHTING = {
    MAX_SIMULTANEOUS_LIGHTS: 8,
    HEMISPHERIC_INTENSITY:   0.5,
} as const;
