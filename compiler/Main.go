package main

import (
	"encoding/json"
	"fmt"
	"go-artemis-compiler/lexer"
	"go-artemis-compiler/models"
	"go-artemis-compiler/parser"
	// "go-artemis-compiler/token"
)

func main() {

	meuScript := "AVANCA 1\nREPEAT 3 { RECUA 1 }\nIF OBSTACULO ESQUERDA { GIRA DIREITA }"

	resultadoJson := Compile(meuScript)
	fmt.Println("Resultado do Compilador:", resultadoJson)
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
