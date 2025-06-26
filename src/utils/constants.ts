// src/utils/config.ts
import dotenv from 'dotenv';
dotenv.config();

// constants for bot commands
export const BOT_MESSAGE_TYPE = "text";

export enum BotCommand {
    Start = "start",
    Help = "help",
    Admin = "admin"
}

export enum CallbackQuery {
    showTicketsList = "showTicketsList",
    showUserList = "MainMenu",
    mainMenu = "MainMenu",
    showUserMessages = "ShowUserMessages",
    viewUserTicket = "ViewUserTicket",
    replyToTicket = "ReplyToTicket",
    closeTicket = "CloseTicket",
    showTicketLog = "ShowTicketLog"
}


// Constants for server api
export const API = {
    MESSAGES: "/api/messages",
    SEND_MESSAGE: "/api/sendMessage",
    GET_TELEGRAM_ID: "/api/getTelegramId",
    GET_MESSAGES_BY_USER_ID_ASSISTANT_ID: "/api/getMessagesByUserIdAssistantId",
    GET_TICKETS_MESSAGES_USER: "/api/getTicketsMessagesUser",
    GET_MESSAGES_USER_GPT_BY_USER_ID: "/api/getMessagesUserGptByUserId",
    CHECK_USER_OPEN_TICKETS: "/api/checkUserOpenTickets",
}

export const ADMIN_API = {
    ADMIN_REPLY_TICKET: "/api/admin/replyTicket",
    ADMIN_TICKET_LIST: "/api/admin/ticketList",
    OPEN_TICKET: "/api/admin/openTicket",
    CLOSE_TICKET: "/api/admin/closeTicket",
    ALL_USERS_DATA: "/api/admin/allUsersData",
    GET_ALL_USERS: "/api/admin/getAllUsers",
    GET_MESSAGES_USER_GPT: "/api/admin/getMessagesUserGpt",
    GET_REPLAY_ADMIN_USER: "/api/admin/getAllReplayMessagesAdminUser",
}


export enum EndPointMethods {
    GetDomainList = "getDomainList",
    DomainCheck = "checkDomainAvailability",
    GetServerList = "getServerList",
    OpenTicket = "openTicket",
    GetAuthInfo = "getAuthInfo"
}


export const KONSOLEX_ENDPOINT = {
    LOGIN: "https://konsolex-auth.onthecloud.srl/api/auth/login",
    DOMAINS_LIST: "https://konsolex-domains.onthecloud.srl/api/domain/list",
    
    DOMAIN_CHECK: "https://konsolex-domains.onthecloud.srl/api/domain/checkavailability",
    CHECK_USERID: "https://konsolex-auth.onthecloud.srl/api/auth/checkuserid",
    TELEGRAM_ID: "https://konsolex-auth.onthecloud.srl/api/user/addtelegramid",
    AUTH_INFO: "https://konsolex-domains.onthecloud.srl/api/domain/getdomaininfo",
    MESSAGES_UPDATE: "https://konsolex-websocket.onthecloud.srl/api/socket/chatmessageupdate",
    INFO_USER: "https://konsolex-auth.onthecloud.srl/api/users/me",
    
    INFO_USER_STATUS: "https://konsolex-auth.onthecloud.srl/api/services/getalluserservices",

    // Container web
    GET_SITE_ID: "https://konsolex-container.onthecloud.srl/api/docker/site/getsitebyname",
    GET_SITE_LIST: "https://konsolex-ispconfig.onthecloud.srl/api/site/get-sites-ai",
    RAM_CPU_MEMORY_IMPROVE: "https://konsolex-container.onthecloud.srl/api/docker/container/tuning",
    RESTART_CONTAINER: "https://konsolex-container.onthecloud.srl/api/docker/container/lifecycle",
    // Server
    SERVER_LIST: "https://konsolex-hetzner.onthecloud.srl/api/server/getserverslist",
    GET_SERVER_ID: "https://konsolex-hetzner.onthecloud.srl/api/server/getserverid",
    RESTART_SERVER: "https://konsolex-hetzner.onthecloud.srl/api/server/resetserver", //ok
    POWER_ON_SERVER: "https://konsolex-hetzner.onthecloud.srl/api/server/poweron", //ok
    RESTART_MYSQL_OR_POSTFIX: "https://konsolex-hetzner.onthecloud.srl/api/server/restartservice",
    MODIFY_RDNS: "https://konsolex-hetzner.onthecloud.srl/api/server/changednsptr",
    // Domain
    AUTHINFO_UPDATE: "https://konsolex-domains.onthecloud.srl/api/domain/updateauthinfo",
    MODIFY_DNS: "https://konsolex-ispconfig.onthecloud.srl/api/dns/updatednsrr/:id",  // :id è dinamico cambia con id record dns
    ADD_DNS: "https://konsolex-ispconfig.onthecloud.srl/api/dns/adddnsrr",
    ADD_DOMAIN: "https://konsolex-domains.onthecloud.srl/api/domain/adddomain",

}

export const TelegramAdminIdArray = process.env.TELEGRAM_ADMIN_IDS?.split(',').map(Number) || [] // add other TelegramAdminId here



export const OPENAI_ASSISTANT_ID_PAOLO = process.env.OPENAI_ASSISTANT_ID_PAOLO;
export const OPENAI_ASSISTANT_ID_ROBERTO = process.env.OPENAI_ASSISTANT_ID_ROBERTO;
export const OPENAI_ASSISTANT_ID_ANDREA = process.env.OPENAI_ASSISTANT_ID_ANDREA;


