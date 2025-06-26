import express from "express";
import cors from "cors";
import axios from "axios";
import { Op } from "sequelize";
import { openai } from "./index";
import * as msgOps from "./repositories/message-repository";
import * as userOps from "./repositories/user-repository";
import Message, { MessageType } from "./entities/Message";
import config from "./utils/environment";
import * as aux from "./utils/aux-functions";
import {
  ADMIN_API,
  API,
  KONSOLEX_ENDPOINT,
  TelegramAdminIdArray
} from "./utils/constants";
import {
  sendMessageToAdmin,
  getMessagesByUserIdAndAssistantId,
  getAllReplayMessagesAdminUser,
  getAllMessagesTicketsForUser,
  getMessagesByUserId,
  fetchUsersWithDetails
} from "./utils/endpoint";
import {
  closeTicket,
  findTicket,
  getAllOpenTickets,
  getOrCreateTicket,
  hasTicket,
  resetAdminReplyState,
  resetClientReplyState,
  setupClientReplyState,
} from "./utils/ticketsCashe";


const app = express();

// Enable Cross-Origin Resource Sharing for all routes
app.use(cors());

// Parse incoming requests with JSON payloads
app.use(express.json());

// Logging middleware for incoming requests
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

/**
 * Handles an admin's reply to a user ticket.
 *
 * @route POST /adminReplyTicket (The actual endpoint should be specified here)
 * @param req Express request object, expects `userId` and `message` in the body.
 * @param res Express response object, returns a status code and a message indicating the result of the operation.
 * @returns {void} Sends a JSON response with success status and message or an error message.
 */
app.post(ADMIN_API.ADMIN_REPLY_TICKET, async (req, res) => {
  const { userId, message } = req.body as { userId: string; message: string };

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }
  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }

  try {
    const user = await userOps.findByUserId(userId);
    console.log('app.post(ADMIN_API.ADMIN_REPLY_TICKET, async (req, res) => {')

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const ticket = await Message.findOne({
      where: {
        user_id: user.user_id,
        type: MessageType.Ticket,
      },
      order: [["id", "DESC"]],
      limit: 1,
    });

    const msg = await msgOps.create(
      userId,
      user.assistant_id,
      user.thread_id,
      message,
      new Date().getTime() / 1000,
      MessageType.Admin,
      true,
      ticket?.id
    );
    if (!msg) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to create message" });
    }

    // Send message to telegram user
    if (user.telegram_id) {
      await aux.sendAdminReplyToUser(parseInt(user.telegram_id), message);
    }

    setupClientReplyState(userId);
    resetAdminReplyState(userId);

    axios.post(
      KONSOLEX_ENDPOINT.MESSAGES_UPDATE,
      {
        updated: true,
        userid: userId,
        chat_id: ticket?.id
      }
    );

    res
      .status(200)
      .json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("Error in ADMIN_REPLY_TICKET:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error - Unable to send message" });
  }
});

/**
 * Get all users
 */
app.get(ADMIN_API.GET_ALL_USERS, async (req, res) => {
  try {
    const users = await userOps.fetchAll();
    if (users.length === 0) {
      return res.json({ allUsers: [], message: "No users found." });
    }

    const allUsers = await fetchUsersWithDetails(users);

    res.json({ allUsers });
  } catch (error) {
    console.error("Failed to fetch user list:", error);
    res.status(500).json({ error: "Failed to fetch user list" });
  }
});

/**
 * Permit the admin to open a ticket for a user.
 
app.post(ADMIN_API.OPEN_TICKET, async (req, res) => {
  const { userId, message } = req.body as { userId: string; message: string };

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }
  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }

  try {
    const user = await userOps.findByUserId(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const ticketMessage = "New ticket from Admin: " + message;
    const ticket = await getOrCreateTicket(user, ticketMessage);


    if (!ticket) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to open ticket" });
    }

    res
      .status(200)
      .json({ success: true, message: "Ticket opened successfully" });
  } catch (error) {
    console.error("Error in OPEN_TICKET:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error - Unable to open ticket" });
  }
});
*/

