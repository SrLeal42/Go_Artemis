import * as t from './CMDTypes';

export type CompilerResult = {
  success: boolean;
  comands?: t.CommandNode[];
  error?: any[];
};