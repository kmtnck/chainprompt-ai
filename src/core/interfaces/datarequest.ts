/**
 * L'interfaccia rappresenta i valori che sono recuperati dalla request di un chiamante
 * Rappresenta il json inviato dal chiamante per interrogare il chainprompt ai
 * 
 * i parametri potrebbero evolvere
 */
export interface DataRequest {
    question?: string;
    modelname?: string;
    temperature?: number;
    maxTokens?: number;
    numCtx?: number;
    keyconversation: string;
}