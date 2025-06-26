import Score from "../../src/entities/Score";

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
  answer: string,
  reply: string,
  score: number
): Promise<Score> {
  try {
    const newScore = await Score.create({
      answer,
      reply,
      score
    });

    console.log("Score saved successfully");
    return newScore;
  } catch (error) {
    console.error("Error saving user:", error);
    throw error;
  }
}
