import {
  InjectedAPIConnectParams,
  InjectedAPINetwork,
  InjectedAPISignTransactionParams,
  InjectedAPITransactionOptions,
} from "./injectedAPI/injectedAPI.types";
import {
  CONTENT_SCRIPT_SIGN_TRANSACTION_METHOD,
  CONTENT_SCRIPT_SIGN_TRANSACTIONS_METHOD,
  SUPPORTED_NETWORKS,
  UNINITIALIZED_NETWORK,
} from "./scripts.consts";
import { ContentScriptSignTransactionsData } from "./scripts.types";
import {
  LocalStorage,
  LocalStorageWebsiteConnectedAccount,
} from "../services/chrome/localStorage";
import {
  openChangeNetworkPopup,
  openConnectAccountsPopup,
  openApproveSignTransactionsPopup,
  waitUntilPopupClosed,
} from "./popup.utils";
import { v4 as uuidv4 } from "uuid";
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
  const userHasAccounts = await appLocalStorage.hasAccount();
  if (!userHasAccounts) {
    sendResponse({ error: "User has no accounts in extension" });
    return;
  }

  const shouldOpenChangeNetworkPopup =
    params?.networkId && SUPPORTED_NETWORKS.indexOf(params.networkId) > -1;
  const popup: chrome.windows.Window | null = shouldOpenChangeNetworkPopup
    ? await openChangeNetworkPopup(origin, params.networkId)
    : await openConnectAccountsPopup(origin);

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
    const transactionsUuid = uuidv4();
    await appSessionStorage.addTransactions(
      {
        areApproved: undefined,
        transactionsOptions,
      },
      transactionsUuid
    );

    const popup = await openApproveSignTransactionsPopup(
      origin,
      transactionsUuid
    );

    await waitUntilPopupClosed(popup);

    const transactions = await appSessionStorage.getTransaction(
      transactionsUuid
    );

    if (!transactions) {
      sendResponse({
        error: "Internal error: couldn't find signed transaction",
      });
      return;
    }
    if (!transactions.areApproved) {
      sendResponse({
        error: "User rejected signing",
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
    for (const transactionOption of transactions.transactionsOptions) {
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
    return;
  } catch (error: any) {
    console.error("Failed to sign transaction", error);
    sendResponse({ error: error?.message || "Failed to sign transaction" });
  }
}
