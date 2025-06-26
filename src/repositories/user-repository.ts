import axios from "axios";
import User from "../../src/entities/User";
import { KONSOLEX_ENDPOINT } from "../../src/utils/endpoint";

/**
 * Creates and saves a new User entity to the database.
 * @param {string} user_id - The user ID associated with the user obtained from the endpoint.
 * @param {string} thread_id - The thread ID associated with the user.
 * @param {string} assistant_id - The assistant ID associated with the user.
 * @param {string} telegram_id - The Telegram ID of the user.
 * @param {string} [username] - Optional. The username of the user.
 * @returns {Promise<User>} A promise that resolves with the newly created User entity.
 * @throws {Error} Throws an error if there is a failure in saving the user.
 */
export async function create(
  user_id: string,
  thread_id: string,
  assistant_id: string,
  telegram_id?: string,
  username?: string
): Promise<User> {
  try {
    const newUser = await User.create({
      user_id,
      thread_id,
      assistant_id,
      telegram_id,
      username,
      last_time_used: new Date(),
    });

    const response = await axios.post(
      KONSOLEX_ENDPOINT.TELEGRAM_ID,
      {
        telegramID: telegram_id,
        userid: user_id,
      },
      {
        headers: {
          userid: user_id,
        },
        validateStatus: () => true,
      }
    );
    console.log(response.status);
    console.log(response.data);
    console.log("User saved successfully");
    return newUser;
  } catch (error) {
    console.error("Error saving user:", error);
    throw error;
  }
}

/**
 * Finds a user by their Telegram ID.
 * @param {string} telegram_id - The Telegram ID of the user to find.
 * @returns {Promise<User | null>} A promise that resolves with the User entity if found, or null if not found.
 * @throws {Error} Throws an error if the search operation fails.
 */
export async function findByTelegramId(
  telegram_id: string
): Promise<User | null> {
  try {
    return await User.findOne({
      where: { telegram_id },
    });
  } catch (error) {
    console.error(
      `Error in finding user with Telegram ID = ${telegram_id}:`,
      error
    );
    throw error;
  }
}

/**
 * Updates the thread ID of an existing user by their Telegram ID.
 * @param {string} tg_id - The Telegram ID of the user to update.
 * @param {string} newThreadId - The new thread ID to be set for the user.
 * @returns {Promise<boolean>} A promise that resolves to true if the update was successful, false otherwise.
 * @throws {Error} Throws an error if the update operation fails.
 */
export async function updateThreadByTgId(
  tg_id: string,
  newThreadId: string
): Promise<boolean> {
  try {
    const userToUpdate = await findByTelegramId(tg_id);
    if (!userToUpdate) return false;

    userToUpdate.thread_id = newThreadId;
    await userToUpdate.save();
    console.log("User's thread_id updated");
    return true;
  } catch (err) {
    console.error("Error in updating user's thread_id:", err);
    throw err;
  }
}
/**
 * Updates the thread ID of a user by their User ID.
 * @param {string} user_id - The User ID of the user.
 * @param {string} newThreadId - The new thread ID to be set for the user.
 * @returns {Promise<boolean>} A promise that resolves to true if the update was successful, false otherwise.
 * @throws {Error} Throws an error if the update operation fails.
 */
export async function updateThreadByUserId(
  user_id: string,
  newThreadId: string
): Promise<boolean> {
  try {
    const userToUpdate = await findByUserId(user_id);
    if (!userToUpdate) return false;

    userToUpdate.thread_id = newThreadId;
    await userToUpdate.save();
    console.log("User's thread_id updated");
    return true;
  }
  catch (err) {
    console.error("Error in updating user's thread_id:", err);
    throw err;
  }
}

/**
 * Updates the assistant ID of a user by their Telegram ID.
 * @param {string} tg_id - The Telegram ID of the user.
 * @param {string} newAssistantId - The new assistant ID to be set for the user.
 * @returns {Promise<boolean>} A promise that resolves to true if the update was successful, false otherwise.
 * @throws {Error} Throws an error if the update operation fails.
 */
export async function updateAssistantByTelegramId(
  tg_id: string,
  newAssistantId: string
): Promise<boolean> {
  try {
    const userToUpdate = await findByTelegramId(tg_id);
    if (!userToUpdate) return false;

    userToUpdate.assistant_id = newAssistantId;
    await userToUpdate.save();
    console.log("User's assistant_id updated");
    return true;
  } catch (err) {
    console.error("Error in updating user's assistant_id:", err);
    throw err;
  }
}

/**
 * 
  * @param user_id The user ID of the user.
  * @param newAssistantId The assistant ID to set for the user.
  * @returns A promise that resolves to true if the set was successful, false otherwise.
  * @throws {Error} Throws an error if updating the assistant ID fails.
 */
