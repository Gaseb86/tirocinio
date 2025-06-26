import axios from "axios";
import {
  CallbackQuery,
  KONSOLEX_ENDPOINT,
  TelegramAdminIdArray,
} from "./constants";
import { bot } from "../index";
import * as userOps from "../repositories/user-repository";
import { getOrCreateTicket, hasTicket } from "./ticketsCashe";
import { updateTicketStatusByMsgId } from "../repositories/message-repository";
import User from "../../src/entities/User";
import Message, { MessageType } from "../entities/Message";
import Assistant from "../entities/assistant";
import { Op } from "sequelize";

interface Server {
  id: number;
  server_id: number;
  server_name: string;
  datacenter_location_name: string;
  datacenter_location_city: string;
  private_net: any[];
  type: string;
  image_os_flavor: string;
  provider: string;
  firewall_id: number[];
  os: string;
}

interface Domain {
  domain: string;
  id: string;
  userId: string;
}

interface ServerIdIp {
  id: number;
  ipv4_ip: string;
  ipv6_ip: string | null;
}

// Aggiungi questa funzione di utilità in cima al file
function findBestMatch(searchTerm: string, possibilities: string[]): string | null {
  let bestMatch = null;
  let bestScore = 0;

  // Normalizza il termine di ricerca
  const normalizedSearch = searchTerm.toLowerCase().trim();

  for (const item of possibilities) {
    const normalizedItem = item.toLowerCase().trim();

    // Calcola un punteggio semplice basato su:
    // 1. Corrispondenza esatta
    // 2. Contiene la stringa
    // 3. Levenshtein distance (distanza di modifica)

    if (normalizedItem === normalizedSearch) {
      return item; // Match perfetto, ritorna immediatamente
    }

    let score = 0;

    // Controlla se contiene la stringa
    if (normalizedItem.includes(normalizedSearch) || normalizedSearch.includes(normalizedItem)) {
      score += 0.5;
    }

    // Calcola la similarità carattere per carattere
    let sameChars = 0;
    const minLength = Math.min(normalizedItem.length, normalizedSearch.length);
    for (let i = 0; i < minLength; i++) {
      if (normalizedItem[i] === normalizedSearch[i]) {
        sameChars++;
      }
    }
    score += sameChars / Math.max(normalizedItem.length, normalizedSearch.length);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  // pulire bestMatch
  if (bestMatch) {
    bestMatch = bestMatch.trim();
  }

  // Ritorna il match solo se ha un punteggio sufficiente
  return bestScore > 0.5 ? bestMatch : null;
}

// Modifica la funzione getServerId
export async function getServerId(userId: string, serverName: string): Promise<ServerIdIp | undefined> {
  try {
    /*
    // Prima ottieni la lista completa dei server
    const serverList = await getServerList(userId);
    if (!serverList) {
      console.error("Could not get server list");
      return undefined;
    }

    const servers = serverList.split('\n');
    console.log("Servers:", servers);
    const bestMatchName = findBestMatch(serverName, servers);
    console.log("old serverName:", serverName);
    console.log("Best match:", bestMatchName);

    if (!bestMatchName) {
      console.error("No matching server found");
      return undefined;
    }
      */

    // Ora chiama l'API con il nome del server corretto
    const response = await axios.post(
      KONSOLEX_ENDPOINT.GET_SERVER_ID,
      { server_name: serverName },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'userid': userId,
        },
      }
    );
    const serverData: ServerIdIp = response.data;
    return serverData;
  } catch (error) {
    console.error("Error getting server id:", error);
    return undefined;
  }
}

/**
 * Fetches the server details from the Konsolex API.
 * @param {string} serverName -
 */
export async function restartServer(userId: string, serverName: string): Promise<boolean> {
  try {
    const server_id = await getServerId(userId, serverName);
    if (!server_id) {
      console.error("Server id not found");
      return false;
    }
    const response = await axios.post(
      KONSOLEX_ENDPOINT.RESTART_SERVER,
      { id: server_id.id },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'userid': userId
        }
      }
    );
    console.log(response.data);
    return true;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.error("Errore di autenticazione - token mancante o non valido");
      return false;
    }
    console.error("Errore nel riavvio del server:", error);
    return false;
  }
}

/**
 * 
 * @param server_id 
 * @returns 
 */
