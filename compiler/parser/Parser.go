package parser

import (
	// "fmt"
	"go-artemis-compiler/lexer"  // Para ler dele
	"go-artemis-compiler/models" // Onde está o ComandStruct
	"go-artemis-compiler/token"  // Para saber os tipos
	"strconv"
)

type Parser struct {
	l *lexer.Lexer

	// Assim como o Lexer precisava saber a "letra" atual, o Parser precisa saber qual é o Token atual
	curToken  token.Token
	peekToken token.Token // "Espiar": E o próximo token. Ajuda a ver o futuro ("depois do avança tem número?")

	errors []models.CompilerError // Para guardar erros como "Esperava um Número, mas veio GIRA na linha 2"
}

func New(l *lexer.Lexer) *Parser {
	p := &Parser{
		l:      l,
		errors: []models.CompilerError{},
	}

	// Lemos dois tokens para que curToken e peekToken já comecem preenchidos!
	p.nextToken()
	p.nextToken()

	return p
}

func (p *Parser) nextToken() {
	p.curToken = p.peekToken
	p.peekToken = p.l.NextToken()
}

func (p *Parser) ParseProgram() []models.CommandNode {
	program := []models.CommandNode{}

	for p.curToken.Type != token.EOF {
		cmd := p.parseCommand() // Delega toda a leitura!
		if cmd != nil {
			program = append(program, cmd)
		}
		p.nextToken()
	}
	return program
}

// O Roteador Central (A Ideia do Seu Switch!)
func (p *Parser) parseCommand() models.CommandNode {
	switch p.curToken.Type {

	case token.AVANCA, token.RECUA:
		return p.parseMoveCommand() // Função rígida: Vai exigir e capturar Número

	case token.GIRA:
		return p.parseTurnCommand() // Função rígida: Vai exigir e capturar ESQUERDA/DIREITA

	// case token.DETECTA:
	// 	return &models.DetectCmd{Action: p.curToken.Literal}

	case token.REPEAT:
		return p.parseRepeatCommand() // Chamamos a função complexa

	case token.IF:
		return p.parseIfCommand() // Chamamos a outra função complexa

	default:
		p.errors = append(p.errors, models.CompilerError{
			Line:    p.curToken.Line,
			Message: "Comando ou símbolo desconhecido encontrado: " + p.curToken.Literal,
		})
		return nil
	}
}

func (p *Parser) parseMoveCommand() models.CommandNode {
	cmd := &models.MoveCmd{Action: p.curToken.Literal}
	if p.peekToken.Type == token.NUMERO {
		p.nextToken()
		cmd.Value, _ = strconv.Atoi(p.curToken.Literal)
	} else {
		p.errors = append(p.errors, models.CompilerError{Line: p.curToken.Line, Message: "O comando '" + cmd.Action + "' exige um número de passos"})
	}
	return cmd
}

func (p *Parser) parseTurnCommand() models.CommandNode {
	cmd := &models.TurnCmd{Action: p.curToken.Literal}
	p.nextToken() // Pula para a próxima palavra (que deveria ser ESQUERDA/DIREITA)
	if p.curToken.Type != token.ESQUERDA && p.curToken.Type != token.DIREITA {
		p.errors = append(p.errors, models.CompilerError{Line: p.curToken.Line, Message: "O comando GIRA exige a direção ESQUERDA ou DIREITA"})
		return nil
	}
	cmd.Direction = p.curToken.Literal
	return cmd
}

// Lê todos os comandos recursivamente até encontrar o '}'
func (p *Parser) parseBlock() []models.CommandNode {
	block := []models.CommandNode{}

	p.nextToken() // Pula a própria chave '{' para entrarmos de fato no bloco

	// Continua lendo até achar a chave fechada '}' ou o fim do arquivo
	for p.curToken.Type != token.CBRACE && p.curToken.Type != token.EOF {
		cmd := p.parseCommand() // Chama o Roteador Mestre de novo! (Recursão)
		if cmd != nil {
			block = append(block, cmd)
		}
		p.nextToken() // Vai pro próximo comando dentro do bloco
	}

	// Verifica se o bloco foi realmente fechado
	if p.curToken.Type == token.EOF {
		p.errors = append(p.errors, models.CompilerError{
			Line:    p.curToken.Line,
			Message: "Esperava '}' para fechar o bloco, mas o código terminou antes",
		})
	}

	return block
}

func (p *Parser) parseRepeatCommand() models.CommandNode {
	cmd := &models.RepeatCmd{Times: 0, InsideCommands: []models.CommandNode{}}

	// 1. Garante e lê o Número
	if p.peekToken.Type != token.NUMERO {
		p.errors = append(p.errors, models.CompilerError{Line: p.curToken.Line, Message: "Esperava um número após o REPEAT"})
		return nil
	}
	p.nextToken() // Anda para o Token Número
	cmd.Times, _ = strconv.Atoi(p.curToken.Literal)

	// 2. Garante a Abertura de chaves '{'
	if p.peekToken.Type != token.OBRACE {
		p.errors = append(p.errors, models.CompilerError{Line: p.curToken.Line, Message: "Esperava '{' antes do bloco do REPEAT"})
		return nil
	}
	p.nextToken() // Anda para o '{'

	// 3. Manda o ajudante ler o mundo lá de dentro! Ele retorna magicamente a arvore
	cmd.InsideCommands = p.parseBlock()

	return cmd
}

func (p *Parser) parseIfCommand() models.CommandNode {
	cmd := &models.IfCmd{InsideCommands: []models.CommandNode{}}

	// 1. O Token atual é o "IF". Vamos avançar para testar a primeira palavra (Condição).
	p.nextToken()

	// Garante que é uma condição válida usando '&&'
	if p.curToken.Type != token.OBSTACULO &&
		p.curToken.Type != token.OBJETIVO &&
		p.curToken.Type != token.BORDA {
		p.errors = append(p.errors, models.CompilerError{Line: p.curToken.Line, Message: "Erro de sintaxe: IF precisa ser seguido de OBSTACULO, OBJETIVO ou BORDA"})
		return nil
	}
	cmd.Condition = p.curToken.Literal // Guarda no modelo (Ex: "OBSTACULO")

	// 2. Agora vamos ver a segunda palavra (Direção)
	p.nextToken()

	if p.curToken.Type != token.ESQUERDA && p.curToken.Type != token.DIREITA && p.curToken.Type != token.FRENTE {
		p.errors = append(p.errors, models.CompilerError{Line: p.curToken.Line, Message: "Erro de sintaxe: IF exige uma direção logo depois (ESQUERDA, DIREITA, FRENTE)"})
		return nil
	}
	cmd.Direction = p.curToken.Literal // Guarda no modelo (Ex: "ESQUERDA")

	// 3. Terminamos o texto, agora a próxima OBRIGATORIAMENTE tem que ser a chave '{' !
	if p.peekToken.Type != token.OBRACE {
		p.errors = append(p.errors, models.CompilerError{Line: p.curToken.Line, Message: "Esperava '{' para iniciar o bloco do IF"})
		return nil
	}
	p.nextToken() // Andamos o ponteiro para ficar em cima da chave '{'

	cmd.InsideCommands = p.parseBlock()

	return cmd
}

// Uma função extra pra você testar depois no Main.go se o Parse passou limpo
func (p *Parser) Errors() []models.CompilerError {
	return p.errors
}
