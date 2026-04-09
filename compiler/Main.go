package main

import (
	"encoding/json"
	"fmt"
	"go-artemis-compiler/models"
)

func main() {
	fmt.Println("TESTESsss")

	resultadoJson := Compile("avanca 3")
	fmt.Println("Resultado do Compilador:", resultadoJson)
}

func Compile(script string) string {

	resultado := models.CompilerResult{
		Success: true,
		Comands: []models.Comand{
			{Action: "AVANCA", Value: 3},
		},
	}

	jsonBytes, _ := json.Marshal(resultado)
	return string(jsonBytes)
}
