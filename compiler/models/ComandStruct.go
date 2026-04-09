package models

// Estrutura que representa um único comando validado
type Comand struct {
	Action string `json:"action"`          			// ex: "AVANCA", "GIRA", "DETECTA"
	Value int `json:"value,omitempty"`   		// ex: 5 (para passos)
	Diretion string `json:"direction,omitempty"` 	// ex: "ESQUERDA", "DIREITA"
}