import { useState, useEffect } from 'react';
import './index.css';
import RoverScene from './components/RoverScene.tsx';
import type { CompilerResult } from './engineAST/models/CompilerResultType.ts';
import type { CommandNode } from './engineAST/models/CMDTypes.ts';

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
  // const [output, setOutput] = useState<string>("// Aguardando carregamento do compilador...");
  const [activeCommands, setActiveCommands] = useState<CommandNode[]>([])

  // Novo estado para sabermos se o compilador já "subiu" na memória
  const [isWasmLoaded, setIsWasmLoaded] = useState<boolean>(false);

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
    
    setActiveCommands(compileResponse.comands)
    // console.log(compileResponse.comands)
  
  }



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
            <button className="compile-btn" onClick={handleRun} disabled={!isWasmLoaded}>
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
             <RoverScene commands={activeCommands} />
          </div>
        </div>

      </main>
      
    </div>
  );
}

export default App;
