import { Network } from "../types";

export const TESTNET: Network = {
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
  explorerUrl: "https://explorer.testnet.near.org",
  indexerServiceUrl: "https://testnet-api.kitwallet.app",
  walletUrl: "https://wallet.testnet.near.org",
  helperUrl: "https://helper.testnet.near.org",
};

export const MAINNET: Network = {
  networkId: "mainnet",
  nodeUrl: "https://rpc.mainnet.near.org",
  explorerUrl: "https://explorer.near.org",
  indexerServiceUrl: "https://api.kitwallet.app",
  walletUrl: "https://wallet.near.org/",
  helperUrl: "https://helper.mainnet.near.org",
};

export const DEFAULT_NETWORKS: Network[] = [TESTNET, MAINNET];
