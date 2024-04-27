
/**
 * La classe rappresenta l'insieme di endpoint per interagire con i server llm tramite il middleware di langchain
 */
import express from "express";
const router = express.Router();
import { contextFolder, ENDPOINT_CHATGENERICA } from '../services/commonservices.js';
import { getAndSendPromptCloudLLM, getAndSendPromptLocalLLM, getAndSendPromptbyOllamaLLM, wrapperServerLLM } from '../controllers/businesscontroller.js'
import * as requestIp from 'request-ip';
import fs from 'fs';
import { DataRequest } from "../interfaces/datarequest.js";
const contexts = fs.readdirSync(contextFolder);

/*
 Funzioni handle per gestire la richiesta del prompt per un determinato contesto che sia locale come llmstudio, cloud come chatgpt o claude di antrophic tramite la apikey, oppure tramite server seamless come ollama
*/
const handleLocalRequest = async (req: any, res: any, next: any) => {
    await handleRequest(req, res, next, getAndSendPromptLocalLLM);
};

const handleCloudLLMRequest = async (req: any, res: any, next: any) => {
    await handleRequest(req, res, next, getAndSendPromptCloudLLM);
};

const handleLocalOllamaRequest = async (req: any, res: any, next: any) => {
    await handleRequest(req, res, next, getAndSendPromptbyOllamaLLM);
};

const handleRequest = async (req: any, res: any, next: any, getSendPromptCallback: any) => {
    try {
        const originalUriTokens = req.originalUrl.split('/');
        const contextchat = originalUriTokens[originalUriTokens.length - 1];
        const inputData: DataRequest = extractDataFromRequest(req, contextchat);

        let answer = await wrapperServerLLM(inputData, contextchat, getSendPromptCallback);
        res.json({ answer });
    } catch (err) {
        console.error('Errore durante la conversazione:', err);
        res.status(500).json({ error: `Si è verificato un errore interno del server` });
    }
};

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
router.post(`/langchain/localai/prompt/${ENDPOINT_CHATGENERICA}`, handleLocalRequest);

// Genera le route dinamicamente per ogni contesto disponibile
contexts.forEach(context => {
    router.post(`/langchain/cloud/prompt/${context}`, handleCloudLLMRequest);
});
router.post(`/langchain/cloud/prompt/${ENDPOINT_CHATGENERICA}`, handleCloudLLMRequest);

contexts.forEach(context => {
    router.post(`/langchain/ollama/prompt/${context}`, handleLocalOllamaRequest);
});
router.post(`/langchain/ollama/prompt/${ENDPOINT_CHATGENERICA}`, handleLocalOllamaRequest);

export default router;