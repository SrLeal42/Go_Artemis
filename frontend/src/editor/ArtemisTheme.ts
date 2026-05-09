import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { artemisTags } from './ArtemisParser';

// Tema visual (background, cursor, gutter, etc.)
export const artemisTheme = EditorView.theme({
  '&': {
    backgroundColor: '#020617',
    color: '#e2e8f0',
    height: '100%',
  },

  '.cm-content': {
    fontFamily: "'Fira Code', monospace",
    fontSize: '1.1rem',
    caretColor: '#60a5fa',
  },

  '.cm-cursor': {
    borderLeftColor: '#60a5fa',
  },

  '.cm-gutters': {
    backgroundColor: '#020617',
    color: '#475569',
    borderRight: '1px solid #1e293b',
    fontSize: '1.1rem',
  },

  '.cm-activeLineGutter': {
    backgroundColor: '#0f172a',
    color: '#94a3b8',
  },

  '.cm-activeLine': {
    backgroundColor: '#0f172a80',
  },

  '.cm-selectionBackground': {
    backgroundColor: '#3b82f640 !important',
  },

  '.cm-scroller': {
    overflow: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: '#334155 #020617',
  },
  
  '.cm-scroller::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  
  '.cm-scroller::-webkit-scrollbar-track': {
    background: '#020617',
  },
  
  '.cm-scroller::-webkit-scrollbar-thumb': {
    background: '#334155',
    borderRadius: '4px',
  },
  
  '.cm-scroller::-webkit-scrollbar-thumb:hover': {
    background: '#475569',
  },
  
  '.cm-scroller::-webkit-scrollbar-corner': {
    background: '#020617',
  },

}, { dark: true });

export const artemisHighlight = syntaxHighlighting(
  HighlightStyle.define([
    // COMMANDS — protagonistas, máximo destaque
    { tag: artemisTags.command,    color: '#38bdf8', fontWeight: 'bold' },

    // Controle de fluxo — roxo (herda a identidade do botão compilar)
    { tag: artemisTags.control,    color: '#a78bfa' },
    
    // Definição — rosa/magenta (variante do roxo, mas distinto)
    { tag: artemisTags.definition, color: '#c084fc' },

    // Sensores — âmbar (sinal de "atenção/detecção")
    { tag: artemisTags.sensor,     color: '#fbbf24' },

    // Operador lógico — rosa avermelhado (negação = cuidado)
    { tag: artemisTags.logic,      color: '#fb7185' },

    // Direções — verde (já presente no site como cor de sucesso)
    { tag: artemisTags.direction,  color: '#34d399' },

    // Números — laranja quente (complemento natural do azul)
    { tag: artemisTags.number,     color: '#fdba74' },

    // Chaves — slate sutil (estrutural, não compete com keywords)
    { tag: artemisTags.bracket,    color: '#64748b' },

    // Identificadores — teal (distingue de commands mas não compete)
    { tag: artemisTags.identifier, color: '#5eead4' },

    // Erro — vermelho com underline (inequívoco)
    { tag: artemisTags.invalid,    color: '#f87171', textDecoration: 'underline wavy' },
  ])
);
