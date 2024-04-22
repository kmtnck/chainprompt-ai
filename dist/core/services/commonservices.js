import fs from 'fs';
import dotenv from "dotenv";
dotenv.config();
// Define constants
const SYSTEMPROMPT_DFL = 'Sei gentile e professionale';
// Define context enumeration
var ContextChat;
(function (ContextChat) {
    ContextChat["CHAT_GENERICA"] = "chatgenerica";
    ContextChat["CHAT_BOT_CV"] = "chatbotcv";
    ContextChat["DOCENTE_LINUX"] = "docentelinux";
})(ContextChat || (ContextChat = {}));
// Define file names and fixed URI
const uriFisso = process.env.PATH_FILESET || 'datasets/fileset'; // Modify with your fixed URI
const contextFolder = process.env.PATH_FILESET || 'datasets/fileset';
const conversationFolder = process.env.PATH_CONVERSATION || 'datasets/fileset/conversations';
// Function to write an object to a text file
async function writeObjectToFile(obj, context = 'nondefinito') {
    // Get current timestamp
    const timestamp = Date.now();
    // Ensure destination directory exists, otherwise create it
    const directoryPath = `${conversationFolder}`; // Change this path if needed
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
    }
    // Convert timestamp to a date/time string
    const filename = `${directoryPath}/${timestamp}_${context}_conversation.txt`;
    // Convert object to JSON string
    const jsonData = JSON.stringify(obj);
    const resultData = `\n\n//--- ${timestamp} ---\n${jsonData}`;
    // Write JSON to a text file
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, resultData, (err) => {
            if (err) {
                reject(err); // Reject promise with error if one occurs
                return;
            }
            resolve('Dictionary saved successfully to file.'); // Otherwise, resolve promise with filename
        });
    });
}
export { writeObjectToFile, uriFisso, contextFolder, ContextChat, SYSTEMPROMPT_DFL, };
