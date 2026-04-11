import { useEffect, useRef } from 'react';
import { Scene3D } from '../scene3D/Scene3D'; // Ajuste o path se necessário

export function RoverScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Aqui você armazena a sua Classe de forma Segura no React!
  const sceneInstance = useRef<Scene3D | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Inicia a cena e guarda o controle na referência
    sceneInstance.current = new Scene3D(canvasRef.current);

    // O return do useEffect age como o "OnDestroy" do React
    return () => {
      if (sceneInstance.current) {
         sceneInstance.current.dispose(); // Chama o método de morte do Babylon
         sceneInstance.current = null;    // Limpa a variável do React
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
}


export default RoverScene;