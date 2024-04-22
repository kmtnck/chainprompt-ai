import express from 'express';
const router = express.Router();
import route from './routes/routes.js';
// Importa le rotte definite in un altro file
router.use(route);
router.get("/", (req, res) => {
    res.send("api works. questa chiamata è un hello world!! Se funziona allora è tutto ok!");
});
console.log(`Endpoints caricati e disponibili...`);
export default router;
