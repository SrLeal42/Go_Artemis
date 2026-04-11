import { useState, useEffect } from 'react';
import './index.css';
import RoverScene from './components/RoverScene.tsx';

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
  const [code, setCode] = useState<string>("AVANCA 1\nREPEAT 3 {\n  RECUA 1\n}");
  const [output, setOutput] = useState<string>("// Aguardando carregamento do compilador...");
  
  // Novo estado para sabermos se o compilador já "subiu" na memória
  const [isWasmLoaded, setIsWasmLoaded] = useState<boolean>(false);

  // useEffect vai rodar 1 vez assim que a página abrir
  useEffect(() => {
    
    if (!window.Go) {
       setOutput("// ERRO: wasm_exec.js não foi encontrado no index.html");
       return;
    }

    const go = new window.Go();
    
    // Faz o download silencioso do nosso binário Go e passa pra memória do navegador
    WebAssembly.instantiateStreaming(fetch("/wasm/compiler.wasm"), go.importObject)
      .then((result) => {
        go.run(result.instance); // Isso dispara aquela nossa func main() no Go!
        setIsWasmLoaded(true);
        setOutput("// Compilador Artemis carregado e pronto para uso! 🚀\n");
      })
      .catch((err) => {
        console.error("Erro no WASM:", err);
        setOutput("// Falha ao carregar o compilador. Olhe o Console (F12) para detalhes.");
      });
  }, []);

  
  const handleCompile = () => {
    if (!isWasmLoaded) {
      setOutput("Erro: Compilador não preparado. Tente novamente em instantes.");
      return;
    }

    try {
    
      // Mandamos a string lá pra dentro do Go, que processa tudo e devolve a String do JSON!
      const jsonResult = window.artemisCompile(code);
      setOutput(jsonResult);
      console.log(jsonResult)
    
    } catch (error) {
      setOutput(`Erro inesperado durante compilação: ${error}`);
    }

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
            <button className="compile-btn" onClick={handleCompile} disabled={!isWasmLoaded}>
              {isWasmLoaded ? "Processar Rota" : "Carregando..."}
            </button>
          </div>
          <textarea 
            className="code-editor" 
            value={code} 
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* COLUNA DIREITA PREDOMINANTE: Simulação 3D */}
        <div className="scene-section">
          <div className="scene-header">
            <h2>🗺️ Simulação Rover 3D</h2>
          </div>
          <div className="scene-wrapper">
             <RoverScene />
          </div>
        </div>

      </main>
      
    </div>
  );
}

export default App;
