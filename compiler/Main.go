package main

import (
	"encoding/json"
	"fmt"
	"go-artemis-compiler/models"
)



func main() {
    fmt.Println("TESTESsss")
    
    // Vamos testar a função Compile para ver se o JSON sai direitinho:
    resultadoJson := Compile("avanca 3")
    fmt.Println("Resultado do Compilador:", resultadoJson)
}




func Compile(script string) string {
    // 1. Analisador Léxico (Scanner): Quebrar o 'script' em palavras/tokens
    // 2. Analisador Sintático (Parser): Validar se as palavras formam comandos válidos
    
    // Simulação de um resultado de sucesso para "Avança 3":
    resultado := models.CompilerResult{
        Success: true,
        Comands: []models.Comand{
            {Action: "AVANCA", Value: 3},
        },
    }

    // Se houvesse erro, seria:
    // resultado := ResultadoCompilacao{ Sucesso: false, Erro: "Comando inválido na linha 1" }

    // Converte a struct Go para uma String JSON
    jsonBytes, _ := json.Marshal(resultado)
    return string(jsonBytes)
}
