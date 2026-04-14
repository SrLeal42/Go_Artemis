import type { CommandNode, RepeatCmd, IfCmd } from '../models/CMDTypes';
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
      
      // SE FOR UM IF:
      else if ('condition' in node) {
        
        const ifNode = (node as IfCmd);
        
        const conditionResponse = conditionVerification(ifNode.condition, ifNode.direction); 
      
        if (conditionResponse) {
           yield* this.executeAST((node as IfCmd).commands, conditionVerification);
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
