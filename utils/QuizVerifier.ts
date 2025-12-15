import { sha256 } from 'js-sha256';

export class QuizVerifier {
    /**
     * Generates a hash from a list of answer indices.
     * Use this when CREATING the quiz to generate the 'correct_answer_hash'.
     */
    static generateHash(answerIndices: number[]): string {
        // Ensure consistent formatting (e.g., no extra whitespace)
        return sha256(JSON.stringify(answerIndices));
    }

    /**
     * Verifies a user's answers against the stored hash.
     * Use this when the user clicks 'Submit' on the quiz.
     */
    static verify(userIndices: number[], storedHash: string): boolean {
        const userHash = this.generateHash(userIndices);
        return userHash === storedHash;
    }
}
