/**
 * Calculates the Levenshtein distance between two strings.
 * @param {string} a - The first string.
 * @param {string} b - The second string.
 * @returns {number} The Levenshtein distance between the two strings.
 */
export function levenshteinDistance(a: string, b: string): number {
    const matrix = [];

    // If one of the strings is empty
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    // Initialize the matrix
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Populate the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Compares two messages and returns whether they are similar based on the Levenshtein distance.
 * @param {string} message1 - The first message.
 * @param {string} message2 - The second message.
 * @param {number} [threshold=0.3] - The threshold for similarity (default is 30%).
 * @returns {boolean} True if the messages are similar, otherwise false.
 */
export function isSimilar(message1: string, message2: string, threshold = 0.3): boolean {
    const distance = levenshteinDistance(message1.toLowerCase(), message2.toLowerCase());
    const maxLen = Math.max(message1.length, message2.length);

    // Return true if the similarity ratio is within the threshold
    return (distance / maxLen) < threshold;
}
