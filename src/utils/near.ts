import { KeyStores, NearPluginConfig } from "@cidt/near-plugin-js";
import { AccountWithPrivateKey } from "../services/chrome/localStorage";
import { Network, NetworkID } from "../types";
import { keyStores } from "near-api-js";
import { bignumberToNumber } from "./bignumber";
import { ethers } from "ethers";
import { NEAR_TOKEN } from "../consts/near";
import { PublicKey } from "@cidt/near-plugin-js/build/wrap";
import base58 from "bs58";

function getIndexerServiceUrl(networkId: NetworkID): string {
  switch (networkId) {
    case "testnet":
      return "https://testnet-api.kitwallet.app";
    case "mainnet":
      return "https://api.kitwallet.app";
    default:
      return "https://api.kitwallet.app";
  }
}

function getWalletUrl(networkId: NetworkID): string {
  return `https://wallet.${networkId}.near.org`;
}

function getHelperUrl(networkId: NetworkID): string {
  return `https://helper.${networkId}.near.org`;
}

export function getNearConnectionConfig(
  network: Network,
  keyStore?: KeyStores.KeyStore,
  selectedAccount?: AccountWithPrivateKey
): NearPluginConfig {
  const networkId = network.networkId;
  const walletUrl = getWalletUrl(networkId);
  const helperUrl = getHelperUrl(networkId);
  const indexerServiceUrl = getIndexerServiceUrl(networkId);
  if (!keyStore) {
    keyStore = new keyStores.InMemoryKeyStore();
  }
  const masterAccount = selectedAccount?.accountId || undefined;
  return {
    headers: {},
    networkId: networkId,
    nodeUrl: network.nodeUrl,
    walletUrl,
    helperUrl,
    indexerServiceUrl,
    keyStore,
    masterAccount,
  };
}

export function parseNearTokenAmount(amount: string | number | null) {
  if (!amount) return 0;
  return bignumberToNumber(ethers.BigNumber.from(amount), NEAR_TOKEN.decimals);
}

export function toPublicKey(
  publicKey: string | PublicKey | Buffer,
  toString: boolean = false
): PublicKey | string {
  if (typeof publicKey === "string") {
    const dataStr = publicKey.replace("ed25519:", "");
    return { keyType: 0, data: base58.decode(dataStr) };
  }
  if (publicKey instanceof Buffer) {
    if (toString) {
      return "ed25519:" + base58.encode(publicKey);
    }
    return { keyType: 0, data: publicKey };
  } else return publicKey;
}
