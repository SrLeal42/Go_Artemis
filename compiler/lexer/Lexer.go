package lexer

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
