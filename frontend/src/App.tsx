import { useState, useEffect, useRef } from 'react';
import './index.css';
import './styles/SimulationOverlay.css';

import RoverScene from './components/RoverScene.tsx';
import CodeEditor from './components/CodeEditor.tsx';

import type { CompilerResult } from './engineAST/models/CompilerResultType.ts';
import type { CommandNode } from './engineAST/models/CMDTypes.ts';
import type { RoverSceneHandle } from './components/RoverScene.tsx';

import { SimulationStatus } from './scene3D/models/SimulationStatusTypes.ts';

// ----------------------------------------------------
// Dica Profissional: Expandimos os Tipos globais do TypeScript (Window)
// Isso evita alertas vermelhos quando o TS perceber que criamos variáveis dinâmicas!
// ----------------------------------------------------
declare global {
  interface Window {
    Go: any;
    artemisCompile: (script: string) => string;
  }
}

function App() {
  const [code, setCode] = useState<string>("REPEAT 50 {\n\nENQUANTO NAO LIVRE FRENTE {\n\n IF LIVRE DIREITA {\n GIRA DIREITA \n } ELSE {\n GIRA ESQUERDA \n }\n\n}\n\nIF OBJETIVO DIREITA {\nGIRA DIREITA \n}\n\nIF OBJETIVO ESQUERDA {\nGIRA ESQUERDA\n}\n\nAVANCA 1\n}\n");

  const [activeCommands, setActiveCommands] = useState<CommandNode[]>([])

  // Novo estado para sabermos se o compilador já "subiu" na memória
  const [isWasmLoaded, setIsWasmLoaded] = useState<boolean>(false);

  const roverSceneRef = useRef<RoverSceneHandle>(null);

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationStatus | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isTopView, setIsTopView] = useState(true);
  const handleCameraToggle = () => {
      roverSceneRef.current?.toggleCamera();
      setIsTopView(prev => !prev);
  };

  // useEffect vai rodar 1 vez assim que a página abrir
  useEffect(() => {
    
    if (!window.Go) {
       console.log("// ERRO: wasm_exec.js não foi encontrado no index.html");
       return;
    }

    const go = new window.Go();
    
    // Faz o download silencioso do nosso binário Go e passa pra memória do navegador
    WebAssembly.instantiateStreaming(fetch("/wasm/compiler.wasm"), go.importObject)
      .then((result) => {
        go.run(result.instance); // Isso dispara aquela nossa func main() no Go!
        setIsWasmLoaded(true);
        console.log("// Compilador Artemis carregado e pronto para uso! 🚀\n");
      })
      .catch((err) => {
        console.error("Erro no WASM:", err);
        console.log("// Falha ao carregar o compilador. Olhe o Console (F12) para detalhes.");
      });
  }, []);

  
  const handleCompile = (): CompilerResult | null => {
    if (!isWasmLoaded) {
      console.log("Erro: Compilador não preparado. Tente novamente em instantes.");
      return;
    }

    try {
    
      const jsonResultString = window.artemisCompile(code);
      // Aqui transformamos o texto que o Go gerou em uma lista Real do Javascript!
      const astNodes = JSON.parse(jsonResultString);
      
      // Imprime bonitinho na tela como string pro usuário ver o q foi gerado
      console.log(JSON.stringify(astNodes, null, 2));
      return astNodes;
    
    } catch (error) {
      console.log(`Erro inesperado durante compilação: ${error}`);
    }

  };

  const resetSimulationVariables = () => {
    setIsSimulating(false);
    setSimulationResult(null);
    setErrorMessage(null);
  } 

    
  const handleRun = () => {
    
    const compileResponse = handleCompile();
    
    if (!compileResponse || !compileResponse.success) {
       console.warn("Falha na compilação, o motor não vai iniciar.");
       return; 
    }

    setIsSimulating(true);
    setActiveCommands(compileResponse.comands)
    setSimulationResult(null);
  }

  const handleStop = () => {
    roverSceneRef.current?.stop();
    resetSimulationVariables();
  };
  
  const handleReset = () => {
    roverSceneRef.current?.reset();
    resetSimulationVariables();
  };
  
  const handleNewLevel = () => {
    roverSceneRef.current?.regenerateTerrain();
    resetSimulationVariables();
  };

  const handleSimulationEnd = (status: SimulationStatus, message?: string) => {
    setIsSimulating(false);
    
    if (status === SimulationStatus.SUCCESS || status === SimulationStatus.ERROR || status === SimulationStatus.END) {
      setSimulationResult(status);
      if (message) setErrorMessage(message);
    }

  };


  const getOverlayClass = (status: SimulationStatus) => {
    if (status === SimulationStatus.SUCCESS) return 'overlay-success';
    if (status === SimulationStatus.ERROR) return 'overlay-error';
    if (status === SimulationStatus.END) return 'overlay-end';
    return '';
  };





  return (
    <div className="container">
      <header className="header">
        <h1>🚀 Artemis Compiler</h1>
        <p>Desenvolva e compile comandos para o seu Rover em tempo real</p>
      </header>

      <main className="editor-layout">
        
        {/* COLUNA ESQUERDA: Sidebar (Estilo LeetCode) */}
        <div className="sidebar">
          <div className="editor-header">
            <h2>💻 Fonte (Artemis Lang)</h2>
            <div className="editor-actions">
              {isSimulating ? (
                  <button className="action-btn btn-stop" data-tooltip="Parar" onClick={handleStop}>
                      ⏹
                  </button>
              ) : (
                  <button className="action-btn btn-run" data-tooltip="Rodar" onClick={handleRun} disabled={!isWasmLoaded}>
                      ▶
                  </button>
              )}
              <button className="action-btn btn-reset" data-tooltip="Reiniciar" onClick={handleReset} disabled={isSimulating}>
                  🔄
              </button>
              <button className="action-btn btn-new-level" data-tooltip="Regerar Terreno" onClick={handleNewLevel} disabled={isSimulating}>
                  🎲
              </button>
            </div>

          </div>
          <CodeEditor 
              initialCode={code} 
              onCodeChange={setCode} 
          />
        </div>

        {/* COLUNA DIREITA PREDOMINANTE: Simulação 3D */}
        <div className="scene-section">
          <div className="scene-header">
          
            <h2>🗺️ Simulação Rover 3D</h2>
          
            <div className="camera-switch" onClick={handleCameraToggle}>
                <span className={`switch-label ${isTopView ? 'active' : ''}`}>Top</span>
                <div className="switch-track">
                    <div className={`switch-thumb ${isTopView ? 'left' : 'right'}`} />
                </div>
                <span className={`switch-label ${!isTopView ? 'active' : ''}`}>Orbit</span>
            </div>
          
          </div>
          <div className="scene-wrapper">
            <RoverScene ref={roverSceneRef} commands={activeCommands} onSimulationEnd={handleSimulationEnd} />
                          
            {simulationResult !== null && (
              <div className={`simulation-overlay ${getOverlayClass(simulationResult)}`}>
                  <div className="overlay-content">
                      
                      {simulationResult === SimulationStatus.SUCCESS && (
                          <>
                              <span className="overlay-icon">🎯</span>
                              <h2>Objetivo Alcançado!</h2>
                              <p>O rover chegou ao destino com sucesso.</p>
                          </>
                      )}
                      {simulationResult === SimulationStatus.ERROR && (
                          <>
                              <span className="overlay-icon">💥</span>
                              <h2>Simulação Falhou</h2>
                              <p>{errorMessage || "O rover encontrou um problema durante a execução."}</p>
                          </>
                      )}
                      {simulationResult === SimulationStatus.END && (
                          <>
                              <span className="overlay-icon">🏁</span>
                              <h2>Trajetória Incompleta</h2>
                              <p>Os comandos acabaram, mas o rover não chegou ao objetivo.</p>
                          </>
                      )}
                      <div className="overlay-actions">
                          <button className="overlay-btn btn-retry" onClick={() => {
                              handleReset();
                          }}>
                              🔄 Reiniciar
                          </button>
                          <button className="overlay-btn btn-new" onClick={() => {
                              handleNewLevel();
                          }}>
                              🎲 Novo Level
                          </button>

                      </div>
                  </div>
              </div>
            )}

          </div>
        </div>

      </main>
      
    </div>
  );
}

export default App;
