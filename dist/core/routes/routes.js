// Rappresenta il file in cui raggruppare le varie rotte definite nella cartella "apis"
import express from "express";
import chatbot from "../apis/chatbot.js";
const router = express.Router();
// Utilizza le rotte definite nel modulo "chatbot"
router.use(chatbot);
console.log(`Importazione delle API avvenuta con successo!`);
export default router;
