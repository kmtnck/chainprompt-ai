
/**
 * La classe rappresenta l'insieme di endpoint per interagire con i server llm tramite il middleware di langchain
 */
import express from "express";
const router = express.Router();
import { getAnswerLLM, getAnswerLocalLLM, getAnswerOllamaLLM } from '../services/langchainservice.js';
import { writeObjectToFile, contextFolder, SYSTEMPROMPT_DFL, ENDPOINT_CHATGENERICA } from '../services/commonservices.js';
import { getFrameworkPrompts } from '../services/builderpromptservice.js';
import * as requestIp from 'request-ip';
import fs from 'fs';
import { ConfigChainPrompt } from "../interfaces/configchainprompt.js";
import { ChainPromptBaseTemplate } from "../interfaces/chainpromptbasetemplate.js";
import { DataRequest } from "../interfaces/datarequest.js";

const conversations: Record<string, any> = {};
const contexts = fs.readdirSync(contextFolder);

/*
 Funzioni handle per gestire la richiesta del prompt per un determinato contesto che sia locale come llmstudio, cloud come chatgpt o claude di antrophic tramite la apikey, oppure tramite server seamless come ollama
*/
const handleLocalRequest = async (req: any, res: any, next: any) => {

    await wrapperServerLLM(req, res, getAndSendPromptLocalLLM);
};

const handleCloudLLMRequest = async (req: any, res: any, next: any) => {

    await wrapperServerLLM(req, res, getAndSendPromptCloudLLM);
};

const handleLocalOllamaRequest = async (req: any, res: any, next: any) => {

    await wrapperServerLLM(req, res, getAndSendPromptbyOllamaLLM);
};

const wrapperServerLLM = async (req: any, res: any, wrapperSendAndPromptLLM: any) => {

    try {
        const originalUriTokens = req.originalUrl.split('/');
        const context = originalUriTokens[originalUriTokens.length - 1];

        //se e' il contesto generico si imposta il prompt di default
        const systemPrompt = (context != ENDPOINT_CHATGENERICA) ? await getFrameworkPrompts(context) : SYSTEMPROMPT_DFL; // Ottieni il prompt di sistema per il contesto
        let answer = await wrapperSendAndPromptLLM(req, res, systemPrompt, context); // Invia il prompt al client
        res.json({ answer }); // Invia la risposta al client
    } catch (err) {
        console.error('Errore durante la conversazione:', err);
        res.status(500).json({ error: `Si è verificato un errore interno del server` });
    }
}

async function getAndSendPromptCloudLLM(req: any, res: any, systemPrompt: string, contextchat: string) {
    return await callBackgetAndSendPromptbyLocalRest(req, res, systemPrompt, contextchat, getAnswerLLM);
}

async function getAndSendPromptLocalLLM(req: any, res: any, systemPrompt: string, contextchat: string) {
    return await callBackgetAndSendPromptbyLocalRest(req, res, systemPrompt, contextchat, getAnswerLocalLLM);
}

async function getAndSendPromptbyOllamaLLM(req: any, res: any, systemPrompt: string, contextchat: string) {
    return await callBackgetAndSendPromptbyLocalRest(req, res, systemPrompt, contextchat, getAnswerOllamaLLM);
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
async function callBackgetAndSendPromptbyLocalRest(req: any, res: any, systemPrompt: string, contextchat: string, callbackRequestLLM: any) {

    //XXX: vengono recuperati tutti i parametri provenienti dalla request, i parametri qui recuperati potrebbero aumentare nel tempo
    const { question, temperature, modelname, maxTokens, numCtx, keyconversation }: DataRequest = extractDataFromRequest(req, contextchat);

    //Fase di tracciamento dello storico di conversazione per uno specifico utente che ora e' identificato dal suo indirizzo ip
    // Crea una nuova conversazione per questo indirizzo IP
    const systemprompt = setQuestionHistoryConversation(keyconversation, systemPrompt, question);

    //Fase di composizione della configurazione del contesto chainprompt con i parametri necessari a processare il prompt
    const assistantResponse = await invokeLLM(temperature, modelname, maxTokens, numCtx, systemprompt, question, callbackRequestLLM);

    //Fase in cui si processa la risposta e in questo caso si accoda la risposta allo storico conversazione
    setAnswerHistoryConversation(keyconversation, assistantResponse);

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

function setAnswerHistoryConversation(keyconversation: string, assistantResponse: any) {
    conversations[keyconversation].conversationContext += `\n\nAI: ${assistantResponse}\n`;
}

function setQuestionHistoryConversation(keyconversation: string, systemPrompt: string, question: string | undefined) {
    if (!conversations[keyconversation]) {
        conversations[keyconversation] = {
            startTime: new Date(),
            conversationContext: "\nSystem: " + systemPrompt,
        };
    }
    conversations[keyconversation].conversationContext += `\n\nHuman: ${question}\n`;
    const systemprompt = conversations[keyconversation].conversationContext;
    return systemprompt;
}

/**
 * Il metodo ha lo scopo di estrapolare dalla request entrante applicativa i valori di input tra cui il prompt utente, il nome del modello, la temperatura e altre informazioni peculiari,
 * successivamente gestisce uno storico conversazione che nel tempo evolverà seguendo le best practise utilizzando langchain e gli strumenti che offre,
 * ritorna i risultati di systempromp e question parsando in modo opportuno l'inizio della conversazione con il prompt entrante.
 * In futuro prompt con all'interno variabili placeholder avranno una gestione tale da essere compilati tra piu catene di domanda e risposta
 * 
 * 
 * @param req 
 * @param systemPrompt 
 * @param context 
 * @returns 
 */
function extractDataFromRequest(req: any, context: string): DataRequest {
    console.log("Estrazione informazioni data input per la preparazione al prompt di sistema....");

    const question = '\n' + req.body.question;
    console.log("Domanda ricevuta:", question);
    const modelname = req.body.modelname;
    const temperature = req.body.temperature || 0.1;
    const ipAddress = requestIp.getClientIp(req);
    const keyconversation = ipAddress + "_" + context;
    console.log("Indirizzo ip: ", ipAddress);
    const maxTokens = req.body.maxTokens || 8032;
    const numCtx = req.body.numCtx || 8032;



    return { question, temperature, modelname, maxTokens, numCtx, keyconversation };
}

/**
 * I metodi seguenti sono un tentativo di generalizzare l'esposizione di endpoint api in base ai prompt tematici definiti in opportune folder di sistema.
 * E' un esempio di dinamismo, seguendo le best practise il tentativo è rendere tale dinamismo piu in linea con le esigenze applicative future, attualmente l'obiettivo è esporre una chatbot tematica
 */

// Genera le route dinamicamente per ogni contesto disponibile
contexts.forEach(context => {
    router.post(`/langchain/localai/prompt/${context}`, handleLocalRequest);
});

// Genera le route dinamicamente per ogni contesto disponibile
contexts.forEach(context => {
    router.post(`/langchain/cloud/prompt/${context}`, handleCloudLLMRequest);
});

contexts.forEach(context => {
    router.post(`/langchain/ollama/prompt/${context}`, handleLocalOllamaRequest);
});

//Endpoint di default per avviare una chat generica con un prompt di sistema di default
router.post(`/langchain/localai/prompt/${ENDPOINT_CHATGENERICA}`, handleLocalRequest);
router.post(`/langchain/cloud/prompt/${ENDPOINT_CHATGENERICA}`, handleCloudLLMRequest);
router.post(`/langchain/ollama/prompt/${ENDPOINT_CHATGENERICA}`, handleLocalOllamaRequest);

export default router;