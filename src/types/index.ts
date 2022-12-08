export type NetworkID = "mainnet" | "testnet" | "betanet" | string;

export interface Network {
  networkId: NetworkID;
  nodeUrl: string;
  explorerUrl: string;
  indexerServiceUrl: string;
  walletUrl: string;
  helperUrl: string;
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
