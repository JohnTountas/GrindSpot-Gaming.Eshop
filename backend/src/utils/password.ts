/**
 * Password hashing and verification helpers using bcrypt.
 */
import bcrypt from 'bcryptjs';

// Number of bcrypt salt rounds used for password hashing.
const SALT_ROUNDS = 10;

// Hashes a plaintext password for secure storage.
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

// Compares a plaintext password with its stored bcrypt hash.
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
