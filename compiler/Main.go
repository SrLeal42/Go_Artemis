package main

import (
	"encoding/json"
	"fmt"
	"go-artemis-compiler/lexer"
	"go-artemis-compiler/models"
	"go-artemis-compiler/parser"
	"syscall/js" // <-- Import importantíssimo para integrar com o Front-end
)

func main() {
	// 1. Criamos um canal (channel) que nunca vai receber nenhum valor.
	// Isso impede que a função main() acabe e libere a memória do WebAssembly.
	c := make(chan struct{})
	// 2. Registramos uma nova função JavaScript chamada "artemisCompile"
	// que irá apontar para a nossa função compileWrapper em Go.
	// O seu React chamará ela usando: map ou window.artemisCompile("codigo...")
	js.Global().Set("artemisCompile", js.FuncOf(compileWrapper))
	fmt.Println("🚀 Compilador Artemis GO-WASM carregado e aguardando no navegador!")

	// 3. Trava a execução indefinidamente
	<-c
}

// Wrapper obrigatório: essa função traduz os tipos do JavaScript (js.Value) para Go
func compileWrapper(this js.Value, args []js.Value) any {
	// Verifica se o React enviou algum argumento (o código da linguagem)
	if len(args) < 1 {
		return "Erro interno WASM: Nenhum código fornecido."
	}
	// Recupera o script digitado e transforma num tipo string primitivo do Go
	script := args[0].String()

	// Roda o seu compilador maravilhoso de forma isolada e limpa
	resultadoJson := Compile(script)
	// Devolvemos o JSON para o Front-end
	return resultadoJson
}

func Compile(script string) string {

	compileLexer := lexer.New(script)

	// for {
	// 	t := compileLexer.NextToken()
	// 	fmt.Printf("Token gerado: %+v\n", t)
	// 	if t.Type == token.EOF {
	// 		break
	// 	}
	// }

	compileParser := parser.New(compileLexer)
	compileComands := compileParser.ParseProgram()
	compileParser.ValidateFunctions(compileComands)
	compileErrors := compileParser.Errors()

	resultado := models.CompilerResult{
		Success: len(compileErrors) == 0,
		Comands: compileComands,
		Error:   compileErrors,
	}

	// resultado := models.CompilerResult{
	// 	Success: true,
	// 	Comands: []models.CommandNode{},
	// }

	jsonBytes, _ := json.MarshalIndent(resultado, "", "  ") // MarshalIndent deixa o JSON bonito e legível!
	return string(jsonBytes)
}
