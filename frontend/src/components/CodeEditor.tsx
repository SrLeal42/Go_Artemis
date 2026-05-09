import { useEffect, useRef } from 'react';

import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { basicSetup } from 'codemirror';
import { linter, type Diagnostic } from '@codemirror/lint';
// import { oneDark } from '@codemirror/theme-one-dark';

import { artemisParser } from '../editor/ArtemisParser';
import { artemisTheme, artemisHighlight } from '../editor/ArtemisTheme';

interface CodeEditorProps {
    initialCode: string;
    onCodeChange: (code: string) => void;
    isWasmReady?: boolean;
}

// O linter chama o compilador WASM e converte os erros para Diagnostics
const compilerLinter = linter((view) => {
    const code = view.state.doc.toString();

    if (!window.artemisCompile) return [];

    const result = JSON.parse(window.artemisCompile(code));
    if (result.success) return [];

    return (result.error ?? []).map((err: { line: number; message: string }) => {
        const line = view.state.doc.line(err.line);
        return {
            from: line.from,
            to: line.to,
            severity: "error",
            message: err.message,
        } as Diagnostic;
    });
});

export function CodeEditor({ initialCode, onCodeChange, isWasmReady }: CodeEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);

    useEffect(() => {
        if (!editorRef.current) return;

        const state = EditorState.create({
            doc: initialCode,
            extensions: [
                basicSetup,
                artemisParser,
                artemisTheme,
                artemisHighlight, 
                compilerLinter,
                // Listener que avisa o React toda vez que o texto muda
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        onCodeChange(update.state.doc.toString());
                    }
                }),
            ],
        });

        const view = new EditorView({
            state,
            parent: editorRef.current,
        });

        viewRef.current = view;

        return () => {
            view.destroy();
        };
    }, []); // Roda 1 vez — o CodeMirror gerencia o DOM internamente

    // Dispara quando o WASM estiver pronto para fazer o re-parser das keywords do editor     
    useEffect(() => {
        if (isWasmReady && viewRef.current) {
            const view = viewRef.current;
            // Dispatch uma transação "vazia" que troca o doc por ele mesmo
            // Isso força o re-parse completo do conteúdo
            const doc = view.state.doc.toString();
            view.dispatch({
                changes: { from: 0, to: view.state.doc.length, insert: doc }
            });
        }
    }, [isWasmReady]);

    return <div ref={editorRef} className="code-editor" />;
}

export default CodeEditor;
