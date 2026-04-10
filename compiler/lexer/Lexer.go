package lexer

import "go-artemis-compiler/token"

// O Lexer guarda o estado atual de onde estamos lendo na string "input"
type Lexer struct {
	input        string
	position     int  // Posição atual do caractere que estamos lendo
	readPosition int  // Posição do próximo caractere
	ch           byte // O caractere que estamos lendo na mão agorinha
	line         int  // Em qual linha do código estamos
}

// Cria um novo Lexer para um script específico
func New(input string) *Lexer {
	l := &Lexer{input: input, line: 1}
	l.readChar() // Já carrega o primeiro caractere pra começar
	return l
}

// readChar avança nosso ponteiro um caractere para frente
func (l *Lexer) readChar() {
	if l.readPosition >= len(l.input) {
		l.ch = 0 // Nós usamos '0' (NUL byte) para simbolizar que a string acabou
	} else {
		l.ch = l.input[l.readPosition]
	}
	l.position = l.readPosition
	l.readPosition += 1
}

// NextToken examina o caractere atual e retorna o Token correspondente
func (l *Lexer) NextToken() token.Token {
	var tok token.Token

	l.skipWhitespace()

	switch l.ch {
	case '{':
		tok = token.Token{Type: token.OBRACE, Literal: string(l.ch), Line: l.line}
	case '}':
		tok = token.Token{Type: token.CBRACE, Literal: string(l.ch), Line: l.line}
	case 0:
		tok = token.Token{Type: token.EOF, Literal: "", Line: l.line}
	default:
		// Se for uma letra, lê a palavra inteira ("AVANCA", "ESQUERDA")
		if isLetter(l.ch) {
			tok.Line = l.line
			tok.Literal = l.readIdentifier()
			tok.Type = token.LookupIdent(tok.Literal) // Descobre se é comando válido, direção ou ilegal
			return tok                                // Retornamos cedo aqui, pois o readIdentifier já avançou o ponteiro
		} else if isDigit(l.ch) {
			// Se for número, lê o número todo ("90")
			tok.Line = l.line
			tok.Literal = l.readNumber()
			tok.Type = token.NUMERO
			return tok
		} else {
			// Se for qualquer outra coisa (ex: um símbolo aleatório '!'), é Ilegal
			tok = token.Token{Type: token.ILLEGAL, Literal: string(l.ch), Line: l.line}
		}
	}

	l.readChar() // Avança para o próximo caractere para a próxima vez que NextToken for chamada
	return tok
}

// Pula todos os espaços vazios. Se achar uma quebra de linha, aumenta e registra a contagem!
func (l *Lexer) skipWhitespace() {
	for l.ch == ' ' || l.ch == '\t' || l.ch == '\n' || l.ch == '\r' {
		if l.ch == '\n' {
			l.line++
		}
		l.readChar()
	}
}

// Lê caracteres até encontrar um espaço (ex: vai lendo 'A', 'V', 'A'... até formar "AVANCA")
func (l *Lexer) readIdentifier() string {
	position := l.position
	for isLetter(l.ch) {
		l.readChar()
	}
	return l.input[position:l.position]
}

// Mesma ideia, mas agrupa os números (ex: '9' e '0' viram "90")
func (l *Lexer) readNumber() string {
	position := l.position
	for isDigit(l.ch) {
		l.readChar()
	}
	return l.input[position:l.position]
}

// Verifica se a letra faz parte do nosso alfabeto válido de nomes
func isLetter(ch byte) bool {
	return 'a' <= ch && ch <= 'z' || 'A' <= ch && ch <= 'Z' || ch == '_'
}

// Verifica se é um número
func isDigit(ch byte) bool {
	return '0' <= ch && ch <= '9'
}
