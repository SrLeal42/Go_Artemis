import { SimulationStatus } from '../scene3D/models/SimulationStatusTypes';

/**
 * Mapeamento de status de simulação para chaves de som correspondentes.
 */
export const SIMULATION_END_SOUNDS: Record<string, string> = {
    [SimulationStatus.SUCCESS]: "sim_success",
    [SimulationStatus.ERROR]:   "sim_error",
    [SimulationStatus.END]:     "sim_end",
};