export async function updateAssistantByUserId(
  user_id: string,
  newAssistantId: string
): Promise<boolean> {
  try {
    const userToUpdate = await findByUserId(user_id);
    if (!userToUpdate) return false;

    userToUpdate.assistant_id = newAssistantId;
    await userToUpdate.save();
    console.log("User's assistant_id updated");
    return true;
  } catch (err) {
    console.error("Error in updating user's assistant_id:", err);
    throw err;
  }
}

/**
 * Deletes a user by their Telegram ID.
 * @param {string} tg_id - The Telegram ID of the user to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if the user was successfully deleted, false otherwise.
 * @throws {Error} Throws an error if the delete operation fails.
 */
export async function deleteByTelegramId(tg_id: string): Promise<boolean> {
  try {
    const userToDelete = await findByTelegramId(tg_id);
    if (!userToDelete) return false;

    await userToDelete.destroy();
    console.log("User removed successfully");
    return true;
  } catch (err) {
    console.error("Failed to remove user:", err);
    throw err;
  }
}

/**
 * Updates the last time used property of a user by their Telegram ID to the current date and time.
 * @param {string} user_id - The User ID of the user.
 * @returns {Promise<boolean>} A promise that resolves to true if the update was successful, false otherwise.
 * @throws {Error} Throws an error if the update operation fails.
 */
export async function updateLastTimeUsedByUserId(
  user_id: string
): Promise<boolean> {
  try {
    const userToUpdate = await findByUserId(user_id);
    if (!userToUpdate) return false;

    userToUpdate.last_time_used = new Date();
    await userToUpdate.save();
    console.log("User's last time used updated");
    return true;
  } catch (err) {
    console.error("Error in updating user's last time used:", err);
    throw err;
  }
}

/**
 * Fetches all users from the database.
 * @returns {Promise<User[]>} A promise that resolves with an array of User entities.
 * @throws {Error} Throws an error if fetching the users fails.
 */
export async function fetchAll(): Promise<User[]> {
  try {
    return await User.findAll();
  } catch (err) {
    console.error("Failed to fetch all users:", err);
    throw err;
  }
}

/**
 * Finds a User entity by its thread ID. It returns the found User entity,
 * or null if no user is found with the provided thread ID.
 *
 * @param {string} threadId - The thread ID to search for.
 * @returns {Promise<User | null>} A promise that resolves with the User entity found, or null if not found.
 * @throws {Error} Throws an error if the search operation fails.
 */
export async function findByThreadId(threadId: string): Promise<User | null> {
  try {
    const user = await User.findOne({
      where: { thread_id: threadId },
    });
    if (user) {
      return user;
    }
    return null;
  } catch (err) {
    console.error("Failed to find user by thread ID");
    throw err;
  }
}

/**
 * Updates a user's username based on their User ID.
 *
 * If the user is found and the new username is different from the existing one,
 * the username is updated and the function returns true. If the user doesn't exist
 * or the username is unchanged, the function returns false.
 *
 * @param {string} user_id - The User ID of the user.
 * @param {string} newUsername - The new username to be set.
 * @returns {Promise<boolean>} True if the update was successful, otherwise false.
 * @throws {Error} Throws an error if updating the username fails.
 */
export async function updateUsernameByUserId(
  user_id: string,
  newUsername: string
): Promise<boolean> {
  try {
    const userToUpdate = await findByUserId(user_id);
    if (!userToUpdate) return false;

    if (userToUpdate.username === newUsername) return false;

    userToUpdate.username = newUsername;
    await userToUpdate.save();
    console.log("User's username updated");
    return true;
  } catch (err) {
    console.error("Error in updating user's username:", err);
    throw err;
  }
}

/**
 * Sets the Telegram ID of a user by their user ID.
 * @param user_id The user ID of the user.
 * @param telegram_id The Telegram ID to set for the user.
 * @returns A promise that resolves to true if the set was successful, false otherwise.
 */

export async function setTelegramIdByUserId(
  user_id: string,
  telegram_id: string
): Promise<boolean> {
  try {
    const userToUpdate = await User.findOne({
      where: { user_id },
    });
    if (!userToUpdate) return false;

    userToUpdate.telegram_id = telegram_id;
    await userToUpdate.save();
    const response = await axios.post(
      KONSOLEX_ENDPOINT.TELEGRAM_ID,
      {
        telegramID: telegram_id,
        userid: user_id,
      },
      {
        headers: {
          userid: user_id,
        },
        validateStatus: () => true,
      }
    );
    console.log(response.status);
    console.log(response.data);
    console.log("User's telegram_id set");
    return true;
  } catch (err) {
    console.error("Error in updating user's telegram_id:", err);
    throw err;
  }
}

/**
 * Finds a user by their user ID.
 * @param user_id
 * @returns A promise that resolves with the User entity if found, or null if not found.
 */
export async function findByUserId(user_id: string): Promise<User | null> {
  try {
    return await User.findOne({
      where: { user_id },
    });
  } catch (err) {
    console.error("Failed to find user by user ID");
    throw err;
  }
}
