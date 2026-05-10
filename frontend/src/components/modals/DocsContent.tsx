interface DocEntry {
  keyword: string;
  category: string;
  syntax: string;
  description: string;
}

const LANGUAGE_DOCS: DocEntry[] = [
  // ── Comandos ──
  {
    keyword: 'AVANCA',
    category: 'Comando',
    syntax: 'AVANCA <n>',
    description: 'Move o rover para frente n casas.',
  },
  {
    keyword: 'RECUA',
    category: 'Comando',
    syntax: 'RECUA <n>',
    description: 'Move o rover para trás n casas.',
  },
  {
    keyword: 'GIRA',
    category: 'Comando',
    syntax: 'GIRA ESQUERDA | DIREITA',
    description: 'Rotaciona o rover 90° na direção indicada.',
  },
  {
    keyword: 'MARCAR',
    category: 'Comando',
    syntax: 'MARCAR',
    description: 'Marca o tile atual. Pode ser verificado com MARCADO.',
  },

  // ── Controle de Fluxo ──
  {
    keyword: 'IF',
    category: 'Controle',
    syntax: 'IF <condição> <direção> { ... }',
    description: 'Executa o bloco se a condição for verdadeira na direção.',
  },
  {
    keyword: 'ELSE',
    category: 'Controle',
    syntax: 'IF ... { ... } ELSE { ... }',
    description: 'Bloco alternativo executado quando o IF é falso.',
  },
  {
    keyword: 'REPEAT',
    category: 'Controle',
    syntax: 'REPEAT <n> { ... }',
    description: 'Repete o bloco de comandos n vezes.',
  },
  {
    keyword: 'ENQUANTO',
    category: 'Controle',
    syntax: 'ENQUANTO <condição> <direção> { ... }',
    description: 'Repete o bloco enquanto a condição for verdadeira.',
  },

  // ── Sensores / Condições ──
  {
    keyword: 'OBSTACULO',
    category: 'Sensor',
    syntax: 'OBSTACULO FRENTE | ESQUERDA | DIREITA',
    description: 'Verdadeiro se há um obstáculo na direção indicada.',
  },
  {
    keyword: 'OBJETIVO',
    category: 'Sensor',
    syntax: 'OBJETIVO FRENTE | ESQUERDA | DIREITA',
    description: 'Verdadeiro se o objetivo está na direção indicada.',
  },
  {
    keyword: 'BORDA',
    category: 'Sensor',
    syntax: 'BORDA FRENTE | ESQUERDA | DIREITA',
    description: 'Verdadeiro se a borda do mapa está na direção indicada.',
  },
  {
    keyword: 'LIVRE',
    category: 'Sensor',
    syntax: 'LIVRE FRENTE | ESQUERDA | DIREITA',
    description: 'Verdadeiro se o caminho está livre (sem obstáculo) na direção.',
  },
  {
    keyword: 'MARCADO',
    category: 'Sensor',
    syntax: 'MARCADO FRENTE | ESQUERDA | DIREITA',
    description: 'Verdadeiro se o tile na direção foi marcado com MARCAR.',
  },

  // ── Direções ──
  {
    keyword: 'DIREITA',
    category: 'Direção',
    syntax: '<sensor | comando> DIREITA',
    description: 'Direção à direita do rover. Usada em sensores e no GIRA.',
  },
  {
    keyword: 'ESQUERDA',
    category: 'Direção',
    syntax: '<sensor | comando> ESQUERDA',
    description: 'Direção à esquerda do rover. Usada em sensores e no GIRA.',
  },
  {
    keyword: 'FRENTE',
    category: 'Direção',
    syntax: '<sensor> FRENTE',
    description: 'Direção à frente do rover. Usada apenas em sensores.',
  },

  // ── Lógica ──
  {
    keyword: 'NAO',
    category: 'Lógica',
    syntax: 'NAO <condição>',
    description: 'Nega a condição seguinte (ex: NAO LIVRE FRENTE).',
  },

  // ── Funções ──
  {
    keyword: 'FUNCAO',
    category: 'Definição',
    syntax: 'FUNCAO <nome> { ... }',
    description: 'Define uma função reutilizável. Chame pelo nome depois.',
  },
  {
    keyword: '<nome>',
    category: 'Identificador',
    syntax: '<nome>',
    description: 'Executa uma função previamente definida.',
  },
];

// Agrupa por categoria para renderizar em seções
const groupByCategory = (docs: DocEntry[]) => {
  
  const groups: Record<string, DocEntry[]> = {};
  
  for (const entry of docs) {
    if (!groups[entry.category]) groups[entry.category] = [];
    groups[entry.category].push(entry);
  }

  return groups;
};

const GROUPED_DOCS = groupByCategory(LANGUAGE_DOCS);

export default function DocsContent() {
  
  return (
    <div className="help-content docs-content">
      <h3>⚉ Referência da Linguagem</h3>

      {Object.entries(GROUPED_DOCS).map(([category, entries]) => (
        <div key={category} className="docs-category">
          <h4>{category}</h4>
          <table className="docs-table">
            <thead>
              <tr>
                <th>Keyword</th>
                <th>Sintaxe</th>
                <th>Descrição</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.keyword}>
                  <td><code>{entry.keyword}</code></td>
                  <td><code>{entry.syntax}</code></td>
                  <td>{entry.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* <h4>⚉ Direções</h4>
      <p>
        <span className="hl"><code>FRENTE</code></span>, <span className="hl"><code>ESQUERDA</code></span> e <span className="hl"><code>DIREITA</code></span> são
        usadas como argumento dos <span className="hl">sensores</span> e do <span className="hl"><code>GIRA</code></span>.
        São relativas à orientação atual do rover.
      </p> */}
    </div>
  );
}