/**
 * Fetches and returns all user data including telegram ID, user ID, last time used, messages, and ticket status.
 * This endpoint provides a comprehensive view of each user's data stored in the system.
 *
 * @route GET /admin/all-users-data
 * @param req Express request object.
 * @param res Express response object. Returns a JSON object containing all user data or an error message.
 * @returns {void} Sends a JSON response with an array of all users and their data or an error message.
 */
app.get(ADMIN_API.ALL_USERS_DATA, async (req, res) => {
  try {
    const users = await userOps.fetchAll();
    if (users.length === 0) {
      return res.json({ allUsers: [], message: "No users found." });
    }
    const allUsers = await Promise.all(
      users.map(async (user) => ({
        tgId: user?.telegram_id,
        userId: user.user_id,
        lastTimeUsed: user.last_time_used,
        messages: await Message.findAll({ where: { user_id: user.user_id } }),
        ticketOpen: hasTicket(user.user_id),
      }))
    );

    res.json({ allUsers });
  } catch (error) {
    console.error("Failed to fetch user list:", error);
    res.status(500).json({ error: "Failed to fetch user list" });
  }
});

/**
 * Fetches and returns all user data including telegram ID, user ID, last time used, messages, and ticket status.
 * This endpoint provides a comprehensive view of each user's data stored in the system.
 */
app.get(ADMIN_API.GET_MESSAGES_USER_GPT, async (req, res) => {
  try {
    const users = await userOps.fetchAll();
    if (users.length === 0) {
      return res.json({ allUsers: [], message: "No users found." });
    }
    const allUsers = await Promise.all(
      users.map(async (user) => ({
        tgId: user?.telegram_id,
        userId: user.user_id,
        lastTimeUsed: user.last_time_used,
        messages: await Message.findAll(
          {
            where: {
              user_id: user.user_id,
              type: {
                [Op.in]: [MessageType.User, MessageType.GPT, MessageType.Ticket]
              },
              ticket_id: {
                [Op.or]: [
                  0,
                  null
                ]
              }
            }
          }),
        ticketOpen: hasTicket(user.user_id),
      }))
    ).then(users =>
      users.sort((a, b) =>
        new Date(b.lastTimeUsed).getTime() - new Date(a.lastTimeUsed).getTime()
      )
    );

    res.json({ allUsers });

  } catch (error) {
    console.error("Fail ...", error);
    res.status(500).json({ error: "Failed ..." });
  }
});

/**
 * Fetches and returns a list of users who have a Telegram ID associated with their account.
 * This endpoint is useful for identifying users who can be contacted via Telegram.
 *
 * @route GET /api/get-telegram-id
 * @param req Express request object.
 * @param res Express response object. Returns a JSON object containing users with a Telegram ID or an error message.
 * @returns {void} Sends a JSON response with an array of users who have a Telegram ID or an error message.
 */
app.get(API.GET_TELEGRAM_ID, async (req, res) => {
  try {
    const users = await userOps.fetchAll();
    const usersWithTelegramId = users.filter((user) => user.telegram_id);

    if (usersWithTelegramId.length === 0) {
      return res.json({
        allUsers: [],
        message: "No users with a Telegram ID found.",
      });
    }

    const allUsers = usersWithTelegramId.map((user) => ({
      tgId: user.telegram_id,
      userId: user.user_id,
    }));

    res.json({ allUsers });
  } catch (error) {
    console.error("Failed to fetch user list:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch user list due to an internal error." });
  }
});

/**
 * Fetches a list of all open tickets along with their messages.
 *
 * @route GET /adminTicketList (The actual endpoint should be specified here)
 * @param req Express request object.
 * @param res Express response object. Returns a JSON object containing all open tickets with their details and messages.
 * @returns {void} Sends a JSON response with an array of all open tickets and their messages or an error message.
 */
app.get(ADMIN_API.ADMIN_TICKET_LIST, async (req, res) => {
  try {
    const tickets = getAllOpenTickets();
    if (tickets.length === 0) {
      return res.json({ allTickets: [], message: "No open tickets found." });
    }
    const allTickets = await Promise.all(
      tickets.map(async (ticket) => {
        const messages = await ticket.getAllMessages();

        return {
          userId: ticket.userId,
          username: ticket.username,
          messages: messages.filter((message) => message !== undefined),
        };
      })
    );

    res.json({ allTickets });
  } catch (error) {
    console.error("Failed to fetch ticket list:", error);
    res.status(500).json({ error: "Failed to fetch ticket list" });
  }
});

