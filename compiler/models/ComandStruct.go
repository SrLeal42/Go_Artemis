package models

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
	Condition      string        `json:"condition"`
	Negated        bool          `json:"negated"`
	Direction      string        `json:"direction"`
	InsideCommands []CommandNode `json:"commands"`
	ElseCommands   []CommandNode `json:"elseCommands,omitempty"`
}

func (c *IfCmd) CommandType() string { return "IF" }

type WhileCmd struct {
	Condition      string        `json:"condition"`
	Negated        bool          `json:"negated"`
	Direction      string        `json:"direction"`
	InsideCommands []CommandNode `json:"whileCommands"`
}

func (c *WhileCmd) CommandType() string { return "ENQUANTO" }

type MarkerCmd struct {
	Action string `json:"action"`
}

func (c *MarkerCmd) CommandType() string { return c.Action }

// Definição de Função
type FuncDefCmd struct {
	Name           string        `json:"funcName"`
	InsideCommands []CommandNode `json:"funcCommands"`
}

func (c *FuncDefCmd) CommandType() string { return "FUNCAO" }

// Chamada de Função
type FuncCallCmd struct {
	Name string `json:"callName"`
	Line int    `json:"-"`
}

func (c *FuncCallCmd) CommandType() string { return "CALL" }
