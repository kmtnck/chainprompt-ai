import { PromptTemplate } from "@langchain/core/prompts";
import { OpenAI } from "@langchain/openai";
import { LLMChain } from "langchain/chains";
import dotenv from "dotenv";
dotenv.config();

/**
 * Implementazione tutorial di un wrapper che prende in input un prompt che ritorna codice sorgente come output
 */
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
        apiKey: process.env.OPENAI_API_KEY,
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