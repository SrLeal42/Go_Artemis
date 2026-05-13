export default function AboutContent() {
  return (
    <div className="help-content about-content">
      <h3>⍢ Projeto Artemis</h3>
      <p>
        Escreva comandos em uma <span className="hl">linguagem própria</span> — compilada 
        em <span className="hl">Go via WebAssembly</span> — e observe o rover navegar por 
        terrenos gerados proceduralmente com <span className="hl">Wave Function Collapse</span>.
      </p>
      <p>
        O objetivo é guiar o rover até o destino, desviando de obstáculos,
        usando lógica condicional, loops e funções customizadas.
      </p>

      <h4>⚉ Tecnologias</h4>
      <ul>
        <li>Go + WebAssembly</li>
        <li>React + TypeScript</li>
        <li>BabylonJS</li>
        <li>CodeMirror 6</li>
        <li>Wave Function Collapse (WFC)</li>
      </ul>

      <h4>⚉ Destaques Técnicos</h4>
      <ul>
        <li><strong>Compilador completo:</strong> Lexer → Parser → <em>Abstract Syntax Tree</em> (AST)</li>
        <li><strong>Execução em tempo real:</strong> Rover animado em cena 3D.</li>
        <li><strong>Tudo no navegador:</strong> Compilador rodando em Go/WASM, sem backend.</li>
        <li><strong>Geração procedural:</strong> Terrenos criados com Wave Function Collapse (WFC) e validados com pathfinding.</li>
        <li><strong>Editor customizado:</strong> Syntax highlighting próprio para a linguagem Artemis.</li>
      </ul>

      <a
        className="help-github-link"
        href="https://github.com/SrLeal42/Go_Artemis"
        target="_blank"
        rel="noopener noreferrer"
      >
       GitHub
      </a>
    </div>
  );
}
