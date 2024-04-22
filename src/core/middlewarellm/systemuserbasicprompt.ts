import { PromptTemplate } from "@langchain/core/prompts";
import { OpenAI } from "@langchain/openai";
import { LLMChain } from "langchain/chains";
import dotenv from "dotenv";
import { ConfigChainPrompt } from "../interfaces/configchainprompt.js";
import { Ollama } from "@langchain/community/llms/ollama";
import { ChainPromptBaseTemplate } from "../interfaces/chainpromptbasetemplate.js";
dotenv.config();

/*
 * La seguente implementazione raccoglie metodi per interrogare modelli LLM con la libreria Langchain configurandone i parametri peculiari di ciascun modello usato processandone il prompt seguendo il pattern base:
 * systemprompt e userprompt.
 * 
 * Ha lo scopo di fornire uno standard di richiesta e ritorno risposta da un modello llm delegando all'applicazione il modo con cui il system e l'user prompt vengono costruiti.
 * La response di questi metodi generano un prompt di tipo assistant il quale puo essere o un output finale di una chatbot oppure l'input di una nuova catena di prompt.
 * 
 * Implementazioni simili potranno essere sviluppati usando template prompt diversi con relativo tier di servizi dedicati in base all'obiettivo richiesto.
 * 
 * L'obiettivo di questa implementazione è fornire accurati prompt separando in modo netto il system e l'user prompt, focalizzando la configurazione dei modelli.
 */

export const generateCloudLLMWithSystemuserBasicPrompt = async (config: ConfigChainPrompt, prompt: ChainPromptBaseTemplate) => {

    const completePrompt = new PromptTemplate({
        template: "{systemprompt}\n\n{question}",
        inputVariables: ["systemprompt", "question"],
    });

    const llmChain = new LLMChain({

        llm: new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            temperature: config.temperature,
            modelName: config.modelname || process.env.LOCAL_MODEL_NAME
        }),
        prompt: completePrompt,
    });
    const answer = await llmChain.invoke({
        systemprompt: prompt.systemprompt,
        question: prompt.question,
    });
    console.log("Risposta generata:", answer);
    return answer;

};

export const generateLocalLLMWithSystemuserBasicPrompt = async (config: ConfigChainPrompt, prompt: ChainPromptBaseTemplate) => {

    const completePrompt = new PromptTemplate({
        template: "{systemprompt}\n\n{question}",
        inputVariables: ["systemprompt", "question"],
    });

    const llmChain = new LLMChain({

        llm: new OpenAI({
            configuration: {
                baseURL: process.env.URI_LANGCHAIN_LLMSTUDIO,
            },
            maxTokens: config.maxTokens,
            temperature: config.temperature,
            modelName: config.modelname || process.env.LOCAL_MODEL_NAME
        }),
        prompt: completePrompt,
    });
    const answer = await llmChain.invoke({
        systemprompt: prompt.systemprompt,
        question: prompt.question,
    });
    console.log("Risposta generata:", answer);
    return answer;

};

export const generateOllamaLLMWithSystemuserBasicPrompt = async (config: ConfigChainPrompt, prompt: ChainPromptBaseTemplate) => {

    const completePrompt = new PromptTemplate({
        template: "{systemprompt}\n\n{question}",
        inputVariables: ["systemprompt", "question"],
    });

    const llmChain = new LLMChain({

        llm: new Ollama({
            baseUrl: process.env.URI_LANGCHAIN_OLLAMA,
            temperature: config.temperature,
            model: config.modelname || process.env.LOCAL_MODEL_NAME,
            numCtx: config.numCtx,

            //XXX: parametri da capire e sperimentare
            keepAlive: "24h",
            logitsAll: true,
        }),
        prompt: completePrompt,

    });
    const answer = await llmChain.invoke({
        systemprompt: prompt.systemprompt,
        question: prompt.question,
    });
    console.log("Risposta generata:", answer);
    return answer;

};
