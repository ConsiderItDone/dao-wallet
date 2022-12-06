import { equals } from "ramda";
import {
  CONTENT_SCRIPT_SIGN_IN_METHOD,
  CONTENT_SCRIPT_SIGN_OUT_METHOD,
  CONTENT_SCRIPT_SIGN_TRANSACTION_METHOD,
  CONTENT_SCRIPT_SIGN_TRANSACTIONS_METHOD,
  INJECTED_API_SHOULD_UPDATE_CONNECTED_ACCOUNTS_METHOD,
  INJECTED_API_SHOULD_UPDATE_NETWORK_METHOD,
  WALLET_CONTENTSCRIPT_MESSAGE_TARGET,
  WALLET_INJECTED_API_MESSAGE_TARGET,
} from "./scripts.consts";
import { InjectedAPIMessage } from "./injectedAPI/injectedAPI.custom.types";
import {
  ChromeRuntimeMessage,
  ContentScriptSignInData,
  ContentScriptSignOutData,
  ContentScriptSignTransactionsData,
} from "./scripts.types";
import {
  LAST_SELECTED_NETWORK_INDEX_KEY,
  NETWORKS_KEY,
} from "../services/chrome/localStorage";
import { SESSION_PASSWORD_KEY } from "../services/chrome/sessionStorage";
import {
  handleContentScriptSignIn,
  handleContentScriptSignOut,
  handleContentScriptSignTransaction,
  handleContentScriptSignTransactions,
  HandleSignInOutResult,
  HandleSignTransactionsResult,
} from "./contentscriptApi";

function injectInpageScript() {
  try {
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement("script");

    scriptTag.async = false;
    scriptTag.src = chrome.runtime.getURL("static/js/inpage.js");

    container.insertBefore(scriptTag, container.children[0]);
    scriptTag.onload = () => scriptTag.remove();
  } catch (error) {
    console.error("DAO Wallet: Provider injection failed.", error);
  }
}

if (shouldInjectApi()) {
  addInpageMessageListener();
  addStorageChangesListener();
  injectInpageScript();
}

function addInpageMessageListener() {
  window.addEventListener("message", (event) => {
    const message: InjectedAPIMessage = event?.data;
    const messageTo: string = message?.target;
    if (
      !chrome.runtime?.id ||
      event.source !== window ||
      messageTo !== WALLET_CONTENTSCRIPT_MESSAGE_TARGET
    ) {
      return;
    }

    // Send message to background messages listener
    chrome.runtime.sendMessage<ChromeRuntimeMessage>(
      { data: message, origin: event.origin },
      async (response) => {
        if (response) {
          const responseMethod = response?.method;
          switch (responseMethod) {
            case CONTENT_SCRIPT_SIGN_TRANSACTION_METHOD: {
              const methodData =
                response?.methodData as ContentScriptSignTransactionsData;
              response = await handleContentScriptSignTransaction(
                methodData?.accounts,
                methodData?.network,
                methodData?.transactionsOptions
              );
              if (!response?.error) {
                delete response.error;
              }
              break;
            }
            case CONTENT_SCRIPT_SIGN_TRANSACTIONS_METHOD: {
              const methodData =
                response?.methodData as ContentScriptSignTransactionsData;
              const signResult: HandleSignTransactionsResult =
                await handleContentScriptSignTransactions(
                  methodData?.accounts,
                  methodData?.network,
                  methodData.transactionsOptions
                );
              if (signResult.error) {
                response = { error: signResult.error };
              } else {
                response = signResult.signedTransactions;
              }
              break;
            }
            case CONTENT_SCRIPT_SIGN_IN_METHOD: {
              const methodData =
                response?.methodData as ContentScriptSignInData;
              const signInResult: HandleSignInOutResult =
                await handleContentScriptSignIn(
                  methodData?.accounts,
                  methodData?.network,
                  methodData?.params
                );
              if (signInResult.error) {
                response = { error: signInResult.error };
              } else {
                response = { success: true };
              }
              break;
            }
            case CONTENT_SCRIPT_SIGN_OUT_METHOD: {
              const methodData =
                response?.methodData as ContentScriptSignOutData;
              const signOutResult: HandleSignInOutResult =
                await handleContentScriptSignOut(
                  methodData?.accounts,
                  methodData?.network,
                  methodData?.params
                );
              if (signOutResult.error) {
                response = { error: signOutResult.error };
              } else {
                response = { success: true };
              }
              break;
            }
            default:
              break;
          }

          // Send response from background script to injected API listener
          const responseMessage: InjectedAPIMessage = {
            id: message.id,
            target: WALLET_INJECTED_API_MESSAGE_TARGET,
            method: message.method,
            response,
          };

          sendMessageToInpage(responseMessage);
        }
      }
    );
  });
}

// Listen to changes in storage and tell about them to injected API listener
function addStorageChangesListener() {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    const shouldUpdateNetwork =
      areaName === "local" &&
      (NETWORKS_KEY in changes || LAST_SELECTED_NETWORK_INDEX_KEY in changes);
    if (shouldUpdateNetwork) {
      sendMessageToInpage({
        target: WALLET_INJECTED_API_MESSAGE_TARGET,
        method: INJECTED_API_SHOULD_UPDATE_NETWORK_METHOD,
      });
    }

    const oldWebsitesData = (changes as any)?.websitesData?.oldValue;
    let oldConnectedAccounts;
    if (oldWebsitesData) {
      oldConnectedAccounts = oldWebsitesData[window.location.origin];
    }

    const newWebsitesData = (changes as any)?.websitesData?.newValue;
    let newConnectedAccounts;
    if (newWebsitesData) {
      newConnectedAccounts = newWebsitesData[window.location.origin];
    }

    const shouldUpdateConnectedAccounts =
      !equals(oldConnectedAccounts, newConnectedAccounts) ||
      (areaName === "session" && SESSION_PASSWORD_KEY in changes);
    if (shouldUpdateConnectedAccounts) {
      sendMessageToInpage({
        target: WALLET_INJECTED_API_MESSAGE_TARGET,
        method: INJECTED_API_SHOULD_UPDATE_CONNECTED_ACCOUNTS_METHOD,
      });
    }
  });
}

function sendMessageToInpage(message: InjectedAPIMessage) {
  window.postMessage(message, window.location.origin);
}

function doctypeCheck() {
  const doctype = window.document.doctype;
  if (doctype) {
    return doctype.name === "html";
  } else {
    return true;
  }
}

function suffixCheck() {
  const prohibitedTypes = ["xml", "pdf"];
  const currentUrl = window.location.href;
  let currentRegex;
  for (let i = 0; i < prohibitedTypes.length; i++) {
    currentRegex = new RegExp(`\\.${prohibitedTypes[i]}$`);
    if (currentRegex.test(currentUrl)) {
      return false;
    }
  }
  return true;
}

function httpCheck() {
  return window?.location?.origin?.startsWith("http");
}

function documentElementCheck() {
  const documentElement = document.documentElement.nodeName;
  if (documentElement) {
    return documentElement.toLowerCase() === "html";
  }
  return true;
}

// Checks if wallet api should be injected in window
function shouldInjectApi() {
  return (
    doctypeCheck() && suffixCheck() && documentElementCheck() && httpCheck()
  );
}
