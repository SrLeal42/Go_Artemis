export default function TutorialContent() {
  return (
    <div className="help-content tutorial-content">
      <h3>◪ Primeiros Passos</h3>

      <div className="tutorial-step">
        <span className="step-number">I</span>
        <div>
          <strong>Escreva seu código</strong>
          <p>Use o editor à esquerda para escrever <span className="hl">comandos</span> na linguagem <span className="hl">Artemis</span>.</p>
        </div>
      </div>

      <div className="tutorial-step">
        <span className="step-number">II</span>
        <div>
          <strong>Compile e execute</strong>
          <p>Clique em <kbd>▶</kbd> para <span className="hl">compilar</span> e <span className="hl">iniciar</span> a simulação do rover.</p>
        </div>
      </div>

      <div className="tutorial-step">
        <span className="step-number">III</span>
        <div>
          <strong>Observe o rover</strong>
          <p>Acompanhe o <span className="hl">rover</span> na cena 3D. Use o switch<span className="hl"><em>Top/Orbit</em></span> para trocar a câmera.</p>
        </div>
      </div>

      <div className="tutorial-step">
        <span className="step-number">IV</span>
        <div>
          <strong>Alcance o objetivo</strong>
          <p>O rover precisa chegar ao tile <span className="hl">objetivo</span> desviando dos <span className="hl">obstáculos</span>.</p>
        </div>
      </div>

      <h4>Exemplo</h4>
      <pre className="code-block">
        {`  REPEAT 5 {
    
    IF OBSTACULO FRENTE {
      GIRA DIREITA
    }

    AVANCA 1
  }`}
      </pre>
      <p className="code-caption">Move o rover 5 vezes, desviando se houver obstáculo à frente.</p>
    </div>
  );
}
