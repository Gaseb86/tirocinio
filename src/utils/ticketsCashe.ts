import User from "../entities/User";
import * as messageOps from "../repositories/message-repository";
import * as msgOps from "../repositories/message-repository";
import Message, { MessageType } from "../entities/Message";
import { off } from "process";
import { Op } from "sequelize";


/**
 * Represents a support ticket.
 */
class Ticket {
  public readonly userId: string;
  public readonly username?: string;
  public adminReplyMode: boolean;
  public clientReplyMode: boolean;

  /**
   * Creates a new Ticket instance.
   * @param userId The unique identifier for the user associated with the ticket.
   * @param username The optional username of the user.
   */
  constructor(userId: string, username?: string) {
    this.userId = userId;
    this.username = username;
    this.adminReplyMode = false;
    this.clientReplyMode = false;
  }

  /**
   * Retrieves all messages associated with this ticket.
   * @returns A promise that resolves to an array of messages related to the ticket.
   */
  async getAllMessages(): Promise<Message[]> {
    try {
      console.log('return await messageOps.getOpenTicketMessagesByUserId(this.userId);')
      return await messageOps.getOpenTicketMessagesByUserId(this.userId);
    } catch (error) {
      console.error(`Failed to get messages for user ${this.userId}:`, error);
      throw error;
    }
  }
}

/** Cache for storing active tickets. */
const TicketCache: Record<string, Ticket> = {};


/**
 * Initializes the ticket cache with all currently open tickets.
 * @returns A promise that resolves when the cache has been initialized.
 */
export async function initializeTicketCache(): Promise<void> {
  try {
    // Get users with open tickets
    const openTickets = await Message.findAll({
      where: {
        [Op.and]: [
          { ticketOpen: true },
          { type: MessageType.Ticket }
        ]
      },
      group: ['user_id'],
      attributes: ['user_id']
    });

    const userIds = openTickets.map(ticket => ticket.user_id);

    const usersWithOpenTickets = await User.findAll({
      where: {
        user_id: {
          [Op.in]: userIds
        }
      },
      attributes: ['user_id', 'username']
    });

    // Populate cache with users having open tickets
    for (const user of usersWithOpenTickets) {
      const userId = user.user_id;
      const username = user.username;
      TicketCache[userId] = new Ticket(userId, username ?? undefined);
      TicketCache[userId].adminReplyMode = false;
      TicketCache[userId].clientReplyMode = true;
    }

    console.log(`Initialized TicketCache with ${usersWithOpenTickets.length} open tickets`);
  } catch (error) {
    console.error('Failed to initialize TicketCache:', error);
    throw error;
  }
}

/**
 * Retrieves an existing ticket or creates a new one for the given user.
 * @param userId The user ID for which to get or create the ticket.
 * @param username The optional username of the user.
 * @returns The Ticket instance for the given user.
 */
export async function getOrCreateTicket(user: User, message: string): Promise<Ticket | undefined> {
  let ticket = TicketCache[user.user_id];

  if (ticket) {
    return ticket;
  } else {
    ticket = new Ticket(user.user_id, user.username ?? undefined);
    TicketCache[user.user_id] = ticket;

    const msg = await msgOps.create(
      user.user_id,
      user.assistant_id,
      user.thread_id,
      message,
      new Date().getTime() / 1000,
      MessageType.Ticket,
      true,
      0
    );
    if (!msg) {
      console.error('Failed to create ticket message');
      return undefined;
    }

  }
  return ticket;
}

/**
 * Closes a ticket and removes it from the cache.
 * @param userId The user ID associated with the ticket to be closed.
 */
export async function closeTicket(userId: string): Promise<boolean> {
  if (TicketCache[userId]) {
    if (await messageOps.closeAllOpenTicketsByUserId(userId)) {
      delete TicketCache[userId];
      return true;
    }
  }
  return false;
}

/**
 * Retrieves all currently open tickets.
 * @returns An array of all open Ticket instances.
 */
export function getAllOpenTickets(): Ticket[] {
  return Object.values(TicketCache).filter((ticket) => ticket);
}

export function findTicket(userId: string): Ticket | null {
  return TicketCache[userId] ?? null;
}

export function setupAdminReplyState(userId: string) {
  console.log('TicketCache: ', TicketCache)
  if (TicketCache[userId]) {
    TicketCache[userId].adminReplyMode = true;
  }
}

export function setupClientReplyState(userId: string) {
  if (TicketCache[userId]) {
    TicketCache[userId].clientReplyMode = true;
  }
}

export function resetAdminReplyState(userId: string) {
  if (TicketCache[userId]) {
    TicketCache[userId].adminReplyMode = false;
  }
}

export function resetClientReplyState(userId: string) {
  if (TicketCache[userId]) {
    TicketCache[userId].clientReplyMode = false;
  }
}

export function findActiveAdminReplyingTicket(): Ticket | null {
  const ticket = Object.values(TicketCache).find(
    (ticket) => ticket.adminReplyMode
    //(ticket) => ticket.userId === userId
  );
  return ticket ?? null;
}

export function checkClientReplyState(userId: string): boolean {
  return TicketCache[userId]?.clientReplyMode ?? null;
}

export function hasTicket(userId: string): boolean {
  return !!TicketCache[userId];
}
