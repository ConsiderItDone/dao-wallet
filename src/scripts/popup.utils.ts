import {
  INJECTED_API_METHOD_QUERY_PARAM_KEY,
  INJECTED_API_NETWORK_QUERY_PARAM_KEY,
  INJECTED_API_QUERY_METHOD_CHANGE_NETWORK,
  INJECTED_API_QUERY_METHOD_CONNECT,
  INJECTED_API_QUERY_METHOD_SIGN_TRANSACTION,
  INJECTED_API_TRANSACTION_UUID_QUERY_PARAM_KEY,
  INJECTED_API_WEBSITE_QUERY_PARAM_KEY,
} from "./scripts.consts";
import { LocalStorage } from "../services/chrome/localStorage";

const POPUP_HEIGHT = 640;
const POPUP_WIDTH = 440;

const appLocalStorage = new LocalStorage();

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

export async function openApproveSignTransactionsPopup(
  website: string,
  transactionUuid: string
): Promise<chrome.windows.Window> {
  return openPopup(
    `?${INJECTED_API_METHOD_QUERY_PARAM_KEY}=${INJECTED_API_QUERY_METHOD_SIGN_TRANSACTION}` +
      `&${INJECTED_API_WEBSITE_QUERY_PARAM_KEY}=${website}` +
      `&${INJECTED_API_TRANSACTION_UUID_QUERY_PARAM_KEY}=${transactionUuid}`
  );
}
