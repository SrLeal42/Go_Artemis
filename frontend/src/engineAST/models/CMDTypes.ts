// 1. Tipamos os Retornos para espelhar o seu Backend em Go
export type MoveCmd = { action: string; value: number };
export type TurnCmd = { action: string; direction: string };
export type DetectCmd = { action: string };
export type RepeatCmd = { times: number; commands: CommandNode[] };
export type IfCmd = { condition: string; negated?: boolean; direction: string; commands: CommandNode[]; elseCommands?: CommandNode[] };
export type WhileCmd = { condition: string; negated?: boolean; direction: string; whileCommands: CommandNode[] };

export type CommandNode = MoveCmd | TurnCmd | DetectCmd | RepeatCmd | IfCmd | WhileCmd;
