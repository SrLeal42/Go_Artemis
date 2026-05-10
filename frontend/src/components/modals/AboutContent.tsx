export default function AboutContent() {
  return (
    <div className="help-content about-content">
      <h3>⍢ Projeto Artemis</h3>
      <p>
        Artemis é um simulador educacional de um rover espacial.
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
        <li><strong>Compilador:</strong> Go → WebAssembly</li>
        <li><strong>Frontend:</strong> React + BabylonJS</li>
        <li><strong>Geração de terreno:</strong> Wave Function Collapse</li>
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
