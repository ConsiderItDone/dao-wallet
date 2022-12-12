import { InvokeResult } from "@polywrap/core-js";
import { connect, KeyPair, keyStores } from "near-api-js";
// @ts-ignore
import { generateSeedPhrase } from "near-seed-phrase";
import { getNearConnectionConfig } from "./near";
import { Network } from "../types";
import { PublicKey } from "near-api-js/lib/utils/key_pair";
import { KeyStores } from "@cidt/near-plugin-js";
import { utils as nearApiUtils } from "near-api-js/lib/common-index";

const ACCOUNT_ID_REGEX =
  /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/;

export function isLegitAccountId(accountId: string) {
  return ACCOUNT_ID_REGEX.test(accountId);
}

export function generateNewSeedPhrase(): {
  seedPhrase: string;
  publicKey: string;
  secretKey: string;
} {
  return generateSeedPhrase();
}

export function getPublicKeyByPrivateKey(privateKey: string): PublicKey {
  return KeyPair.fromString(privateKey).getPublicKey();
}

export async function createNewAccount(
  accountId: string,
  privateKey: string,
  network: Network,
  keyStore?: KeyStores.KeyStore
): Promise<void> {
  const nearConnection = await connect(
    getNearConnectionConfig(
      network,
      keyStore || new keyStores.BrowserLocalStorageKeyStore()
    )
  );
  const publicKey: PublicKey = getPublicKeyByPrivateKey(privateKey);
  await nearConnection.accountCreator.createAccount(accountId, publicKey);
}

export async function accountExists(
  accountId: string,
  executeAccountBalanceQuery: (
    args?: Record<string, unknown> | Uint8Array
  ) => Promise<InvokeResult>
): Promise<boolean> {
  try {
    const accountBalance = await executeAccountBalanceQuery({
      accountId: accountId,
    });
    return !!accountBalance?.data;
  } catch (error) {
    return false;
  }
}

export function getImplicitAccountId(publicKey: string): string {
  return nearApiUtils.PublicKey.fromString(
    publicKey.replace("ed25519:", "")
    // @ts-ignore
  ).data.toString("hex");
}
