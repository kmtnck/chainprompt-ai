// Implementazione delle rotte endpoint principali.
// In modo speculare, le stesse chiamate sono definite nel protocollo socket.io.
import express from "express";
import * as requestIp from 'request-ip';
const router = express.Router();
import { writeObjectToFile, contextFolder } from '../services/commonservices.js';
import { getFrameworkPrompts } from '../services/builderpromptservice.js';
import { requestLLM, requestLocalLLM } from '../services/requestllmservice.js';
import fs from 'fs';
// Dizionario che mappa gli indirizzi IP alle conversazioni
const conversations = {};
const contexts = fs.readdirSync(contextFolder);
// Funzione per gestire la richiesta del prompt per un determinato contesto
const handleROACRequest = async (req, res, next) => {
    try {
        const originalUriTokens = req.originalUrl.split('/');
        const context = originalUriTokens[originalUriTokens.length - 1];
        const systemPrompt = await getFrameworkPrompts(context); // Ottieni il prompt di sistema per il contesto
        await getAndSendPromptbyRest(req, res, systemPrompt, context); // Invia il prompt al client
    }
    catch (err) {
        console.error('Errore durante la conversazione:', err);
        res.status(500).json({ error: `Si è verificato un errore interno del server` });
    }
};
// Funzione per gestire la richiesta del prompt per un determinato contesto
const handleROACLocalRequest = async (req, res, next) => {
    try {
        const originalUriTokens = req.originalUrl.split('/');
        const context = originalUriTokens[originalUriTokens.length - 1];
        const systemPrompt = await getFrameworkPrompts(context); // Ottieni il prompt di sistema per il contesto
        await getAndSendPromptbyLocalRest(req, res, systemPrompt, context); // Invia il prompt al client
    }
    catch (err) {
        console.error('Errore durante la conversazione:', err);
        res.status(500).json({ error: `Si è verificato un errore interno del server` });
    }
};
/**
 * Gestisce la richiesta e il systemprompt della chat tematica per interrogare llm
 * @param {*} req
 * @param {*} res
 * @param {*} systemPrompt
 * @param {*} contextchat
 */
async function getAndSendPromptbyRest(req, res, systemPrompt, contextchat) {
    await callBackgetAndSendPromptbyLocalRest(req, res, systemPrompt, contextchat, requestLLM);
}
async function getAndSendPromptbyLocalRest(req, res, systemPrompt, contextchat) {
    await callBackgetAndSendPromptbyLocalRest(req, res, systemPrompt, contextchat, requestLocalLLM);
}
async function callBackgetAndSendPromptbyLocalRest(req, res, systemPrompt, contextchat, callbackRequestLLM) {
    const { systemprompt, question, temperature, modelname, keyconversation } = buildAndTrackPromptRest(req, systemPrompt, contextchat);
    const assistantResponse = await callbackRequestLLM(req, res, systemprompt, question, temperature || 0.1, modelname);
    conversations[keyconversation].conversationContext += `D: ${assistantResponse}\n`;
    await writeObjectToFile(conversations, contextchat);
}
/**
 * Funzione che estrae gli input dalla request e traccia lo storico della conversazione dell'utente
 * @param {*} req
 * @param {*} systemPrompt
 * @returns
 */
function buildAndTrackPromptRest(req, systemPrompt, context) {
    console.log("Estrazione informazioni data input per la preparazione al prompt di sistema....");
    const question = '\n' + req.body.question;
    const modelname = req.body.modelname;
    const temperature = req.body.temperature;
    const ipAddress = requestIp.getClientIp(req);
    const keyconversation = ipAddress + "_" + context;
    // Crea una nuova conversazione per questo indirizzo IP
    if (!conversations[keyconversation]) {
        conversations[keyconversation] = {
            startTime: new Date(),
            conversationContext: systemPrompt,
        };
    }
    conversations[keyconversation].conversationContext += `\nU: ${question}\n`;
    console.log("Indirizzo ip: ", ipAddress);
    console.log("Domanda ricevuta:", question);
    const systemprompt = conversations[keyconversation].conversationContext;
    return { systemprompt, question, temperature, modelname, keyconversation };
}
// Genera le route dinamicamente per ogni contesto disponibile
contexts.forEach(context => {
    router.post(`/localai/prompt/${context}`, handleROACLocalRequest);
});
// Genera le route dinamicamente per ogni contesto disponibile
contexts.forEach(context => {
    router.post(`/prompt/${context}`, handleROACRequest);
});
console.log(`Api delle chatbot dinamiche caricati con successo!`);
export default router;
