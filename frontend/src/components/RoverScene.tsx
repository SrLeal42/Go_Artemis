import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Scene3D } from '../scene3D/Scene3D';

import { SimulationController } from '../scene3D/SimulationController';
import { SimulationStatus } from '../scene3D/models/SimulationStatusTypes';

export interface RoverSceneHandle {
    toggleCamera: () => void;
    stop: () => void;
    reset: () => void;
    regenerateTerrain: () => void;
}

export const RoverScene = forwardRef<RoverSceneHandle, { commands: any; onSimulationEnd?: (status: SimulationStatus, message?: string) => void }>(
    ({ commands, onSimulationEnd }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Aqui você armazena a sua Classe de forma Segura no React!
  const sceneInstance = useRef<Scene3D | null>(null);

  const controllerRef = useRef<SimulationController | null>(null);


  useImperativeHandle(ref, () => ({
    
    toggleCamera: () => {
        sceneInstance.current?.camera.toggleCamera();
    },
    stop: () => {
      controllerRef.current?.stop();
    },
    reset: () => {
      controllerRef.current?.reset();
    },
    regenerateTerrain: () => {
      controllerRef.current?.regenerateTerrain();
    }

  }));


  useEffect(() => {
    
    if (!commands || commands.length === 0 || !controllerRef.current) return;
  
    controllerRef.current.run(commands, (status, message) => {
        onSimulationEnd?.(status, message);
    });
    
    return () => {
        controllerRef.current?.cancel();
    };
  
  }, [commands]); // Esse Effect roda SEMPRE que o App pai jogar novos comandos na prop


  useEffect(() => {
    if (!canvasRef.current) return;

    // Inicia a cena e guarda o controle na referência
    sceneInstance.current = new Scene3D(canvasRef.current);

    controllerRef.current = new SimulationController(sceneInstance.current);

    // O return do useEffect age como o "OnDestroy" do React
    return () => {
      if (sceneInstance.current) {
         sceneInstance.current.dispose();
         sceneInstance.current = null;
      }
    };
  }, []);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155' }}>
      <canvas 
        ref={canvasRef} 
        style={{ display: 'block', width: '100%', height: '100%', outline: 'none' }} 
      />
    </div>
  );

});


export default RoverScene;