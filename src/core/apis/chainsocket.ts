import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { SYSTEMPROMPT_DFL, contextFolder } from '../services/commonservices.js';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const conversations: Record<string, any> = {};
const contexts = fs.readdirSync(contextFolder);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Creazione del server HTTP
//const server = createServer();
//integrazione https ssl
const sslOptions: https.ServerOptions = {
    key: fs.readFileSync(path.resolve(__dirname, "/usr/app/src/certs/privkey.pem")),
    cert: fs.readFileSync(path.resolve(__dirname, "/usr/app/src/certs/fullchain.pem")),
};
const server: https.Server = https.createServer(sslOptions); //http.createServer(app);

const io = new Server(server);

io.on('connection', (socket: Socket) => {
    const ipAddress = socket.handshake.address;

    console.log(`Client connesso: ${socket.id} ${ipAddress}`);

    // Evento di disconnessione dei client
    socket.on('disconnect', () => {
        console.log(`Client disconnesso: ${socket.id}`);
    });


});

export default server;