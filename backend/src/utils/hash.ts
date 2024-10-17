import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Hashes a plain text password.
 * @param password - The plain text password.
 * @returns The hashed password.
 */
export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares a plain text password with a hash.
 * @param password - The plain text password.
 * @param hash - The hashed password.
 * @returns True if the passwords match, false otherwise.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}
