import express from 'express';
import bodyParser from 'body-parser';
import https from 'https';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { setGlobalDispatcher, Agent } from 'undici';
import dotenv from "dotenv";
import api from './core/endpoint.js';
import socket from './core/apis/chainsocket.js'
dotenv.config();

//XXX: questa istruzione crea un agente dispatcher per il gestore delle richieste undici usato da node.js
//l'obiettivo e' impostare a livello globale un agente che istruisce qualsiasi fetch under the wood l'ecosistema langchain a non terminare mai la richiesta per una mancata ricezione di un header
//per lunghe richieste a un llm come ollama, puo accadere che venga generato l'errore UND_ERR_HEADERS_TIMEOUT
//per evitare questo errore , si imposta un Agente con il parametro headersTimeout a 0 , consentendo un'attesa anche molto lunga di una richiesta llm 
const agent = new Agent({
    headersTimeout: Number(process.env.HEADER_TIMEOUT_UNDICI!) // Imposta il timeout delle intestazioni a infinito
});
setGlobalDispatcher(agent);

//https://flaviocopes.com/fix-dirname-not-defined-es-module-scope/
//approccio per recuperare la directory corrente per caricare i certificati
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: express.Application = express();
//const socket = require('./core/sockets/coresocket');


const port: number = parseInt(process.env.PORT || '3000'); // Usa il valore della variabile di ambiente PORT, se definita, altrimenti usa la porta 3000
const nameAssistant: string = process.env.NAME_ASSISTANT || "Chainprompt AI";

app.use(cors());

// Parsers for POST data
app.use(bodyParser.json({ limit: '900mb' }));
app.use(bodyParser.urlencoded({ limit: '900mb', extended: false }));

const apiversion = "/api/v1";
console.log(`Versione api rest : ${apiversion}`);
app.use(apiversion, api);
console.log(`Importing api completed!`);

//integrazione https ssl
const sslOptions: https.ServerOptions = {
    key: fs.readFileSync(path.resolve(__dirname, "/usr/app/src/certs/privkey.pem")),
    cert: fs.readFileSync(path.resolve(__dirname, "/usr/app/src/certs/fullchain.pem")),
};
const server: https.Server = https.createServer(sslOptions, app); //http.createServer(app);
console.log(`HTTPS server created!`);

server.listen(port, () => console.log(`${nameAssistant} avviato sulla porta:${port}`));

const socketport: number = parseInt(process.env.SOCKET_PORT || '6000');
socket.listen(socketport, () => {
    console.log(`${nameAssistant} su Socket.IO in ascolto sulla porta ${socketport}`);
});