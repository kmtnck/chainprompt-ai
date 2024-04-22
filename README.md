# Chatbot collegato a un server LLM

Questo progetto è un'applicazione Express.js che implementa una chatbot collegata a un server LLM (Large Language Model). 
La chatbot utilizza l'API di OpenAI per generare risposte ai messaggi degli utenti, oppure un server locale come ollama e llmstudio.

L'endpoint tipico di ollama è il seguente

`http://%HOSTNAME%:11434/api/chat`

mentre per il server llmstudio è il seguente

`http://%HOSTNAME%:1234/v1/chat/completions'`

La chiave API KEY è necessaria nel caso in cui si accede ad un LLM di terze parti a pagamento come openai

## Configurazione

Assicurati di configurare correttamente le seguenti variabili d'ambiente:

```dotenv
PORT=5000
OPENAI_API_KEY='api key server ai'
SOCKET_PORT=6000
URI_LOCALAI='http://%HOSTNAME%:1234/v1/chat/completions'
#URI_LOCALAI='http://%HOSTNAME%:11434/api/chat'
LOCAL_MODEL_NAME='openchat'
NAME_ASSISTANT="Assistente Kppa"
PATH_FILESET='datasets/fileset'
```

Le porte qui definite sono interne al network docker, per modificare la porta esposta all'host e quindi alla rete esterna, è necessario modificare la configurazione sul docker compose/local.yml
Le porte di default esposte all'host sono le seguenti:

porta `5500` per gli endpoint rest
porta `6000` per collegarsi tramite socket.io
la porta `9339` è usata come accesso in debug remoto.

Il nome del modello LOCAL_MODEL_NAME incide solo e soltanto se la chatbot è collegata ad un server ollama, in questa configurazione se ne imposta il nome di default.

`NAME_ASSISTANT ` fornisce un nome alla chatbot, per ora visualizzata solo ai log di avvio
`PATH_FILESET` fornisce la folder usata per salvare sul proprio host le varie conversazioni che la chatbot esegue.

Per ora ci sono due tipi di chatbot, oltre a quella standard:

1. Assistente ai recruiter per una simulazione di un colloquio di lavoro, in base a un dataset testuale di un curriculum o simili.

2. Un docente linux che fornisce una preparazione all'esame LPIC-1 .

La temperature di default della chatbot è di `0.1` (per ora non è stata parametrizzata a configurazione)

## Usage 

Esempio di request riconosciuti dagli endpoint della chatbot:

```
{
    "question": "Come ti chiami? e cosa ti piace fare?",
    "modelname": "openchat",
    "temperature": 0.1
}
```

`question` 
Questo campo contiene la domanda che desideri porre all'assistente virtuale. Puoi scrivere qualsiasi domanda desideri ottenere una risposta da parte dell'assistente.

`modelname`
 Qui specifica il nome del modello che desideri utilizzare per generare la risposta alla tua domanda. Nel nostro caso, il valore "openchat" indica che vogliamo utilizzare un modello specifico chiamato "openchat". A seconda del sistema utilizzato, potrebbero essere disponibili diversi modelli, ognuno con caratteristiche e comportamenti diversi. Il nome del modello è valido quando la chatbot è collegata a un server ollama, altrimenti è ininfluente.

`temperature`
Questo campo rappresenta la temperatura della risposta generata dal modello. La temperatura controlla la casualità delle risposte generate. Un valore più basso produce risposte più conservative e simili alla media, mentre un valore più alto produce risposte più creative e originali. Il valore tipico per questo parametro è compreso tra 0 e 1, con 0.1 che produce risposte molto conservative e 1 che produce risposte molto creative.


# Installazione

1. Assicurati di avere Node.js installato sul tuo sistema.
2. Clona questo repository sul tuo computer.
3. Esegui `npm install` per installare le dipendenze del progetto.
4. Imposta le variabili d'ambiente nel file `.env` o nel tuo ambiente di sviluppo.

# Utilizzo

1. Avvia il server eseguendo il comando `npm start`.
2. Accedi all'applicazione tramite il tuo browser o utilizzando un client REST come Postman.
3. Invia messaggi alla chatbot e osserva le risposte generate dal server LLM.

# Containerizzazione Docker

Per effettuare la build dell'immagine Docker, esegui il comando dalla base del progetto:

`docker compose -f compose/local.yml build`

Per avviarlo in foreground, utile per il monitoraggio in sviluppo eseguire il comando

`docker compose -f compose/local.yml up`


Altrimenti usare i comandi `create` per creare il container e `start` per avviare docker normalmente.

Per analizzare i log in real-time eseguire il comando `logs -f`

Per accedere nel container docker eseguire il comando

`docker exec -it chatbot-kppa-local bash`

# Contributi
Siamo aperti ai contributi! Se desideri contribuire a questo progetto, ti preghiamo di aprire una nuova issue o inviare una pull request.


# Come è nato il progetto ChainPrompt

Il progetto è nato dalla consultazione di questo link
https://javascript.plainenglish.io/embarking-on-the-ai-adventure-introduction-to-langchain-and-node-js-7393b6364f3a

creazione del package json

```
npm init -y
```

installazione delle librerie basilari per un servizio web express

```
npm i express dotenv
npm i typescript --save-dev
```

si installano le dipendenze in ambiente di sviluppo
```
npm i -D typescript @types/express @types/node
```

```
npm install ts-node
npm install nodemon
```


