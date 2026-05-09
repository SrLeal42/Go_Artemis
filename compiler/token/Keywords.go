package token

// Quando adicionar uma Keyword categoriza-la no map keywordsCategorized
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

// Todas as Keywords categorizadas para o front-end poder estilizar.
var KeywordsCategorized = map[string][]string{
	"control":    {"IF", "ELSE", "REPEAT", "ENQUANTO"},
	"command":    {"AVANCA", "RECUA", "GIRA", "MARCAR"},
	"sensor":     {"DETECTA", "OBSTACULO", "OBJETIVO", "BORDA", "LIVRE", "MARCADO"},
	"direction":  {"ESQUERDA", "DIREITA", "FRENTE"},
	"definition": {"FUNCAO"},
	"logic":      {"NAO"},
}

func LookupIdent(ident string) TokenType {
	if tok, ok := keywords[ident]; ok {
		return tok
	}
	return IDENT // Agora palavras desconhecidas viram identificadores, não erros!
}
