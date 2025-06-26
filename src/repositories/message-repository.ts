import Message, { MessageType } from "../../src/entities/Message";

/**
 * Creates a new message record in the database.
 * @async
 * @param {string} user_id - The User ID of the user associated with the message.
 * @param {string} messageContent - The content of the message.
 * @param {number} unixTimestamp - The Unix timestamp representing the message's datetime.
 * @param {MessageType} messageType - The type of the message (GPT, Admin, or User).
 * @param {boolean} ticketOpen - Whether the message is associated with an open ticket (default: false).
 * @returns {Promise<Message|undefined>} A Promise resolving to the newly created Message object if successful, or undefined if an error occurs.
 */
export async function create(
  user_id: string,
  assistant_id: string,
  thread_id: string, 
  messageContent: string,
  unixTimestamp: number,
  messageType: MessageType,
  ticketOpen: boolean = false,
  ticket_id?: number,
): Promise<Message | undefined> {
  try {
    const newMessage = await Message.create({
      user_id,
      assistant_id,
      thread_id,
      message: messageContent,
      datetime: new Date(unixTimestamp * 1000),
      type: messageType,
      ticketOpen,
      ticket_id
    });
    console.log("Message saved successfully.");
    return newMessage;
  } catch (err) {
    console.error("Error saving message:", err);
    throw err;
  }
}

/**
 * Retrieves all messages for a specific user from the database.
 * @async
 * @param {string} user_id - The User ID for whom messages are to be retrieved.
 * @returns {Promise<Message[]>} A Promise resolving to an array of Message objects associated with the user ID, ordered by message ID in ascending order.
 */
export async function getMessagesByUserId(user_id: string): Promise<Message[]> {
  try {
    return await Message.findAll({
      where: { user_id },
      order: [["id", "ASC"]],
    });
  } catch (err) {
    console.error("Error finding messages:", err);
    throw err;
  }
}

/**
 * Retrieves a message by its message ID.
 * @async
 * @param {number} msg_id - The ID of the message to retrieve.
 * @returns {Promise<Message|null>} A Promise resolving to the Message object if found, or null if no message with the given ID exists.
 */
export async function getMessagesByMsgId(
  msg_id: number
): Promise<Message | null> {
  try {
    return await Message.findOne({
      where: { id: msg_id },
    });
  } catch (err) {
    console.error("Error finding messages:", err);
    throw err;
  }
}

export async function getMessagesByMsgIdAndUserId(
  msg_id: number,
  user_id: number
): Promise<Message | null> {
  try {
    return await Message.findOne({
      where: { id: msg_id, user_id: user_id },
    });
  } catch (err) {
    console.error("Error finding messages:", err);
    throw err;
  }
}

export async function checkQuestionAskedBefore(message: any): Promise<any> {
  console.log('export async function checkQuestionAskedBefore(message: any): Promise<any> {')
  //var levenshtein = require('fast-levenshtein');
  // Retrieve all previously answered questions
  // const previousMessages = await Message.findAll({
  //   where: {
  //     ticketOpen: false,
  //     type: MessageType.User
  //   },
  // });
  // let closestMatch: any = null;
  // let smallestDistance: any = Infinity;
  // previousMessages.forEach((messagePrevious) => {
  //   console.log('message.text:', message.text, 'messagePrevious.message: ', messagePrevious.message)
  //   const distance = levenshtein.get(message.text, messagePrevious.message);
  //   if (distance < smallestDistance) {
  //     smallestDistance = distance;
  //     closestMatch = message;
  //   }

  //   const similarityThreshold = 5; // Adjust based on your needs
  //   if (closestMatch && smallestDistance <= similarityThreshold) {
  //     console.log('hiiiiiiiiiiiiiiiiiiiiiiiii')
  //     return true
  //   }
  //   else return false
  // });
}

/**
 * Retrieves all messages associated with open tickets for a specific user identified by their Telegram ID.
 * @param {string} user_id - The User ID of the user.
 * @returns {Promise<Message[]>} A promise that resolves to an array of Message objects.
 * @throws {Error} Throws an error if the database query fails.
 */
export async function getOpenTicketMessagesByUserId(
  user_id: string
): Promise<Message[]> {
  try {
    return await Message.findAll({
      where: { user_id: user_id, ticketOpen: true },
    });
  } catch (error) {
    console.error(
      `Error fetching open ticket messages for Telegram ID ${user_id}:`,
      error
    );
    throw new Error(
      `Failed to fetch open ticket messages for Telegram ID ${user_id}.`
    );
  }
}

/**
 * Closes all open tickets for a specific user identified by their Telegram ID by marking associated messages as closed.
 * @param {string} user_id - The User ID of the user whose tickets should be closed.
 * @returns {Promise<boolean>} A promise that resolves to true if any open tickets were found and closed, or false if no open tickets were found.
 * @throws {Error} Throws an error if the operation fails.
 */
export async function closeAllOpenTicketsByUserId(
  user_id: string
): Promise<boolean> {
  try {
    const openMessages = await getOpenTicketMessagesByUserId(user_id);
    if (openMessages.length === 0) {
      return false;
    }
    await Promise.all(
      openMessages.map(async (message) => {
        message.ticketOpen = false;
        await message.save();
      })
    );
    return true;
  } catch (error) {
    console.error(
      `Error closing all open tickets for Telegram ID ${user_id}:`,
      error
    );
    throw new Error(`Failed to close open tickets for Telegram ID ${user_id}.`);
  }
}

/**
 * Updates the ticket status of a message by its message ID.
 * @param {number} msgId - The ID of the message to update.
 * @param {boolean} ticketOpen - The new ticket status (open or closed).
 * @returns {Promise<boolean>} A promise that resolves to true if the ticket status was updated successfully, or false if the message was not found.
 * @throws {Error} Throws an error if the update operation fails.
 */
export async function updateTicketStatusByMsgId(
  msgId: number,
  ticketOpen: boolean
): Promise<boolean> {
  try {
    const message = await getMessagesByMsgId(msgId);
    if (!message) {
      return false;
    }
    if (message.ticketOpen === ticketOpen) return true;

    message.ticketOpen = ticketOpen;
    await message.save();
    return true;
  } catch (error) {
    console.error(
      `Error updating ticket status for message ID ${msgId}:`,
      error
    );
    throw new Error(`Failed to update ticket status for message ID ${msgId}.`);
  }
}