inizializzazione dell'ambiente typescript

```
npx tsc --init
```

impostazione del tsconfig nel seguente modo

```
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "moduleResolution": "NodeNext",
    "types": ["node"],
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"],
  "ts-node": {
    "transpileOnly": true,
    "files": true,
    "esm": true,
    "experimentalSpecifierResolution": "node"
  }
}
```

il package.json deve essere impostato piu o meno cosi, sopratutto sulla definizione degli script di avvio

```
{
  "name": "chainprompt-ai",
  "version": "1.0.0",
  "description": "",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node --no-warnings=ExperimentalWarning --loader ts-node/esm  src/server.ts ./tsconfig.json",
    "start-dev": "nodemon --exec node --no-warnings=ExperimentalWarning --loader ts-node/esm  src/server.ts ./tsconfig.json",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.11.5",
    "typescript": "^5.3.3"
  },
  "dependencies": {
    "dotenv": "^16.3.2",
    "express": "^4.18.2",
    "nodemon": "^3.0.3",
    "ts-node": "^10.9.2"
  }
}
```

creare il file server.ts

```
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app: express.Express = express();
const port: string | number = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
```

un avvio del server dovrebbe gia permettere un ascolto sulla porta 3000

passaggi successivi:

fornire la configurazione docker compose

il Dockerfile puo avere un template simile al seguente

```
FROM node:20.11.0-alpine3.18

# Upgrade packages
RUN apk --no-cache --update --available upgrade
RUN apk --no-cache add --virtual builds-deps build-base python3
RUN apk add --no-cache make gcc g++
# Changing working dir
WORKDIR /usr/app
ADD package*.json ./
RUN npm install
# Copy app to working dir
COPY . .
```

il docker compose simile al seguente

```
version: "3"
services:
  api:
    build:
      dockerfile: Dockerfile.dev
      context: ./
    volumes:
      - ./:/usr/app
      - /usr/app/node_modules
    env_file:
      - ./.env
    ports:
      - "3000:3000"
    entrypoint: ./entry-point.sh
```

creare un entry-point.ts per la gestione dell'ambiente di sviluppo e produzione

```
#!/bin/sh
if [ $NODE_ENV == "development" ] 
then
    echo "development mode running";
    npm install
    npm run start-dev
else
    npm run start
fi
```

dare i permessi di esecuzione

```
chmod +x entry-point.sh
```


creare un file .env
```
NODE_ENV=development
```


dopo aver consolidato la parte server, tenendo conto degli approcci di sviluppo su altri progetti nel cloud kppa
installare il framework langchain

npm install @langchain/community @langchain/core @langchain/openai langchain

creare il file generateCodeChain.ts 

e creare le seguenti interfacce

```
export interface GenerateFunctionWithLanguage {
  language: string;
  task: string;
}
export const generateFunctionWithLanguage = async (params: GenerateFunctionWithLanguage) => {};
```

definire una interfaccia per generare prompttemplate

```
import { PromptTemplate } from "@langchain/core/prompts";

export interface GenerateFunctionWithLanguage {
  language: string;
  task: string;
}
export const generateFunctionWithLanguage = async (params: GenerateFunctionWithLanguage) => {
  const codePrompt = new PromptTemplate({
    template: "Write a very short {language} function that will {task}",
    inputVariables: ["language", "task"],
  });
};
```

implementare mano a mano il layer service e business tenendo conto del codice seguente per creare un wrapper llm

```
import { PromptTemplate } from "@langchain/core/prompts";
import { OpenAI } from "@langchain/openai";

export interface GenerateFunctionWithLanguage {
  language: string;
  task: string;
}
export const generateFunctionWithLanguage = async (params: GenerateFunctionWithLanguage) => {
  const codePrompt = new PromptTemplate({
    template: "Write a very short {language} function that will {task}",
    inputVariables: ["language", "task"],
  });

  const openAi = new OpenAI({
    openAIApiKey: process.env.OPENAI_KEY,
  });
};
```

tenere in considerazione vari approcci per chiamare un llm

creare una chain llm

```
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import { OpenAI } from "@langchain/openai";

export interface GenerateFunctionWithLanguage {
  language: string;
  task: string;
}
export const generateFunctionWithLanguage = async (params: GenerateFunctionWithLanguage) => {
  const codePrompt = new PromptTemplate({
    template: "Write a very short {language} function that will {task}",
    inputVariables: ["language", "task"],
  });

  const openAi = new OpenAI({
    openAIApiKey: process.env.OPENAI_KEY,
  });

  const llm = new LLMChain({
    llm: openAi,
    prompt: codePrompt,
    outputKey: "code",
  });

  return llm.call({
    language: params.language,
    task: params.task,
  });
};
```

creare un endpoint rest per esporre la chiamata all'esterno


```
import express from "express";
import dotenv from "dotenv";
import { generateFunctionWithLanguage } from "./generateCodeChain.js";

dotenv.config();

const app: express.Express = express();
const port: string | number = process.env.PORT || 3000;
app.use(express.json());

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

app.post("/generate-code", async (req, res, next) => {
  const codeGenerated = await generateFunctionWithLanguage(req.body);

  res.status(200).send({
    code: codeGenerated.code,
  });
});
```

testare su postman!


Sono stati integrate anche le seguenti librerie tramite npm install

```
axios
socket.io in futuro lo sara
request-ip
-D @types/request-ip
cors
-D @types/cors
http
https
fs
path
body-parser
```