export async function powerOnServer(userId: string, serverName: string): Promise<boolean> {
  try {
    const server_id = await getServerId(userId, serverName);
    if (!server_id) {
      console.error("Server id not found");
      return false;
    }

    const response = await axios.post(KONSOLEX_ENDPOINT.POWER_ON_SERVER,
      { id: server_id.id },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'userid': userId
        }
      });
    console.log(response.data);
    return true;
  } catch (error) {
    console.error("Error restarting server:", error);
    return false;
  }
}

/**
 * 
 * @param dbId 
 * @param service 
 * @returns 
 */
export async function restartMysqlOrPostfix(userId: string, serverName: string, service: string): Promise<boolean> {
  try {
    const server_id = await getServerId(userId, serverName);
    if (!server_id) {
      console.error("Server id not found");
      return false;
    }

    const response = await axios.post(KONSOLEX_ENDPOINT.RESTART_MYSQL_OR_POSTFIX,
      {
        id: server_id.id,
        service: service,
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'userid': userId
        }
      });
    console.log("Response data: ", response.data);
    return true;
  } catch (error) {
    console.error("Error restarting ", service, ": ", error);
    return false;
  }
}

/**
 * 
 * @param dbId 
 * @param ip 
 * @param dnsPtr 
 * @returns 
 */
export async function modifyRdns(userId: string, serverName: string, ip: string, dnsPtr: string): Promise<boolean> {
  try {
    if (ip === "" || dnsPtr === "") {
      console.error("IP or DNS PTR is empty");
      return false;
    }

    const server_id = await getServerId(userId, serverName);
    if (!server_id) {
      console.error("Server id not found");
      return false;
    }

    if (ip === "ipv6" && server_id.ipv6_ip !== null) {
      ip = server_id.ipv6_ip;
    } else ip = server_id.ipv4_ip;

    const response = await axios.post(KONSOLEX_ENDPOINT.MODIFY_RDNS, {
      id: server_id.id,
      ip: ip,
      dns_ptr: dnsPtr,
    });
    console.log("Response data: ", response.data);
    return true;
  } catch (error) {
    console.error("Error modifying rDNS: ", error);
    return false;
  }
}

export async function getSiteList(userId: string): Promise<string | undefined> {
  try {
    const response = await axios.get(KONSOLEX_ENDPOINT.GET_SITE_LIST, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'userid': userId,
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error getting site list:", error);
    return undefined;
  }
}


export async function getSiteId(userId: string, siteName: string): Promise<number | undefined> {
  try {
    const response = await axios.post(KONSOLEX_ENDPOINT.GET_SITE_ID, {
      site_name: siteName,
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'userid': userId,
      }
    });
    return response.data.id;
  } catch (error) {
    console.error("Error getting site id:", error);
    return undefined;
  }
}
/**
 * 
 * @param dbId 
 * @param cpu 
 * @param mem 
 * @param type 
 * @returns 
 */
export async function ramCpuMemoryImprove(userId: string, siteName: string, cpu: string, mem: string, type: string): Promise<boolean> {
  try {
    const dbId = await getSiteId(userId, siteName);
    const response = await axios.post(KONSOLEX_ENDPOINT.RAM_CPU_MEMORY_IMPROVE, {
      id: dbId,
      cpu: cpu,
      mem: mem,
      type: type,
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'userid': userId,
      }
    });
    console.log("Response data: ", response.data);
    return true;
  } catch (error) {
    console.error("Error improving RAM, CPU, or memory in ", type, ": ", error);
    return false;
  }
}

/**
 * 
 * @param dbId 
 * @param type 
 * @returns 
 */
export async function restartContainer(userId: string, siteName: string, type: string): Promise<boolean> {
  try {
    const siteId = await getSiteId(userId, siteName);
    const response = await axios.post(KONSOLEX_ENDPOINT.RESTART_CONTAINER, {
      id: siteId,
      action: "restart",
      type: type,
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'userid': userId,
      }
    });
    console.log("Response data: ", response.data);
    return true;
  } catch (error) {
    console.error("Error restarting container in ", type, ": ", error);
    return false;
  }
}

/**
 * Manca il domainId end point per recuperarlo 
 * @param domain_id 
 * @returns 
 */
export async function updateAuthinfo(userId: string, domainName: string): Promise<boolean> {
  /*
  try {
    const domainId = await getDomainId(userId, domainName);
    const response = await axios.post(KONSOLEX_ENDPOINT.AUTHINFO_UPDATE,
      { id: siteId },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'userid': userId,
        }
      }
    );
    console.log("Response data: ", response.data);
    return true;
  } catch (error) {
    console.error("Error updating auth info: ", error);
    return false;
  }
  */
  return false;
}

