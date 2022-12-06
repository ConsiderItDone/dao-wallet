import {
  INJECTED_API_CONNECT_METHOD,
  INJECTED_API_DISCONNECT_METHOD,
  INJECTED_API_GET_CONNECTED_ACCOUNTS_METHOD,
  INJECTED_API_GET_NETWORK_METHOD,
  INJECTED_API_SIGN_IN_METHOD,
  INJECTED_API_SIGN_OUT_METHOD,
  INJECTED_API_SIGN_TRANSACTION_METHOD,
  INJECTED_API_SIGN_TRANSACTIONS_METHOD,
} from "./scripts.consts";
import { InjectedAPIMessage } from "./injectedAPI/injectedAPI.custom.types";
import { ChromeRuntimeMessage } from "./scripts.types";
import { InjectedAPISignTransactionsParams } from "./injectedAPI/injectedAPI.types";
import {
  handleConnect,
  handleDisconnect,
  handleGetConnectedAccounts,
  handleGetNetwork,
  handleSignIn,
  handleSignOut,
  handleSignTransaction,
  handleSignTransactions,
} from "./backgroundApi";

if (chrome?.runtime) {
  // Catch messages from content script
  chrome.runtime.onMessage.addListener(function (
    message: ChromeRuntimeMessage,
    sender,
    sendResponse
  ) {
    const origin = message?.origin;
    const messageData: InjectedAPIMessage = message?.data;
    const method = messageData?.method;
    const params = messageData?.params;
    console.info("[BackgroundMessage]:", {
      method,
      params,
      origin,
    });
    // Returning true means that response will be sent asynchronously
    switch (method) {
      case INJECTED_API_CONNECT_METHOD:
        handleConnect(origin, params, sendResponse);
        return true;
      case INJECTED_API_DISCONNECT_METHOD:
        handleDisconnect(origin, sendResponse);
        return true;
      case INJECTED_API_GET_CONNECTED_ACCOUNTS_METHOD:
        handleGetConnectedAccounts(origin, sendResponse);
        return true;
      case INJECTED_API_GET_NETWORK_METHOD:
        handleGetNetwork(sendResponse);
        return true;
      case INJECTED_API_SIGN_TRANSACTION_METHOD:
        handleSignTransaction(origin, params, sendResponse);
        return true;
      case INJECTED_API_SIGN_TRANSACTIONS_METHOD:
        handleSignTransactions(
          origin,
          (params as InjectedAPISignTransactionsParams).transactions,
          sendResponse
        );
        return true;
      case INJECTED_API_SIGN_IN_METHOD:
        handleSignIn(origin, params, sendResponse);
        return true;
      case INJECTED_API_SIGN_OUT_METHOD:
        handleSignOut(origin, params, sendResponse);
        return true;
      default:
        sendResponse();
        break;
    }
  });
}
