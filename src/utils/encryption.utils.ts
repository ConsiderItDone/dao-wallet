import bcrypt from "bcryptjs";
//const Cryptr = require("cryptr");

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

/*export function encryptDataWithPassword(
  password: string,
  data: string
): Promise<string> {
  const cryptr = new Cryptr(password);
  return cryptr.encrypt(data);
}

export function decryptDataWithPassword(
  password: string,
  data: string
): Promise<string> {
  const cryptr = new Cryptr(password);
  return cryptr.decrypt(data);
}*/
