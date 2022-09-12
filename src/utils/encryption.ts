import bcrypt from "bcryptjs";
import passworder from "@metamask/browser-passworder";

const salt = bcrypt.genSaltSync(10);

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, salt);
}

export function isPasswordCorrect(
  password: string,
  hashedPassword: string
): boolean {
  return bcrypt.compareSync(password, hashedPassword);
}

export async function encryptPrivateKeyWithPassword(
  password: string,
  privateKey: string
): Promise<string> {
  return passworder.encrypt(password, privateKey);
}

export async function decryptPrivateKeyWithPassword(
  password: string,
  encryptedPrivateKey: string
): Promise<string> {
  return passworder.decrypt(password, encryptedPrivateKey);
}
