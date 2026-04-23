package token

var keywords = map[string]TokenType{
	"AVANCA":    AVANCA,
	"RECUA":     RECUA,
	"GIRA":      GIRA,
	"DETECTA":   DETECTA,
	"OBSTACULO": OBSTACULO,
	"OBJETIVO":  OBJETIVO,
	"BORDA":     BORDA,
	"ESQUERDA":  ESQUERDA,
	"DIREITA":   DIREITA,
	"FRENTE":    FRENTE,
	"IF":        IF,
	"REPEAT":    REPEAT,
}

// Essa função pega a palavra lida e vê se bate com nosso sistema do Rover
func LookupIdent(ident string) TokenType {
	if tok, ok := keywords[ident]; ok {
		return tok
	}
	return ILLEGAL // Se não achou na lista acima, o comando não existe!
}
