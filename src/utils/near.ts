import { KeyStores } from "@cidt/near-plugin-js";
import { AccountWithPrivateKey } from "../services/chrome/localStorage";
import { Network } from "../types";
import { keyStores } from "near-api-js";

export function getNearConnectionConfig(
  networkId: Network,
  keyStore?: KeyStores.KeyStore,
  selectedAccount?: AccountWithPrivateKey
) {
  return {
    headers: {},
    networkId: networkId,
    nodeUrl: `https://rpc.${networkId}.near.org`,
    walletUrl: `https://wallet.${networkId}.near.org`,
    helperUrl: `https://helper.${networkId}.near.org`,
    keyStore: keyStore || new keyStores.InMemoryKeyStore(),
    masterAccount: selectedAccount?.accountId || undefined,
  };
}
