import { StreamLanguage } from '@codemirror/language';
import { Tag } from '@lezer/highlight';

// Tags customizadas — cada uma é única, sem ambiguidade
export const artemisTags = {
  command:    Tag.define(),   // AVANCA, RECUA, GIRA, MARCAR
  sensor:     Tag.define(),   // DETECTA, OBSTACULO, OBJETIVO, BORDA, LIVRE, MARCADO
  control:    Tag.define(),   // IF, ELSE, REPEAT, ENQUANTO
  definition: Tag.define(),   // FUNCAO
  logic:      Tag.define(),   // NAO
  direction:  Tag.define(),   // ESQUERDA, DIREITA, FRENTE
  number:     Tag.define(),   // 90, 5
  bracket:    Tag.define(),   // { }
  identifier: Tag.define(),   // nomes de funções do usuário
  invalid:    Tag.define(),   // caracteres inválidos
};

let keywords: Record<string, string[]> | null = null;

function getKeywords(): Record<string, string[]> {

  if (!keywords && typeof window.artemisKeywords === 'function') {
    keywords = JSON.parse(window.artemisKeywords());
  }

  return keywords ?? {};
}


export const artemisParser = StreamLanguage.define({
  token(stream) {
    if (stream.eatSpace()) return null;

    if (stream.eat(/[{}]/)) return 'bracket';
    if (stream.match(/\d+/)) return 'number';

    if (stream.match(/[a-zA-Z_]+/)) {
      const word = stream.current();
      
      const kw = getKeywords();
      
      for (const [category, words] of Object.entries(kw)) {
        if (words.includes(word)) return category;
      }
      
      return 'identifier';
    }

    stream.next();
    return 'invalid';
  },

  // Mapeamento explícito: nome → tag
  tokenTable: {
    command:    artemisTags.command,
    sensor:     artemisTags.sensor,
    control:    artemisTags.control,
    definition: artemisTags.definition,
    logic:      artemisTags.logic,
    direction:  artemisTags.direction,
    number:     artemisTags.number,
    bracket:    artemisTags.bracket,
    identifier: artemisTags.identifier,
    invalid:    artemisTags.invalid,
  },
});
