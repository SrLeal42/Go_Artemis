export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/** Normaliza um ângulo para o intervalo [-π, +π] */
export function normalizeAngle(radians: number): number {
    radians %= 2 * Math.PI;
    if (radians > Math.PI)  radians -= 2 * Math.PI;
    if (radians < -Math.PI) radians += 2 * Math.PI;
    return radians;
}

/** Retorna o menor delta angular entre dois ângulos (resultado em [-π, +π]) */
export function shortestAngleDelta(from: number, to: number): number {
    return normalizeAngle(to - from);
}
