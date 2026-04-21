import { useState, useEffect, useRef } from 'react';
import './index.css';

import RoverScene from './components/RoverScene.tsx';
import CodeEditor from './components/CodeEditor.tsx';

import type { CompilerResult } from './engineAST/models/CompilerResultType.ts';
import type { CommandNode } from './engineAST/models/CMDTypes.ts';
import type { RoverSceneHandle } from './components/RoverScene.tsx';

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
  const [code, setCode] = useState<string>("REPEAT 5 {\n REPEAT 4 {\n IF OBSTACULO FRENTE { \n GIRA DIREITA\n }\n }\n AVANCA 1\n}");

  const [activeCommands, setActiveCommands] = useState<CommandNode[]>([])

  // Novo estado para sabermos se o compilador já "subiu" na memória
  const [isWasmLoaded, setIsWasmLoaded] = useState<boolean>(false);

  const roverSceneRef = useRef<RoverSceneHandle>(null);

  const [isSimulating, setIsSimulating] = useState(false);

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

    
 const handleRun = () => {
    
  const compileResponse = handleCompile();
    
    if (!compileResponse || !compileResponse.success) {
       console.warn("Falha na compilação, o motor não vai iniciar.");
       return; 
    }

    setIsSimulating(true);
    setActiveCommands(compileResponse.comands)
  }

  const handleStop = () => {
    roverSceneRef.current?.stop();
    setIsSimulating(false);
  };
  
  const handleReset = () => {
    roverSceneRef.current?.reset();
    setIsSimulating(false);
  };
  
  const handleNewLevel = () => {
    roverSceneRef.current?.regenerateTerrain();
    setIsSimulating(false);
  };

  const handleSimulationEnd = () => {
    setIsSimulating(false);
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
          </div>
        </div>

      </main>
      
    </div>
  );
}

export default App;
