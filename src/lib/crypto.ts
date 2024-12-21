import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

// In a real app, this should be in an environment variable
const ENCRYPTION_KEY = 'your-secret-encryption-key-min-32-chars!!';
const ALGORITHM = 'aes-256-gcm';

const scryptAsync = promisify(scrypt);

export async function encrypt(text: string): Promise<string> {
  try {
    const iv = randomBytes(12);
    const salt = randomBytes(16);
    const key = (await scryptAsync(ENCRYPTION_KEY, salt, 32)) as Buffer;

    const cipher = createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    // Combine everything into a single string
    // Format: salt:iv:authTag:encryptedData
    const result = Buffer.concat([
      salt,
      iv,
      authTag,
      encrypted,
    ]).toString('base64');

    return result;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

export async function decrypt(encryptedText: string): Promise<string> {
  try {
    const buffer = Buffer.from(encryptedText, 'base64');

    // Extract the pieces
    const salt = buffer.subarray(0, 16);
    const iv = buffer.subarray(16, 28);
    const authTag = buffer.subarray(28, 44);
    const encrypted = buffer.subarray(44);

    const key = (await scryptAsync(ENCRYPTION_KEY, salt, 32)) as Buffer;

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}
