import dotenv from "dotenv";
import { ConfigChainPrompt } from "../interfaces/configchainprompt.js";
import { generateCloudLLMWithSystemuserBasicPrompt, generateLocalLLMWithSystemuserBasicPrompt, generateOllamaLLMWithSystemuserBasicPrompt } from "../middlewarellm/systemuserbasicprompt.js";
import { ChainPromptBaseTemplate } from "../interfaces/chainpromptbasetemplate.js";
dotenv.config();


const getAnswerLLM = async (config: ConfigChainPrompt, prompt: ChainPromptBaseTemplate) => {
    return await generateCloudLLMWithSystemuserBasicPrompt(config, prompt);
}

const getAnswerLocalLLM = async (config: ConfigChainPrompt, prompt: ChainPromptBaseTemplate) => {
    return await generateLocalLLMWithSystemuserBasicPrompt(config, prompt);
}

const getAnswerOllamaLLM = async (config: ConfigChainPrompt, prompt: ChainPromptBaseTemplate) => {
    return await generateOllamaLLMWithSystemuserBasicPrompt(config, prompt);
}


export { getAnswerLLM, getAnswerLocalLLM, getAnswerOllamaLLM };