import { useEffect, useRef } from 'react';
import { Scene3D } from '../scene3D/Scene3D';

import { ASTEngine } from '../engineAST/scripts/ASTEngine';

export function RoverScene({ commands }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Aqui você armazena a sua Classe de forma Segura no React!
  const sceneInstance = useRef<Scene3D | null>(null);

      useEffect(() => {
        if (!commands || commands.length === 0 || !sceneInstance.current) return;
        
        let isCancelled = false; 
        
        // Uma função "assíncrona" permite o uso de "await" para travar o laço temporariamente
        const runSimulation = async () => {
          
            const engineIterator = ASTEngine.executeAST(commands, (cond, dir) => {
                // Pergunta pra física do Scene3D se a condição bate
                return sceneInstance.current?.checkConditionOnMap(cond, dir) ?? false;
            });
            
            // Fica repetindo infinitamente, a não ser que step.done acabe ou isCancelled ative
            while (!isCancelled) {
                const step = engineIterator.next();
                
                if (step.done) {
                    console.log("🏁 Fundo do poço, trajetório completa!");
                    break;
                }
                
                const acao = step.value;
                
                // O [await] AQUI é a cereja do bolo. O laço "while" vai CONGELAR
                // até o resolve() lá no Scene3D ser disparado e a promise terminar!
                switch(acao.action) {
                  case "AVANCA":
                    await sceneInstance.current?.moveForward(acao.value);
                    break;
                  case "RECUA":
                    await sceneInstance.current?.moveBackward(acao.value);
                    break;
                }
            }
        };
        
        runSimulation();

        // Cleanup: Se o componente desmontar ou reiniciar, mata o relógio velho
        return () => {
          isCancelled = true;
        };
    
    }, [commands]); // Esse Effect roda SEMPRE que o App pai jogar novos comandos na prop


  useEffect(() => {
    if (!canvasRef.current) return;

    // Inicia a cena e guarda o controle na referência
    sceneInstance.current = new Scene3D(canvasRef.current);

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
}


export default RoverScene;