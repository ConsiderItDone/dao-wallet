import {
  InjectedAPIConnectParams,
  InjectedAPINetwork,
  InjectedAPISignInParamsDTO,
  InjectedAPISignOutParamsDTO,
  InjectedAPISignTransactionParams,
  InjectedAPITransactionOptions,
} from "./injectedAPI/injectedAPI.types";
import {
  CONTENT_SCRIPT_SIGN_IN_METHOD,
  CONTENT_SCRIPT_SIGN_OUT_METHOD,
  CONTENT_SCRIPT_SIGN_TRANSACTION_METHOD,
  CONTENT_SCRIPT_SIGN_TRANSACTIONS_METHOD,
  SUPPORTED_NETWORKS,
  UNINITIALIZED_NETWORK,
} from "./scripts.consts";
import {
  ContentScriptSignInData,
  ContentScriptSignOutData,
  ContentScriptSignTransactionsData,
} from "./scripts.types";
import {
  LocalStorage,
  LocalStorageWebsiteConnectedAccount,
} from "../services/chrome/localStorage";
import {
  openChangeNetworkPopup,
  openConnectAccountsPopup,
  waitUntilPopupClosed,
  approveOperationWithWallet,
} from "./popup.utils";
import { SessionStorage } from "../services/chrome/sessionStorage";

const appLocalStorage = new LocalStorage();
const appSessionStorage = new SessionStorage();

export async function handleGetNetwork(
  sendResponse: (network: InjectedAPINetwork) => void
): Promise<void> {
  const currentNetwork = await appLocalStorage.getCurrentNetwork();
  sendResponse(currentNetwork || UNINITIALIZED_NETWORK);
  return;
}

export async function handleGetConnectedAccounts(
  origin: string,
  sendResponse: (response: LocalStorageWebsiteConnectedAccount[]) => void
): Promise<void> {
  if (!origin) {
    sendResponse([]);
  }

  const accounts = await appLocalStorage.getWebsiteConnectedAccounts(origin);
  sendResponse(accounts || []);
  return;
}

export async function handleConnect(
  origin: string,
  params: InjectedAPIConnectParams,
  sendResponse: (data: any) => void
): Promise<void> {
  const userHasAccounts = await appLocalStorage.hasAnyAccount();
  if (!userHasAccounts) {
    sendResponse({ error: "User has no accounts in extension" });
    return;
  }

  const shouldOpenChangeNetworkPopup =
    params?.networkId && SUPPORTED_NETWORKS.indexOf(params.networkId) > -1;

  let popup: chrome.windows.Window | null;
  try {
    popup = shouldOpenChangeNetworkPopup
      ? await openChangeNetworkPopup(origin, params.networkId)
      : await openConnectAccountsPopup(origin);
  } catch (error: any) {
    sendResponse({ error: error?.message || "Failed to open new tab" });
    return;
  }

  await waitUntilPopupClosed(popup);

  handleGetConnectedAccounts(origin, sendResponse);
  return;
}

export async function handleDisconnect(
  origin: string,
  sendResponse: (data: any) => void
): Promise<void> {
  if (!origin) {
    sendResponse([]);
    return;
  }

  await appLocalStorage.setWebsiteConnectedAccounts(origin, []);
  sendResponse([]);
  return;
}

export async function handleSignTransaction(
  origin: string,
  params: InjectedAPISignTransactionParams,
  sendResponse: (data: any) => void
): Promise<void> {
  handleSignTransactions(origin, [params.transaction], sendResponse, true);
}

