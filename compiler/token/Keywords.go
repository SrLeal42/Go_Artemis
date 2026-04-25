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
	"ELSE":      ELSE,
	"ENQUANTO":  ENQUANTO,
	"NAO":       NAO,
	"LIVRE":     LIVRE,
	"MARCADO":   MARCADO,
	"MARCAR":    MARCAR,
	"FUNCAO":    FUNCAO,
}

func LookupIdent(ident string) TokenType {
	if tok, ok := keywords[ident]; ok {
		return tok
	}
	return IDENT // Agora palavras desconhecidas viram identificadores, não erros!
}
