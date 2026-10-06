import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;

  return `scrypt$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  const [algorithm, saltHex, keyHex] = passwordHash.split("$");

  if (algorithm !== "scrypt" || !saltHex || !keyHex) {
    return false;
  }

  const expectedKey = Buffer.from(keyHex, "hex");
  if (expectedKey.length !== KEY_LENGTH) {
    return false;
  }

  const actualKey = (await scrypt(password, Buffer.from(saltHex, "hex"), KEY_LENGTH)) as Buffer;
  return timingSafeEqual(actualKey, expectedKey);
}
