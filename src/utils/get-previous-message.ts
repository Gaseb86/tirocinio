import { MessageType } from "../entities/Message";
import * as msgOps from "../repositories/message-repository";
import { isSimilar } from "./levenshtein-distance";

/**
 * Retrieves previous messages for the user and checks if a similar message has been asked.
 * @param {string} userId - The ID of the user.
 * @param {string} currentMessage - The current message to compare.
 * @returns {Promise<string | null>} The previous response if a similar message is found, otherwise null.
 */
export async function getPreviousMessages(
    userId: string,
    currentMessage: string
): Promise<string | null> {
    try {
        const previousMessages = await msgOps.getMessagesByUserId(userId);
        for (const message of previousMessages) {
            if (message.type == MessageType.User && message.ticketOpen) continue
            let counter = 0
            if (isSimilar(currentMessage, message.message)) {
                counter += 1
                let id: any = message.id
                let user_id: any = message.user_id
                let a: any = await msgOps.getMessagesByMsgIdAndUserId(id + 2, user_id)

                console.log('currentMessage: ', currentMessage, "\n", 'similar message from before: ', message.message, "\n", "get previous message", a.message)
                return a.message;
            }
        }
        return null;
    } catch (error) {
        console.error(`Error retrieving previous messages for user ${userId}:`, error);
        return null;
    }
}
