package models

// TokenType é apenas um apelido para string, ajuda a deixar o código mais seguro
type TokenType string

// Vamos definir as constantes de todos os tipos de tokens que o nosso jogo aceita
const (
	// Tipos Especiais
	ILLEGAL = "ILLEGAL" // Quando o cara digita um caractere que não existe, tipo @ ou $
	EOF     = "EOF"     // "End Of File", marca o fim do arquivo lido

	// Identificadores + Palavras Chaves Principais do Rover
	AVANCA  = "AVANCA"
	RECUA   = "RECUA"
	GIRA    = "GIRA"
	DETECTA = "DETECTA"

	// Opcionais/Direções
	ESQUERDA = "ESQUERDA"
	DIREITA  = "DIREITA"
	FRENTE   = "FRENTE"

	// Valores
	NUMERO = "NUMERO" // Vai representar 90, 5, 10, etc.
)

// A estrutura que o Lexer vai cuspir toda hora
type Token struct {
	Type    TokenType
	Literal string // A palavra exata que estava no texto, ex: "90"
	Line    int    // Importante guardar a linha para darmos erros bons depois! (ex: "Erro na linha 2")
}
