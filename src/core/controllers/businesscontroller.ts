
/**
 * La classe rappresenta l'insieme di endpoint per interagire con i server llm tramite il middleware di langchain
 */
import { getAnswerLLM, getAnswerLocalLLM, getAnswerOllamaLLM, } from '../services/langchainservice.js';
import { writeObjectToFile, SYSTEMPROMPT_DFL, ENDPOINT_CHATGENERICA } from '../services/commonservices.js';
import { getFrameworkPrompts, } from '../services/builderpromptservice.js';
import { ConfigChainPrompt } from "../interfaces/configchainprompt.js";
import { ChainPromptBaseTemplate } from "../interfaces/chainpromptbasetemplate.js";
import { DataRequest } from "../interfaces/datarequest.js";

const conversations: Record<string, any> = {};

const wrapperServerLLM = async (inputData: DataRequest, context: string, wrapperSendAndPromptLLM: any) => {

    try {
        //se e' il contesto generico si imposta il prompt di default
        const systemPrompt = (context != ENDPOINT_CHATGENERICA) ? await getFrameworkPrompts(context) : SYSTEMPROMPT_DFL; // Ottieni il prompt di sistema per il contesto
        let answer = await wrapperSendAndPromptLLM(inputData, systemPrompt, context); // Invia il prompt al client
        return answer;
    } catch (err) {
        console.error('Errore durante la conversazione:', err);
        throw err;
    }
}

async function getAndSendPromptCloudLLM(inputData: DataRequest, systemPrompt: string, contextchat: string) {
    return await callBackgetAndSendPromptbyLocalRest(inputData, systemPrompt, contextchat, getAnswerLLM);
}

async function getAndSendPromptLocalLLM(inputData: DataRequest, systemPrompt: string, contextchat: string) {
    return await callBackgetAndSendPromptbyLocalRest(inputData, systemPrompt, contextchat, getAnswerLocalLLM);
}

async function getAndSendPromptbyOllamaLLM(inputData: DataRequest, systemPrompt: string, contextchat: string) {
    return await callBackgetAndSendPromptbyLocalRest(inputData, systemPrompt, contextchat, getAnswerOllamaLLM);
}

/**
 * Il metodo ha lo scopo di gestire i valori di input entranti dalla richiesta,
 * istanziare la configurazione del modello llm in ConfigChainPrompt, ciascun parametro è peculiare in base al modello llm scelto per interrogare,
 * impostare il template del prompt in questo caso il prompt è formato da un systemprompt e un userprompt che sono gia preimpostati in modo opportuno a monte.
 * In futuro potranno esserci prompt template con logiche diverse per assolvere scopi piu dinamici e granulati a seconda l'esigenza applicativa.
 * Viene interrogato l'llm in base al tipo di accesso (locale, cloud, ollama server, ecc...)
 * La risposta viene tracciata nello storico di conversazione e salvato su un file di testo (in futuro ci saranno tecniche piu avanzate)
 * La risposta viene ritornata al chiamante.
 * 
 * @param req 
 * @param res 
 * @param systemPrompt 
 * @param contextchat 
 * @param callbackRequestLLM 
 * @returns 
 */
async function callBackgetAndSendPromptbyLocalRest(inputData: DataRequest, systemPrompt: string, contextchat: string, callbackRequestLLM: any) {

    //XXX: vengono recuperati tutti i parametri provenienti dalla request, i parametri qui recuperati potrebbero aumentare nel tempo
    const { question, temperature, modelname, maxTokens, numCtx, keyconversation }: DataRequest = inputData;//extractDataFromRequest(req, contextchat);

    //Fase di tracciamento dello storico di conversazione per uno specifico utente che ora e' identificato dal suo indirizzo ip
    // Crea una nuova conversazione per questo indirizzo IP
    const systemprompt = setQuestionHistoryConversation(keyconversation, systemPrompt, question);

    //Fase di composizione della configurazione del contesto chainprompt con i parametri necessari a processare il prompt
    const assistantResponse = await invokeLLM(temperature, modelname, maxTokens, numCtx, systemprompt, question, callbackRequestLLM);

    //Fase in cui si processa la risposta e in questo caso si accoda la risposta allo storico conversazione
    setAnswerHistoryConversation(keyconversation, assistantResponse, question);

    //Fase applicativa di salvataggio della conversazione corrente su un file system.
    await writeObjectToFile(conversations, contextchat);

    //Fase applicative che o reiterano le fasi precedenti.

    //XXX: ciascuna fase dopo il recupero della risposta è a discrezione delle scelte progettuali applicative in cui scegliere lo strumento migliore per manipolare la risposta.
    //Questi aspetti saranno cruciali e potrebbero evolversi in componenti che potrebbero essere di dominio ad altre componenti.

    //la risposta viene ritorna as is dopo che e' stata tracciata nello storico al chiamante, il quale si aspetta un risultato atteso che non e' per forza una response grezza, ma il risultato di una raffinazione applicativa in base alla response ottenuta.
    //XXX: questo aspetto e' cruciale per ridirigere e modellare i flussi applicativi tramite prompts in entrata e in uscita.
    return assistantResponse;
}

async function invokeLLM(temperature: number | undefined, modelname: string | undefined, maxTokens: number | undefined, numCtx: number | undefined, systemprompt: any, question: string | undefined, callbackRequestLLM: any) {
    let config: ConfigChainPrompt = {
        temperature: temperature, modelname, maxTokens, numCtx
    };
    let prompt: ChainPromptBaseTemplate = {
        systemprompt, question
    };
    //Fase in cui avviene la chiamata al modello llm tramite invoke langchain
    const assistantResponse = await callbackRequestLLM(config, prompt);
    return assistantResponse;
}

function setAnswerHistoryConversation(keyconversation: string, assistantResponse: any, question: any) {
    conversations[keyconversation].conversationContext += `<|user|>\n${question}<|end|>\n<|assistant|>${assistantResponse}<|end|>\n`;
}

function setQuestionHistoryConversation(keyconversation: string, systemPrompt: string, question: string | undefined) {
    if (!conversations[keyconversation]) {
        conversations[keyconversation] = {
            startTime: new Date(),
            conversationContext: `\n<|system|>\n ${systemPrompt}<|end|>\n`,
        };
    }
    const systemprompt = conversations[keyconversation].conversationContext;
    return systemprompt;
}


export {
    getAndSendPromptCloudLLM, getAndSendPromptLocalLLM, getAndSendPromptbyOllamaLLM, wrapperServerLLM,
};