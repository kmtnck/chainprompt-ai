/**
 * Interfaccia che rappresenta il template prompt base dell'applicazione in cui si esplicitano il system e user prompt.
 * 
 * Potrebbero essere definiti template che ad esempio prevedano dei dati dinamici in input da processare in una catena di prompt tali da rappresentarne un flusso simile a quanto si puo progettare con lo strumento rivet
 * 
 */
export interface ChainPromptBaseTemplate {
    systemprompt?: string;
    question?: string;
}