/**
 * 
 * @param idrecord da inserire nel  preceduto da 
 * @param type a,mx,txt,ns,cname
 * @param name 
 * @param data 
 * @param isp_id c'e 
 * @param ttl 
 * @param priority 
 * @returns 
 */
export async function modifyDns(idrecord: number, type: string, name: string, data: string, isp_id: number, ttl: number, priority: number): Promise<boolean> {
  try {
    const response = await axios.put(KONSOLEX_ENDPOINT.MODIFY_DNS, {
      type: type,
      name: name,
      data: data,
      isp_id: isp_id,
      ttl: ttl,
      priority: priority,
    });
    console.log("Response data: ", response.data);
    return true;
  } catch (error) {
    console.error("Error modifying DNS: ", error);
    return false;
  }
}

/**
 * 
 * @param type 
 * @param zone_id domains 
 * @param name 
 * @param data 
 * @param isp_id domains
 * @param ttl 
 * @param priority 
 * @returns 
 */
export async function addDns(type: string, zone_id: number, name: string, data: string, isp_id: number, ttl: number, priority: number): Promise<boolean> {
  try {
    const response = await axios.post(KONSOLEX_ENDPOINT.ADD_DNS, {
      type: type,
      zone_id: zone_id,
      name: name,
      data: data,
      isp_id: isp_id,
      ttl: ttl,
      priority: priority,
    });
    console.log("Response data: ", response.data);
    return true;
  } catch (error) {
    console.error("Error adding DNS: ", error);
    return false;
  }
}

/**
 * 
 * @param data 
 * prima cosa check domain
 * domain: nome
 * regisrant: è l'id contact dell'utente manca 
 *  
 * @returns 
 */
export async function addDomain(data: { domain: string, registrant: number, admin: number, technical: number, billing: number, ws: number, ns: number, ms: number, period: number, action: string, authCode: string, provider: string, amount: number }): Promise<boolean> {
  try {
    const response = await axios.post(KONSOLEX_ENDPOINT.ADD_DOMAIN, data);
    console.log("Response data: ", response.data);
    return true;
  } catch (error) {
    console.error("Error adding domain: ", error);
    return false;
  }
}


/**
 * Fetches a list of domains from the Konsolex API.
 *
 * @param {string} userid - The authentication token required for API access.
 * @returns {Promise<string | undefined>} A promise that resolves to a newline-separated list of domains if the request succeeds, or undefined in case of failure.
 */
export async function getDomainList(userid: string): Promise<string | undefined> {
  console.log("getDomainList called with userid:", userid);
  try {
    const response = await axios.get(KONSOLEX_ENDPOINT.DOMAINS_LIST, {
      headers: {
        Accept: "application/json",
        userid: userid,
      },
    });
    const result: Domain[] = response.data;
    return result
      ? result.map((result) => result.domain).join("\n")
      : undefined;
  } catch (error) {
    console.error("Get domain list error:", error);
  }
}

/**
 * Fetches a list of servers from the Konsolex API.
 *
 * @param {string} userid - The authentication token necessary for making the API call.
 * @returns {Promise<string | undefined>} A promise that resolves to a newline-separated list of server names if successful, or undefined if there was an error.
 */
export async function getServerList(
  userid: string
): Promise<string | undefined> {
  try {
    const response = await axios.get(KONSOLEX_ENDPOINT.SERVER_LIST, {
      headers: {
        Accept: "application/json",
        userid: userid,
      },
    });
    const result: Server[] = response.data?.servers;
    const serverList = result
      ? result.map((server) => `${server.server_name} (${server.type})`).join("\n")
      : undefined;
    
    console.log('Server list:', serverList);
    return serverList;
  } catch (error) {
    console.error("Get server list error:", error);
  }
}

/**
 * Sets the Telegram ID on the Konsolex API.
 * @param {string} userid - The authentication token required for API access.
 * @param {string} telegramID - The telegram id associated with the user.
 * @returns {Promise<string | undefined>} A promise that resolves to a string with telegram ID if successful, or undefined if there was an error.
 */
