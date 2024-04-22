import express from 'express';
import bodyParser from 'body-parser';
import https from 'https';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
//https://flaviocopes.com/fix-dirname-not-defined-es-module-scope/
//approccio per recuperare la directory corrente per caricare i certificati
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
import api from './core/endpoint.js';
//const socket = require('./core/sockets/coresocket');
import dotenv from "dotenv";
dotenv.config();
const port = parseInt(process.env.PORT || '3000'); // Usa il valore della variabile di ambiente PORT, se definita, altrimenti usa la porta 3000
const nameAssistant = process.env.NAME_ASSISTANT || "Chainprompt AI";
app.use(cors());
// Parsers for POST data
app.use(bodyParser.json({ limit: '900mb' }));
app.use(bodyParser.urlencoded({ limit: '900mb', extended: false }));
const apiversion = "/api/v1";
console.log(`Versione api rest : ${apiversion}`);
app.use(apiversion, api);
console.log(`Importing api completed!`);
//integrazione https ssl
const sslOptions = {
    key: fs.readFileSync(path.resolve(__dirname, "/usr/app/src/certs/privkey.pem")),
    cert: fs.readFileSync(path.resolve(__dirname, "/usr/app/src/certs/fullchain.pem")),
};
const server = https.createServer(sslOptions, app); //http.createServer(app);
console.log(`HTTPS server created!`);
server.listen(port, () => console.log(`${nameAssistant} avviato sulla porta:${port}`));
/*const socketport: number = parseInt(process.env.SOCKET_PORT || '6000');
socket.listen(socketport, () => {
    console.log(`${nameAssistant} su Socket.IO in ascolto sulla porta ${socketport}`);
});*/ 
