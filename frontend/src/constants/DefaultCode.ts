/**
 * Código padrão exibido no editor quando o usuário abre a aplicação pela primeira vez.
 */
export const DEFAULT_USER_CODE = `FUNCAO Verifica_Frente_e_Gira {

ENQUANTO NAO LIVRE FRENTE {

IF LIVRE DIREITA {
 GIRA DIREITA
} ELSE {
 GIRA ESQUERDA
}

}

}

REPEAT 50 {

Verifica_Frente_e_Gira

IF OBJETIVO DIREITA {
GIRA DIREITA 
}

IF OBJETIVO ESQUERDA {
GIRA ESQUERDA
}

AVANCA 1
}
`;
