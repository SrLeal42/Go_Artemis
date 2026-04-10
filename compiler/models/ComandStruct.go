package models

// type Comand struct {
// 	Action   string `json:"action"`              // ex: "AVANCA", "GIRA", "DETECTA"
// 	Value    int    `json:"value,omitempty"`     // ex: 5 (para passos)
// 	Diretion string `json:"direction,omitempty"` // ex: "ESQUERDA", "DIREITA"
// }

// type SimpleCmd struct {
// 	Action string `json:"action"` // AVANCA
// 	Value  int    `json:"value"`  // 5
// }

// func (c *SimpleCmd) CommandType() string { return c.Action }

// Família 1: Movimentos (Exigem número)
type MoveCmd struct {
	Action string `json:"action"`
	Value  int    `json:"value"`
}

func (c *MoveCmd) CommandType() string { return c.Action }

// Família 2: Giros (Exigem uma Direção)
type TurnCmd struct {
	Action    string `json:"action"`
	Direction string `json:"direction"` // Aqui vamos guardar "ESQUERDA" ou "DIREITA"
}

func (c *TurnCmd) CommandType() string { return c.Action }

// Família 3: Sensores (Não exigem parâmetros!)
type DetectCmd struct {
	Action string `json:"action"`
}

func (c *DetectCmd) CommandType() string { return c.Action }

type RepeatCmd struct {
	Times          int           `json:"times"`
	InsideCommands []CommandNode `json:"commands"` // O repeat GUARDA uma lista de comandos inteira dentro de si!
}

func (c *RepeatCmd) CommandType() string { return "REPEAT" }

type IfCmd struct {
	Condition      string        `json:"condition"` // Ex: "OBSTACULO" ou "OBJETIVO"
	Direction      string        `json:"direction"` // Ex: "ESQUERDA", "DIREITA"
	InsideCommands []CommandNode `json:"commands"`
}

func (c *IfCmd) CommandType() string { return "IF" }
