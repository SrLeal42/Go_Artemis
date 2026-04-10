package models

// CommandNode é uma interface.
// Basicamente avisa o compilador do Go que "Qualquer Struct pode ser um comando, desde que aplique isso".
type CommandNode interface {
	CommandType() string // Vai retornar "AVANCA", "REPEAT", "IF", etc.
}
