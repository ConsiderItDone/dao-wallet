import bcrypt from "bcryptjs";

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
  // TODO: use encrypt algorithm
  return privateKey;
}

export async function decryptPrivateKeyWithPassword(
  password: string,
  privateKey: string
): Promise<string> {
  // TODO: use decrypt algorithm
  return privateKey;
}
