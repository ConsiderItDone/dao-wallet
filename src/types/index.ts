import { PublicKey } from "@cidt/near-plugin-js/build/wrap";

export interface AccountData {
  accountId: string;
  privateKey?: string;
  publicKey?: PublicKey;
  isLedger?: boolean;
}

export type Network = "mainnet" | "testnet" | "betanet";

export interface NFT {
  title: string;
  description: string;
  media: string;
  tokenId: string;
  owner: string;
  contractName: string;
}
