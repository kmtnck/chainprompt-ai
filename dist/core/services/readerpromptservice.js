import { promises as fsPromises } from 'fs';
/**
 * Reads the content of the source file.
 * @param {string} file Path to the source file.
 * @returns {Promise<string>} A Promise that resolves with the file content as a string,
 * or rejects with an error if there's an issue reading the file.
 */
const readFileOrigin = async (file) => {
    const content = await fsPromises.readFile(file, 'utf8');
    return content;
};
/**
 * Reads the content of a text file specified by the path provided as an environment variable,
 * stores the content in an environment variable of type string, and returns the file content as a string.
 * @param {string} fileToRead Path to the file to read.
 * @returns {Promise<string>} A Promise that resolves with the text file content as a string,
 * or rejects with an error if there's an issue reading the file.
 */
const readFileAndSend = async (fileToRead) => {
    try {
        // Read the source file content
        const originFileContent = await readFileOrigin(fileToRead);
        // Store the source file content in an environment variable
        process.env.CONTENUTO_FILE = originFileContent;
        // Return the file content as a string
        return originFileContent;
    }
    catch (error) {
        console.error('An error occurred:', error);
        throw error;
    }
};
/**
 * Reads the content of a list of text files specified by URIs provided as environment variables,
 * calls the readFileAndSend method for each file, and concatenates the content into a resulting string.
 * @param {string[]} fileNames List of file names to read.
 * @param {string} fixedUri Fixed URI to concatenate with the file names.
 * @returns {Promise<string>} A Promise that resolves with the resulting string containing the content
 * of all the concatenated text files, or rejects with an error if there's an issue reading the files.
 */
const readFileAndConcat = async (fileNames, fixedUri) => {
    try {
        // Check if the file names list is empty
        if (fileNames.length === 0) {
            return ''; // If the list is empty, return an empty string
        }
        // Get the first file name from the list
        const firstFileName = fileNames[0];
        // Construct the full URI by concatenating the fixed URI and the first file name
        const fullUri = `${fixedUri}/${firstFileName}`;
        // Call the readFileAndSend method to read the current file content
        const currentContent = await readFileAndSend(fullUri);
        // Remove the first file name from the list
        const remainingFileNames = fileNames.slice(1);
        // Recursively call readFileAndConcat for the remaining file names
        const remainingContent = await readFileAndConcat(remainingFileNames, fixedUri);
        // Concatenate the current file content with the content of the remaining files
        const concatenatedContent = currentContent + '\n\n' + remainingContent;
        // Return the resulting string
        return concatenatedContent;
    }
    catch (error) {
        console.error('An error occurred while concatenating files:', error);
        throw error;
    }
};
export { readFileAndConcat, readFileAndSend, readFileOrigin };
