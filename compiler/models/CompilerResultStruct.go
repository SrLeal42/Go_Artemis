package models

// Estrutura da resposta final que vai para o React
type CompilerResult struct {
	Success bool `json:"success"`
	Comands []Comand `json:"comands,omitempty"`
	Error string `json:"error,omitempty"` // Mensagem caso haja erro de sintaxe
}