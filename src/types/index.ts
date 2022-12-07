import { PublicKey } from "@cidt/near-plugin-js/build/wrap";

export interface AccountData {
  accountId: string;
  privateKey?: string;
  publicKey?: PublicKey;
  isLedger?: boolean;
}

export type NetworkID = "mainnet" | "testnet" | "betanet";

export interface Network {
  networkId: NetworkID;
  nodeUrl: string;
}

export interface NFT {
  title: string;
  description: string;
  media: string;
  tokenId: string;
  owner: string;
  contractName: string;
}

export interface NftCollection {
  name: string;
  icon: string;
  contractName: string;
  nfts: NFT[];
}