export async function handleSignTransactions(
  origin: string,
  transactionsOptions: InjectedAPITransactionOptions[],
  sendResponse: (data: any) => void,
  isHandleSingleTransaction = false
): Promise<void> {
  try {
    const { isApproved, error } = await approveOperationWithWallet(
      transactionsOptions,
      "signTransactions",
      origin
    );
    if (error || !isApproved) {
      sendResponse({
        error: error || "User rejected request",
      });
      return;
    }

    // Send response with all needed data to contentscript and sign transactions there
    const currentNetwork = await appLocalStorage.getCurrentNetwork();
    if (!currentNetwork || currentNetwork === UNINITIALIZED_NETWORK) {
      sendResponse({
        error: "Network is not initialized",
      });
      return;
    }

    const sessionPassword = await appSessionStorage.getPassword();
    if (!sessionPassword) {
      sendResponse({
        error: "User is not logged into extension",
      });
      return;
    }

    const accounts = await appLocalStorage.getAccounts();
    const selectedAccounts = [];
    for (const transactionOption of transactionsOptions) {
      const selectedAccount = accounts?.find(
        (account) => account.accountId === transactionOption.signerId
      );
      if (!selectedAccount) {
        sendResponse({
          error: `Couldn't find signer account ${transactionOption.signerId}`,
        });
        return;
      }
      selectedAccounts.push(selectedAccount);
    }

    const contentScriptSignTransactionData: ContentScriptSignTransactionsData =
      {
        network: currentNetwork,
        accounts: selectedAccounts,
        transactionsOptions: transactionsOptions,
      };
    sendResponse({
      method: isHandleSingleTransaction
        ? CONTENT_SCRIPT_SIGN_TRANSACTION_METHOD
        : CONTENT_SCRIPT_SIGN_TRANSACTIONS_METHOD,
      methodData: contentScriptSignTransactionData,
    });
  } catch (error: any) {
    console.error("Failed to sign transaction", error);
    sendResponse({ error: error?.message || "Failed to sign transaction" });
  }
}

async function handleSignInOrOut(
  origin: string,
  params: InjectedAPISignInParamsDTO | InjectedAPISignOutParamsDTO,
  sendResponse: (data: any) => void,
  type: "signIn" | "signOut"
): Promise<void> {
  try {
    const { isApproved, error } = await approveOperationWithWallet(
      params,
      type,
      origin
    );
    if (error || !isApproved) {
      sendResponse({
        error: error || "User rejected request",
      });
      return;
    }

    // Send response with all needed data to contentscript and sign transactions there
    const currentNetwork = await appLocalStorage.getCurrentNetwork();
    if (!currentNetwork || currentNetwork === UNINITIALIZED_NETWORK) {
      sendResponse({
        error: "Network is not initialized",
      });
      return;
    }

    const sessionPassword = await appSessionStorage.getPassword();
    if (!sessionPassword) {
      sendResponse({
        error: "User is not logged into extension",
      });
      return;
    }

    const accounts = await appLocalStorage.getAccounts();
    const selectedAccounts = [];
    for (const signInOutAccount of params.accounts) {
      const selectedAccount = accounts?.find(
        (account) => account.accountId === signInOutAccount.accountId
      );
      if (!selectedAccount) {
        sendResponse({
          error: `Couldn't find account ${signInOutAccount.accountId} in extension`,
        });
        return;
      }
      selectedAccounts.push(selectedAccount);
    }

    const contentScriptSignInOutData:
      | ContentScriptSignInData
      | ContentScriptSignOutData = {
      network: currentNetwork,
      accounts: selectedAccounts,
      params,
    };
    sendResponse({
      method:
        type === "signIn"
          ? CONTENT_SCRIPT_SIGN_IN_METHOD
          : CONTENT_SCRIPT_SIGN_OUT_METHOD,
      methodData: contentScriptSignInOutData,
    });
  } catch (error: any) {
    console.error("Failed to sign in", error);
    sendResponse({ error: error?.message || "Failed to sign in" });
  }
}

export async function handleSignIn(
  origin: string,
  params: InjectedAPISignInParamsDTO,
  sendResponse: (data: any) => void
): Promise<void> {
  return handleSignInOrOut(origin, params, sendResponse, "signIn");
}

export async function handleSignOut(
  origin: string,
  params: InjectedAPISignOutParamsDTO,
  sendResponse: (data: any) => void
): Promise<void> {
  return handleSignInOrOut(origin, params, sendResponse, "signOut");
}