export async function setTelegramId(
  userid: string,
  telegramID: string
): Promise<string | undefined> {
  console.log('setTelegramId')
  try {
    const response = await axios.post(KONSOLEX_ENDPOINT.TELEGRAM_ID, {
      headers: {
        Accept: "application/json",
      },
      body: {
        userid: userid,
        telegramID: telegramID,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
    } else {
      console.error("Get telegram id error:", error);
    }
  }
}

/**
 * Checks if an userid exists on the konsolex-auth API.
 * @param {string} userid - The userid to be checked.
 * @returns {Promise<boolean>} - A promise that resolves to true if the userid exists, false otherwise.
 */
export async function checkUserIdExists(userid: string): Promise<boolean> {
  try {
    const response = await axios.post(KONSOLEX_ENDPOINT.CHECK_USERID, {
      userid: userid,
    });
    return response.data;
  } catch (error) {
    console.error("Error checking userid existence:", error);
    throw error;
  }
}

/**
 * Checks the availability of a domain through the Konsolex API.
 *
 * @param {string} domain - The domain to check for availability.
 * @param {string} userid - The authentication token required to authenticate the request.
 * @returns {Promise<any>} A promise that resolves with the API response object.
 */
export async function checkDomainAvailability(
  domain: string,
  userid: string
): Promise<any> {
  try {
    const response = await axios.post(
      KONSOLEX_ENDPOINT.DOMAIN_CHECK,
      { domain },
      {
        headers: {
          Accept: "application/json",
          userid: userid,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data || error.message);
    } else {
      console.error("Unexpected error:", error);
    }
  }
}

export async function getAuthInfo(
  domain: string,
  userid: string
): Promise<any> {
  const cleanDomain = domain.replace("https://", "").replace("http://", "").replace("www.", "");
  console.log('getAuthInfo:', cleanDomain)
  try {
    const response = await axios.post(
      KONSOLEX_ENDPOINT.AUTH_INFO,
      { domain },
      {
        headers: {
          Accept: "application/json",
          userid: userid,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return {
          error: true,
          message: "Non sono riuscito a trovare il tuo dominio, controlla di averlo scritto correttamente"
        };
      }
      console.error("Axios error:", error.response?.data || error.message);
    } else {
      console.error("Unexpected error:", error);
    }
    return {
      error: true,
      message: "Si è verificato un errore durante la ricerca del dominio"
    };
  }
}

/**
 * Sends a notification message to the admin user(s) regarding a new ticket. The message includes details
 * about the ticket, and is sent to the first admin listed in the TelegramAdminIdArray.
 *
 * @param {string} TicketMessage - The message content for the ticket.
 * @param {Object} params - An object containing the threadId and userId, used to identify the user associated with the ticket.
 * @param {string} [params.threadId] - The thread ID associated with the ticket.
 * @param {string} [params.userId] - The user ID associated with the ticket.
 * @param {number} msgId - The message ID associated with the ticket, for tracking purposes.
 * @returns {Promise<string>} A promise that resolves to a string indicating the result of the operation.
 */
export async function sendMessageToAdmin(
  TicketMessage: string,
  { telegramId, userId, }: { telegramId?: string; userId?: string; },
  msgId: number
): Promise<string> {
  try {
    console.log('ticket started')
    const adminUserId = TelegramAdminIdArray[0];
    let user: User | null = null;

    if (userId) {
      user = await userOps.findByUserId(userId);
    } else if (telegramId) {
      user = await userOps.findByTelegramId(telegramId);
    } else {
      throw new Error("A threadId or userId must be provided");
    }
    if (!user) {
      console.error(`User with ID ${telegramId || userId} not found.`);
      return "Couldn't send ticket to admin, user not found.";
    }

    const messagePrefix = user.username
      ? `New ticket from ${user.username}`
      : `New ticket from user ID ${user.telegram_id}`;
    const message = `${messagePrefix}:\n${TicketMessage}`;




    await updateTicketStatusByMsgId(msgId, true);


    await getOrCreateTicket(user, message);

    const inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: "Reply",
            callback_data: `${CallbackQuery.replyToTicket}_${user.user_id}`,
          },
        ],
        [
          {
            text: "Delete Ticket",
            callback_data: `${CallbackQuery.closeTicket}_${user.user_id}`,
          },
        ],
        [
          {
            text: `View User Messages`,
            callback_data: `${CallbackQuery.showUserMessages}_${user.telegram_id}`,
          },
        ],
      ],
    };

    await bot.telegram.sendMessage(adminUserId, message, {
      reply_markup: inlineKeyboard,
    });
    console.log(`Message sent to admin ${adminUserId}: ${message}`);
    return "Ticket sent to admin successfully.";
  } catch (error) {
    console.error(`Failed to send message to admin:`, error);
    return "Failed to send ticket to admin.";
  }
}

