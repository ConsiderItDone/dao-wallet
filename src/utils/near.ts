import { KeyStores } from "@cidt/near-plugin-js";
import { AccountWithPrivateKey } from "../services/chrome/localStorage";
import { Network } from "../types";
import { keyStores } from "near-api-js";
import { bignumberToNumber } from "./bignumber";
import { ethers } from "ethers";
import { NEAR_TOKEN } from "../consts/near";

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

export function parseNearTokenAmount(amount: string | number | null) {
  if (!amount) return 0;
  return bignumberToNumber(ethers.BigNumber.from(amount), NEAR_TOKEN.decimals);
}
