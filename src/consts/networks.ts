import { Network } from "../types";

export const TESTNET: Network = {
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
};

export const MAINNET: Network = {
  networkId: "mainnet",
  nodeUrl: "https://rpc.mainnet.near.org",
};

export const DEFAULT_NETWORKS: Network[] = [TESTNET, MAINNET];
