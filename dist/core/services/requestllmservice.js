import OpenAI from "openai";
import axios from 'axios';
import dotenv from "dotenv";
dotenv.config();
const urilocalai = process.env.URI_LOCALAI || 'http://eleanor:1234/v1/chat/completions'; // Usa il valore della variabile di ambiente PORT, se definita, altrimenti usa la porta 3000
const local_model_name = process.env.LOCAL_MODEL_NAME || "gpt-4-turbo";
// Dizionario che mappa gli indirizzi IP alle conversazioni
const conversations = {};
//const openai = new OpenAI(process.env.OPENAI_API_KEY);
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
const requestLLM = async (req, res, systemprompt, question, temperature, modelname = "gpt-4-turbo") => {
    try {
        // Chiamata diretta all'API di OpenAI per generare una risposta utilizzando GPT-4 Turbo
        const response = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemprompt },
                { role: "user", content: question }
            ],
            model: modelname,
            temperature: temperature,
        });
        const answer = response.choices[0].message.content.trim(); // Ottieni la risposta generata
        console.log("Risposta generata:", answer);
        res.json({ answer }); // Invia la risposta al client
        return answer;
    }
    catch (error) {
        console.error("Errore durante la richiesta a OpenAI:", error);
        res.status(500).json({ error: "Errore durante la richiesta a OpenAI" });
    }
};
const requestLocalLLM = async (req, res, systemprompt, prompt, temperature, modelname = local_model_name) => {
    try {
        const response = await axios.post(urilocalai, {
            messages: [
                { role: "system", content: systemprompt },
                { role: "user", content: prompt }
            ],
            model: modelname,
            stream: false,
            temperature: temperature,
        });
        let answer = "";
        try {
            //risposta proveniente da lmstudio
            answer = response.data.choices[0].message.content.trim(); // Ottieni la risposta generata
        }
        catch {
            //risposta proveniente da ollama
            answer = response.data.message.content.trim();
        }
        console.log("Risposta generata:", answer);
        res.json({ answer }); // Invia la risposta al client
        return answer;
    }
    catch (error) {
        console.error("Errore durante la richiesta a Local AI:", error);
        res.status(500).json({ error: "Errore durante la richiesta a OpenAI" });
    }
};
export { requestLLM, requestLocalLLM };
