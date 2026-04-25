import type { CommandNode, RepeatCmd, IfCmd, WhileCmd } from '../models/CMDTypes';
import type { FlatAction } from '../models/FlatActionType';

export class ASTEngine {
  
  // O asterisco (*) diz que ela é uma Função Geradora.
  // Ela não retorna uma Array (lista), retorna um "Iterador" pausável.
  public static *executeAST(
    nodes: CommandNode[],
    conditionVerification: (condition: string, diretion: string) => boolean
  ): IterableIterator<FlatAction> {
    for (const node of nodes) {
      
      // SE FOR UM LOOP:
      if ('times' in node) {
        for (let i = 0; i < (node as RepeatCmd).times; i++) {
          // O yield* (com asterisco) diz para o iterador repassar a extração para os filhos
          yield* this.executeAST((node as RepeatCmd).commands, conditionVerification);
        }
      }
      
      // A verificação do WHILE precisa vir antes, pois o IF tbm tem 'condition'
      else if ('whileCommands' in node) {
        const whileNode = node as WhileCmd;
        
        while (true) {
          let result = conditionVerification(whileNode.condition, whileNode.direction);
        
          if (whileNode.negated) result = !result;
        
          if (!result) break;
        
          yield* this.executeAST(whileNode.whileCommands, conditionVerification);
        }

      }

      // SE FOR UM IF:
      else if ('condition' in node) {
        const ifNode = node as IfCmd;
        
        let result = conditionVerification(ifNode.condition, ifNode.direction);
        
        if (ifNode.negated) result = !result;
        
        if (result) {
        
          yield* this.executeAST(ifNode.commands, conditionVerification);
        
        } else if (ifNode.elseCommands && ifNode.elseCommands.length > 0) {
        
          yield* this.executeAST(ifNode.elseCommands, conditionVerification);
        
        }

      }
      
      // SE FOR UM COMANDO RETA (EX: AVANCA):
      else if ('action' in node) {
         // O 'yield' pega esta ação, devolve e CONGELA a execução aqui mesmo!
         yield (node as FlatAction); 
      }
    }
  }
}
