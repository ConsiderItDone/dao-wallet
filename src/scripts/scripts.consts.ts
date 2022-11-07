import { InjectedAPINetwork } from "./injectedAPI.types";

// Message targets
export const WALLET_CONTENTSCRIPT_MESSAGE_TARGET =
  "omniWallet#target-contentscript";
export const WALLET_INJECTED_API_MESSAGE_TARGET =
  "omniWallet#target-injectedAPI";

// Message methods
export const INJECTED_API_CONNECT_METHOD = "omniWallet#method-connect";
export const INJECTED_API_GET_CONNECTED_ACCOUNTS_METHOD =
  "omniWallet#method-get-connected-accounts";
export const INJECTED_API_GET_NETWORK_METHOD = "omniWallet#method-get-network";

// Events
export const INJECTED_API_INITIALIZED_EVENT_NAME =
  "omniWallet#event-initialized";
export const CONNECTED_ACCOUNTS_UPDATED_EVENT =
  "omniWallet#event-connected-accounts-updated";

// Query params from injected API
export const INJECTED_API_METHOD_QUERY_PARAM_KEY = "injectedApiMethod";

export const UNINITIALIZED_NETWORK: InjectedAPINetwork = {
  networkId: "uninitialized",
  nodeUrl: "",
};
