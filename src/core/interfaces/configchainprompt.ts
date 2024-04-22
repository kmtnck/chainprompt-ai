/**
 * Interfaccia per configurare i vari modelli llm supportati e usati dall'applicazione chainprompt.
 * I parametri potrebbero aumentare a seconda l'evoluzione applicativa.
 */
export interface ConfigChainPrompt {
    temperature?: number;
    modelname?: string;
    maxTokens?: number;
    numCtx?: number;
}