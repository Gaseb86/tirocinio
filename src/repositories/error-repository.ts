import ErrorLog from "../../src/entities/ErrorLog";

export async function create(error: ErrorLog): Promise<void> {
  try {
    await error.save();
  } catch (error) {
    console.error("Failed to save error log: ", error);
    throw error;
  }
}
