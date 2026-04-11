export type FlatAction = {
  action?: string;        // "AVANCA", "RECUA", "GIRA", etc
  value?: number;         // quantidade de passos
  direction?: string;     // lados
};