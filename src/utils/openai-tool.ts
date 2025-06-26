import Openai from 'openai';

interface FilesearchTool {
    type: "file_search";
    file_search: {
        max_num_results: number;
        ranking_options: {
            score_threshold: number;
        }
    }
}

interface FunctionTool {
    type: "function";
    function: {
        name: string;
        description: string;
        strict: boolean;
        parameters: {
            type: string;
            properties: Record<string, unknown>;
            additionalProperties: boolean;
            required?: string[];
        }
    }
}


export type Tool = FilesearchTool | FunctionTool;

export async function getAllRunSteps (
    openai: Openai,
    threadId: string,
    runId: string
) {
    const allSteps = await openai.beta.threads.runs.steps.list(threadId, runId);
    console.log('All run steps:', JSON.stringify(allSteps.data, null, 2));

    // Filtra per trovare lo step di tool_calls
    const toolCallStep = allSteps.data.find(step => step.type === 'tool_calls');

    if (toolCallStep) {
        const detailedStep = await openai.beta.threads.runs.steps.retrieve(
            threadId,
            runId,
            toolCallStep.id,
            {
                include: ["step_details.tool_calls[*].file_search.results[*].content"]
            }
        );
        return detailedStep;
    }
    return null;
};

export async function checkRelevance (
    runStep: any
): Promise<number | null> {
    // Debug logs
    console.log('RunStep:', JSON.stringify(runStep, null, 2));

    if (!runStep?.step_details) {
        console.log('No step_details found');
        return null;
    }

    if (!runStep.step_details.tool_calls) {
        console.log('No tool_calls found');
        return null;
    }

    const fileSearchCalls = runStep.step_details.tool_calls.filter(
        (call: any) => call.type === "file_search"
    );

    if (fileSearchCalls.length > 0) {
        const results = fileSearchCalls[0].file_search?.results;
        console.log('File search results:', results);

        if (results && results.length > 0) {
            const relevanceScore = results[0].score as number;
            console.log('Relevance score:', relevanceScore);
            return relevanceScore;
        }
    }

    console.log('No relevant results found');
    return null;
};

export const openaiTools: Tool[] = [
    {
        "type": "file_search",
        "file_search": {
            max_num_results: 1,
            ranking_options: {
                score_threshold: 0.4,
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "openTicket",
            "description": "Apre un ticket per il supporto tecnico, apri solo con risposta affermativa dell'utente",
            "strict": true,
            "parameters": {
                "type": "object",
                "properties": {
                    "TicketMessage": {
                        "type": "string",
                        "description": "Il messaggio da includere nel ticket, genera te questo messaggio riassumendo il problema dell'utente e le azioni che hai intrapreso per risolverlo."
                    }
                },
                "required": [
                    "TicketMessage"
                ],
                "additionalProperties": false
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "getServerList",
            "description": "Returns the list of servers and the type of each server (container-website or webserver-apache). Use this function to verify the correctness of server names provided by the user or to identify if a server is of type container or webserver. It is recommended to call this function during data validation or when it is necessary to classify servers based on their type.",
            "strict": true,
            "parameters": {
                "type": "object",
                "properties": {},
                "additionalProperties": false
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "getDomainList",
            "description": "Returns the list of the user's domains, only used in case of an error. Do not call for SSL-related inquiries.",
            "strict": true,
            "parameters": {
                "type": "object",
                "properties": {},
                "additionalProperties": false
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "getSiteList",
            "description": "Retrieves a list of the user's sites, including the site name and site type (container-site or webserver). This function should be called to verify the accuracy of site names provided by the user or to determine whether a site, database, or SSL is categorized as a container or a webserver.",
            "strict": true,
            "parameters": {
                "type": "object",
                "properties": {},
                "additionalProperties": false
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "restartServer",
            "description": "Riavvia un server specificato, prima di chiamare la funzione spiega sempre la soluzione proposta nei file del vector store.",
            "strict": true,
            "parameters": {
                "type": "object",
                "properties": {
                    "serverName": {
                        "type": "string",
                        "description": "Nome del server da riavviare, chiedi sempre il nome del server che si vuole riavviare all'utente"
                    }
                },
                "required": ["serverName"],
                "additionalProperties": false
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "restartMysql",
            "description": "Riavvia il servizio MySQL su un server webserver o su un sito webserver. Prima di lanciare questa funzione chiedi sempre all'utente il nome del webserver su cui riavviare MySQL.",
            "strict": true,
            "parameters": {
                "type": "object",
                "properties": {
                    "serverName": {
                        "type": "string",
                        "description": "Nome del webserver su cui riavviare MySQL"
                    }
                },
                "required": [
                    "serverName"
                ],
                "additionalProperties": false
            }
        }
    }
] as const;

// Type for tools
export type OpenAITools = typeof openaiTools;