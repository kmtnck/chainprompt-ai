// Rappresenta il file in cui raggruppare le varie rotte definite nella cartella "apis"
import express from "express";
import chatbot from "../apis/chatbot.js"
import chainbot from "../apis/chainbot.js"
const router = express.Router();

/**
 * Tutte le apis supportate dall'applicazione vengono importate in questo aggregatore di rotte applicative
 */

// Utilizza le rotte definite nel modulo "chatbot"
router.use(chatbot);
router.use(chainbot);

console.log(`Importazione delle API avvenuta con successo!`);

export default router;