/**
 * Closes an open ticket specified by the user ID.
 *
 * @route POST /closeTicket (The actual endpoint should be specified here)
 * @param req Express request object, expects `userId` in the body.
 * @param res Express response object, returns a status code and a message indicating the result of the operation.
 * @returns {void} Sends a JSON response with success status and message if the ticket was closed successfully, or an error message.
 */
app.post(ADMIN_API.CLOSE_TICKET, async (req, res) => {
  const { userId } = req.body as { userId: string };

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  const ticket = findTicket(userId);
  if (!ticket) {
    return res.status(404).json({ error: "Ticket not found" });
  }

  try {
    const closeResult = await closeTicket(userId);
    if (closeResult) {
      res
        .status(200)
        .json({ success: true, message: "Ticket closed successfully" });
    } else {
      res.status(500).json({ error: "Failed to close ticket" });
    }
  } catch (error) {
    console.error("Error closing ticket:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error - Unable to close ticket" });
  }
});

/**
 * Fetches message history for a given user.
 * @route GET /api/messages
 */
app.get(API.MESSAGES, async (req, res) => {
  const userId = req.query.userId?.toString();
  if (!userId) {
    return res.status(400).json({ message: "userId is required." });
  }

  try {
    const messages = await msgOps.getMessagesByUserId(userId);

    if (messages.length === 0) {
      const userExists = await userOps.findByTelegramId(userId);
      if (!userExists) {
        return res.status(404).json({ message: "User not found." });
      }
      return res.json({ allMessages: [] });
    }

    const allMessages = messages.map((message) => ({
      role: message.type,
      text: message.message,
      timestamp: message.datetime.getTime(),
      ticketOpen: message.ticketOpen,
    }));

    res.json({ allMessages });
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch messages due to an internal error." });
  }
});


interface SendMessageRequest {
  text: string;
  userId: string;
  tg_id: string;
}
interface ApiResponse {
  success: boolean;
  message: string;
  messageTo: string;
  gptReply?: string;
  error?: string;
}


/**
 * Handles sending of a user message and generating a bot reply.
 * @route POST /api/sendMessage
 * @param req Express request object, expects `text`, `userId`, and `tg_id` in the body.
 * @param res Express response object, returns a status code and a message indicating the result of the operation.
 * @returns {void} Sends a JSON response with success status and message or an error message.
 * @throws {Error} Throws an error if the user ID, Telegram ID, or message text is missing or empty.
 */
