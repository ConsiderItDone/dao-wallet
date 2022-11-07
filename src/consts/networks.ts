import { Network, NetworkID } from "../types";

export const TESTNET: Network = {
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
};

export const MAINNET: Network = {
  networkId: "mainnet",
  nodeUrl: "https://rpc.mainnet.near.org",
};

export const DEFAULT_NETWORKS: Network[] = [TESTNET, MAINNET];
export const DEFAULT_NETWORKS_IDS: NetworkID[] = DEFAULT_NETWORKS.map(
  (network) => network.networkId
);

export const DEFAULT_NETWORK_ID: NetworkID =
  DEFAULT_NETWORKS_IDS.find(
    (id) => process.env.REACT_APP_DEFAULT_NETWORK_ID === id
  ) || "testnet";
export const DEFAULT_NETWORK: Network =
  DEFAULT_NETWORKS.find(
    (network) => network.networkId === DEFAULT_NETWORK_ID
  ) || TESTNET;
