import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { Scene3D } from '../scene3D/Scene3D';

import { SimulationController } from '../scene3D/SimulationController';
import { SimulationStatus } from '../scene3D/models/SimulationStatusTypes';

export interface RoverSceneHandle {
    toggleCamera: () => void;
    stop: () => void;
    reset: () => void;
    regenerateTerrain: () => void;
}

export const RoverScene = forwardRef<RoverSceneHandle, { commands: any; onSimulationEnd?: (status: SimulationStatus, message?: string, steps?: number) => void }>(
    ({ commands, onSimulationEnd }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Aqui você armazena a sua Classe de forma Segura no React!
  const sceneInstance = useRef<Scene3D | null>(null);

  const controllerRef = useRef<SimulationController | null>(null);

  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);


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
  
    controllerRef.current.run(commands, (status, message, steps?: number) => {
        onSimulationEnd?.(status, message, steps);
    });
    
    return () => {
        controllerRef.current?.cancel();
    };
  
  }, [commands]); // Esse Effect roda SEMPRE que o App pai jogar novos comandos na prop


  useEffect(() => {
    if (!canvasRef.current) return;

    
    const scene3d = new Scene3D(canvasRef.current, (loaded, total) => {
        setLoadProgress(Math.round((loaded / total) * 100));
    });
    scene3d._readyPromise.then(() => setIsLoaded(true));

    // Inicia a cena e guarda o controle na referência
    sceneInstance.current = scene3d; // new Scene3D(canvasRef.current);

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
    <div className="scene-canvas-container">
      <canvas 
        ref={canvasRef} 
        style={{ display: 'block', width: '100%', height: '100%', outline: 'none' }} 
      />
      {!isLoaded && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-ring" />
            <span className="loading-percent">{loadProgress}%</span>
            <p className="loading-label">Carregando...</p>
          </div>
          <div className="loading-bar-track">
            <div className="loading-bar-fill" style={{ width: `${loadProgress}%` }} />
          </div>
        </div>
      )}
    </div>
  );

});


export default RoverScene;