app.post(API.SEND_MESSAGE, async (req, res) => {
  const { text, userId, tg_id } = req.body as SendMessageRequest;
  if (!userId) {
    return res.status(400).json({ message: "userId is required." });
  }
  if (!tg_id) {
    return res.status(400).json({ message: "telegram_id is required." });
  }
  if (!text || !text.trim()) {
    return res.status(400).json({ message: "Message text is required and cannot be empty." });
  }
  let open = false;
  let ticket = null;
  let gptReply: string | undefined = undefined;
  let messageTo: string = "GPT";
  try {
    // Get or create user in a single operation
    const user = await aux.getUserOrCreate(openai, tg_id, userId);
    // Find open ticket
    const openTicket = findTicket(user.user_id);
    if (openTicket) {
      open = true;
      messageTo = "Admin";
      // Find last ticket
      ticket = await Message.findOne({
        where: {
          user_id: user.user_id,
          type: MessageType.Ticket,
        },
        order: [["id", "DESC"]],
        limit: 1,
      });
    }
    const msg = await aux.createMessage(user, text, MessageType.User, open, ticket?.id);
    if (!msg) {
      return res.status(500).json({
        success: false,
        message: "Failed to create message"
      });
    }
    // Check if user has an open ticket -> send message to admin
    if (openTicket) {
      // Send message to admin
      const result = await sendMessageToAdmin(
        text,
        { userId: userId.toString() },
        msg.id!
      );
      resetClientReplyState(user.user_id);
      // Update admin message status
      axios.post(
        KONSOLEX_ENDPOINT.MESSAGES_UPDATE,
        {
          updated: true,
          userid: TelegramAdminIdArray[0],
          chat_id: ticket?.id
        }
      );
    }
    else {
      // Update user message status
      axios.post(
        KONSOLEX_ENDPOINT.MESSAGES_UPDATE,
        {
          updated: true,
          userid: user.user_id
        }
      );
      // Create GPT reply
      gptReply = await aux.storeMessageAndCreateReply(openai, user, msg);
    }
    const response: ApiResponse = {
      success: true,
      message: "Message sent successfully",
      messageTo: messageTo,
      gptReply: gptReply,
    };
    return res.status(200).json(response);

  } catch (error) {
    console.error("Error in /api/sendMessage:", error);
    const errorResponse: ApiResponse = {
      success: false,
      message: "Failed to process message",
      messageTo: messageTo,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
    return res.status(500).json(errorResponse);
  }
});

/**
 * Fetches all messages for a given user and assistant.
 */
app.post(API.GET_MESSAGES_BY_USER_ID_ASSISTANT_ID, async (req, res) => {
  const userId: string = req.body.userId;
  if (!userId) {
    return res.status(400).json({ message: "userId is required." });
  }
  try {
    const response = await getMessagesByUserIdAndAssistantId(userId);
    if ("message" in response) {
      return res.status(response.status).json(response.message);
    }
    return res.status(200).json(response);

  }
  catch (error) {
    console.error("Error in /api/getMessagesByUserIdAndAssistantId", error);
    return res.status(500).json("internal server error");
  }
});

/**
 * Fetches all messages user / GPT for a given user.
 */
app.post(API.GET_MESSAGES_USER_GPT_BY_USER_ID, async (req, res) => {
  const userId: string = req.body.userId;
  if (!userId) {
    return res.status(400).json({ message: "userId is required." });
  }
  try {
    const response = await getMessagesByUserId(userId);
    if ("message" in response) {
      return res.status(response.status).json(response.message);
    }
    return res.status(200).json(response);

  }
  catch (error) {
    console.error("Error in /api/getMessagesByUserIdAndAssistantId", error);
    return res.status(500).json("internal server error");
  }
});

/**
 * Fetches al tickets for a given user.
 */
app.get(ADMIN_API.GET_REPLAY_ADMIN_USER, async (req, res) => {
  try {
    const response = await getAllReplayMessagesAdminUser();
    if ("message" in response) {
      return res.status(response.status).json(response.message);
    }
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in /api/getAllReplayMessagesAdminUser", error);
    return res.status(500).json("internal server error");
  }
});

/**
 * Fetches all Tickets messages for User
 */
app.post(API.GET_TICKETS_MESSAGES_USER, async (req, res) => {
  const userId: string = req.body.userId;
  if (!userId) {
    return res.status(400).json({ message: "userId is required." });
  }
  try {
    const response = await getAllMessagesTicketsForUser(userId);
    if ("message" in response) {
      return res.status(response.status).json(response.message);
    }
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in /api/getAllReplayMessagesAdminUser", error);
    return res.status(500).json("internal server error");
  }
});

/**
 * Checks if a user has an open ticket.
 * @route POST /api/admin/checkUserOpenTickets
 * @param req Express request object, expects `userId` in the body.
 * @param res Express response object, returns a status code and a message indicating the result of the operation.
 * @returns {void} Sends a JSON response with a boolean value indicating if the user has an open ticket or an error message.
 */
app.post(API.CHECK_USER_OPEN_TICKETS, async (req, res) => {
  const userId: string = req.body.userId;
  if (!userId) {
    return res.status(400).json({ message: "userId is required." });
  }
  try {
    if (findTicket(userId)) {
      return res.status(200).json({ openTicket: true });
    }
    return res.status(200).json({ openTicket: false });
  } catch (error) {
    console.error("Error in /api/checkUserOpenTickets", error);
    return res.status(500).json("internal server error");
  }
});

/**
 * Starts the web server.
 */
const startWebServer = () => {
  app.listen(config.serverPort, () =>
    console.log(`Server running on http://localhost:${config.serverPort}`)
  );
};

export default startWebServer;