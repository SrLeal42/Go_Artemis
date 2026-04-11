// 1. Tipamos os Retornos para espelhar o seu Backend em Go
export type MoveCmd = { action: string; value: number };
export type TurnCmd = { action: string; direction: string };
export type DetectCmd = { action: string };
export type RepeatCmd = { times: number; commands: CommandNode[] };
export type IfCmd = { condition: string; direction: string; commands: CommandNode[] };

export type CommandNode = MoveCmd | TurnCmd | DetectCmd | RepeatCmd | IfCmd;
