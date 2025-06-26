import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, '../../.env') });

type AppConfig = {
    openaiApiKey: string;
    openaiOrgKey: string;
    telegramKey: string;
    dbName: string;
    serverPort: number;
    dbHost: string;
    dbUserName: string;
    dbPassword: string;
    dbDialect: string
};

function getEnvVariable(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Environment variable ${key} is missing`);
    }
    return value;
}

const config: AppConfig = {
    openaiApiKey: getEnvVariable('OPENAI_API_KEY'),
    openaiOrgKey: getEnvVariable('OPENAI_API_ORG_KEY'),
    telegramKey: getEnvVariable('TELEGRAM_BOT_KEY'),
    dbName: getEnvVariable('DB_NAME'),
    serverPort: parseInt(getEnvVariable('SERVER_PORT'), 10) || 3000,
    dbHost: getEnvVariable('DB_HOST'),
    dbUserName: getEnvVariable('DB_USER'),
    dbPassword: getEnvVariable('DB_PASS'),
    // dbDialect: 'mysql' add to .env
    //dbDialect: getEnvVariable('DB_DIALECT')
    dbDialect: 'mysql'
};

export default config;
