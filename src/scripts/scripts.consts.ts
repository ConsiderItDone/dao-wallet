import { InjectedAPINetwork } from "./injectedAPI/injectedAPI.types";

export const SUPPORTED_NETWORKS = ["testnet", "mainnet"];

// Message targets
export const WALLET_CONTENTSCRIPT_MESSAGE_TARGET =
  "daoWallet#target-contentscript";
export const WALLET_INJECTED_API_MESSAGE_TARGET =
  "daoWallet#target-injectedAPI";

// Message methods
export const INJECTED_API_CONNECT_METHOD = "daoWallet#method-connect";
export const INJECTED_API_DISCONNECT_METHOD = "daoWallet#method-disconnect";

export const INJECTED_API_GET_CONNECTED_ACCOUNTS_METHOD =
  "daoWallet#method-get-connected-accounts";
export const INJECTED_API_GET_NETWORK_METHOD = "daoWallet#method-get-network";

export const INJECTED_API_SHOULD_UPDATE_CONNECTED_ACCOUNTS_METHOD =
  "daoWallet#method-should-update-connected-accounts";
export const INJECTED_API_SHOULD_UPDATE_NETWORK_METHOD =
  "daoWallet#method-should-update-network";

export const INJECTED_API_SIGN_TRANSACTION_METHOD =
  "daoWallet#method-sign-transaction";
export const INJECTED_API_SIGN_TRANSACTIONS_METHOD =
  "daoWallet#method-sign-transactions";
export const CONTENT_SCRIPT_SIGN_TRANSACTION_METHOD =
  "daoWallet#contentScriptMethod-sign-transaction";
export const CONTENT_SCRIPT_SIGN_TRANSACTIONS_METHOD =
  "daoWallet#contentScriptMethod-sign-transactions";

// Events
export const INJECTED_API_INITIALIZED_EVENT_NAME =
  "daoWallet#event-initialized";

// Query params from injected API
export const INJECTED_API_METHOD_QUERY_PARAM_KEY = "injectedApiMethod";
export const INJECTED_API_WEBSITE_QUERY_PARAM_KEY = "website";
export const INJECTED_API_NETWORK_QUERY_PARAM_KEY = "network";
export const INJECTED_API_TRANSACTION_UUID_QUERY_PARAM_KEY = "transactionUuid";

// Injected API methods in query
export const INJECTED_API_QUERY_METHOD_CONNECT = "connect";
export const INJECTED_API_QUERY_METHOD_CHANGE_NETWORK = "changeNetwork";
export const INJECTED_API_QUERY_METHOD_SIGN_TRANSACTION = "signTransaction";

export const UNINITIALIZED_NETWORK: InjectedAPINetwork = {
  networkId: "uninitialized",
  nodeUrl: "",
};