export async function getMessagesByUserId(userId: string) {
  try {
    const user = await userOps.findByUserId(userId);
    const messages = await Message.findAll({
      where: {
        user_id: userId,
        thread_id: user!.thread_id,
        ticket_id: {
          [Op.or]: [
            0,
            null
          ]
        },
        type: {
          [Op.in]: [MessageType.GPT, MessageType.User, MessageType.Ticket]
        }
      }
    });
    return messages;
  } catch (error) {
    console.error("Error getting messages by user id:", error);
    return {
      status: 500,
      message: "Internal server error"
    };
  }
}

/** end point get tutti i messaggi per user id e assistant id */
export async function getMessagesByUserIdAndAssistantId(
  userId: string): Promise<{
    name: string | undefined;
    img: string | undefined;
    messages: Message[];
  }[] | {
    status: number;
    message: string;
  }> {

  try {
    const assistants = await Assistant.findAll();
    if (assistants.length > 0) {
      let dataForAssistant = [];
      for (let assistant of assistants) {
        let messages = await Message.findAll({
          where: {
            user_id: userId,
            assistant_id: assistant.assistant_id,
            ticket_id: {
              [Op.or]: [
                0,
                null
              ]
            }
          }
        });
        let dataAssistant = {
          name: assistant.name,
          img: assistant.img,
          messages
        }
        dataForAssistant.push(dataAssistant);

      }
      return dataForAssistant;
    }
    else {
      return [];
    }
  }
  catch (error) {
    console.error("Error getting messages by user id and assistant id:", error);
    return {
      status: 500,
      message: "Internal server error"
    };
  }
}

/** end point get tutti i messaggi per user id e assistant id */
export async function getAllReplayMessagesAdminUser(): Promise<Message[][] | { status: number, message: string }> {
  try {
    const tickets = await Message.findAll(
      {
        where: {
          type: MessageType.Ticket
        },
        //group: ['user_id'],
        order: [
          ['ticketOpen', 'DESC'], // Prima quelli con ticketOpen = 1, poi quelli con ticketOpen = 0
          ['id', 'DESC']          // Poi ordina per id in ordine decrescente
        ]
      }
    );
    let ticketMessages: Message[][] = [];
    for (let ticket of tickets) {
      let messages = await Message.findAll({
        where: {
          ticket_id: ticket.id,
        }
      })
      messages.unshift(ticket);
      ticketMessages.push(messages)
    }
    return ticketMessages;
  } catch (error) {
    console.error("Error getting tickets by user", error);
    return {
      status: 500,
      message: "Internal server error"
    };
  }
}

/**
 * Fa la stessa roba di quella sopra però per un singolo User
 */
export async function getAllMessagesTicketsForUser(userId: string) {
  try {
    const tickets = await Message.findAll(
      {
        where: {
          user_id: userId,
          type: MessageType.Ticket

        },
        //group: ['user_id'],
        order: [["id", "DESC"]]
      }
    );
    let ticketMessages: Message[][] = [];
    for (let ticket of tickets) {
      let messages = await Message.findAll({
        where: {
          ticket_id: ticket.id,
        }
      })
      messages.unshift(ticket);
      ticketMessages.push(messages)
    }
    return ticketMessages;
  } catch (error) {
    console.error("Error getting tickets by user", error);
    return {
      status: 500,
      message: "Internal server error"
    };
  }
}

interface UserInfo {
  userId: string;
  tgId: string;
  firstname: string | null;
  lastname: string | null;
  companyName: string | null;
  ticketOpen: boolean;
}

export async function fetchUsersWithDetails(users: any[]): Promise<UserInfo[]> {
  try {
    const allUsers = await Promise.all(
      users.map(async (user) => {
        try {
          const response = await axios.get(KONSOLEX_ENDPOINT.INFO_USER, {
            headers: {
              "userid": user.user_id
            }
          });

          const userInfo: UserInfo = {
            userId: user.user_id,
            tgId: user.telegram_id,
            firstname: response.data.first_name,
            lastname: response.data.last_name,
            companyName: response.data.companyName,
            ticketOpen: hasTicket(user.user_id),
          };

          return userInfo;
        } catch (error) {
          console.error(`Error fetching info for user ${user.user_id}:`, error);
          const defaultUser: UserInfo = {
            userId: user.user_id,
            tgId: user.telegram_id,
            firstname: null,
            lastname: null,
            companyName: null,
            ticketOpen: hasTicket(user.user_id),
          };
          return defaultUser;
        }
      })
    );
    return allUsers;
  } catch (error) {
    console.error('Error fetching users info:', error);
    throw new Error('Failed to fetch users information');
  }
}


export { KONSOLEX_ENDPOINT };
