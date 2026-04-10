package models

// Estrutura da resposta final que vai para o React
type CompilerResult struct {
	Success bool            `json:"success"`
	Comands []CommandNode   `json:"comands,omitempty"`
	Error   []CompilerError `json:"error,omitempty"` // Mensagem caso haja erro de sintaxe
}
