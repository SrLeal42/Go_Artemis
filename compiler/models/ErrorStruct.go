package models

// Agora todo erro tem linha e mensagem separados
type CompilerError struct {
	Line    int    `json:"line"`
	Message string `json:"message"`
}
