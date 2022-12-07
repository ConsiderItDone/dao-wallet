import {
  INJECTED_API_METHOD_QUERY_PARAM_KEY,
  INJECTED_API_NETWORK_QUERY_PARAM_KEY,
  INJECTED_API_QUERY_METHOD_CHANGE_NETWORK,
  INJECTED_API_QUERY_METHOD_CONNECT,
  INJECTED_API_QUERY_METHOD_APPROVE_OPERATION,
  INJECTED_API_TRANSACTION_UUID_QUERY_PARAM_KEY,
  INJECTED_API_WEBSITE_QUERY_PARAM_KEY,
  INJECTED_API_OPERATION_TYPE_QUERY_PARAM_KEY,
} from "./scripts.consts";
import { LocalStorage } from "../services/chrome/localStorage";
import {
  SessionStorage,
  TransactionsData,
  TransactionsDataType,
} from "../services/chrome/sessionStorage";
import { v4 as uuidv4 } from "uuid";

const POPUP_HEIGHT = 640;
const POPUP_WIDTH = 440;

const appLocalStorage = new LocalStorage();
const appSessionStorage = new SessionStorage();

// TODO: do not open more than 5 popups
export async function openPopup(
  query: string = ""
): Promise<chrome.windows.Window> {
  let top = 0;
  let left = 0;

  // Try to position popup in top right corner of last focused window
  try {
    const lastFocusedWindow = await chrome.windows.getLastFocused();
    if (
      lastFocusedWindow?.top &&
      lastFocusedWindow?.left &&
      lastFocusedWindow?.width
    ) {
      top = lastFocusedWindow.top;
      left = lastFocusedWindow.left + (lastFocusedWindow.width - POPUP_WIDTH);
    }
  } catch {}

  return chrome.windows.create({
    url: chrome.runtime.getURL(`index.html${query}`),
    type: "popup",
    height: POPUP_HEIGHT,
    width: POPUP_WIDTH,
    top,
    left,
  });
}

export async function approveOperationWithWallet(
  data: TransactionsData,
  dataType: TransactionsDataType,
  origin: string
): Promise<{
  isApproved: boolean;
  error: string | null;
  transactionsDataUuid: string;
}> {
  const transactionsDataUuid = uuidv4();
  await appSessionStorage.addTransactionsData(
    {
      isApproved: undefined,
      data,
      dataType,
    },
    transactionsDataUuid
  );

  const popup = await openApproveOperationPopup(
    origin,
    transactionsDataUuid,
    dataType
  );

  await waitUntilPopupClosed(popup);

  const transactionsData = await appSessionStorage.getTransactionsData(
    transactionsDataUuid
  );

  let error;
  if (!transactionsData) {
    error = "Internal error: couldn't find signed transaction";
  } else {
    error = null;
  }

  return {
    isApproved: !error && !!transactionsData?.isApproved,
    error,
    transactionsDataUuid,
  };
}

export async function waitUntilPopupClosed(
  popup: chrome.windows.Window | null
): Promise<void> {
  if (popup) {
    return new Promise((resolve) => {
      const listener = (
        tabId: number,
        removeInfo: chrome.tabs.TabRemoveInfo
      ) => {
        if (removeInfo?.windowId === popup.id) {
          chrome.tabs.onRemoved.removeListener(listener);
          resolve();
        }
      };
      chrome.tabs.onRemoved.addListener(listener);
    });
  }
  return;
}

export async function openConnectAccountsPopup(
  website: string
): Promise<chrome.windows.Window> {
  return openPopup(
    `?${INJECTED_API_METHOD_QUERY_PARAM_KEY}=${INJECTED_API_QUERY_METHOD_CONNECT}` +
      `&${INJECTED_API_WEBSITE_QUERY_PARAM_KEY}=${website}`
  );
}

export async function openChangeNetworkPopup(
  website: string,
  networkId: string
): Promise<chrome.windows.Window | null> {
  const currentNetwork = await appLocalStorage.getCurrentNetwork();
  if (currentNetwork?.networkId !== networkId) {
    return openPopup(
      `?${INJECTED_API_METHOD_QUERY_PARAM_KEY}=${INJECTED_API_QUERY_METHOD_CHANGE_NETWORK}` +
        `&${INJECTED_API_WEBSITE_QUERY_PARAM_KEY}=${website}` +
        `&${INJECTED_API_NETWORK_QUERY_PARAM_KEY}=${networkId}`
    );
  }
  return null;
}

export async function openApproveOperationPopup(
  website: string,
  transactionUuid: string,
  operationType: TransactionsDataType
): Promise<chrome.windows.Window> {
  return openPopup(
    `?${INJECTED_API_METHOD_QUERY_PARAM_KEY}=${INJECTED_API_QUERY_METHOD_APPROVE_OPERATION}` +
      `&${INJECTED_API_WEBSITE_QUERY_PARAM_KEY}=${website}` +
      `&${INJECTED_API_TRANSACTION_UUID_QUERY_PARAM_KEY}=${transactionUuid}` +
      `&${INJECTED_API_OPERATION_TYPE_QUERY_PARAM_KEY}=${operationType}`
  );
}
