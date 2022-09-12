import {
  ACCOUNTS_KEY,
  WalletAccount,
  LAST_SELECTED_ACCOUNT_INDEX_KEY,
  LOCAL_STORAGE_CHANGED_EVENT_KEY,
  LocalStorage,
} from "../services/chrome/localStorage";
import { useEffect, useState } from "react";

const isInDevelopmentMode = process?.env?.NODE_ENV === "development";

const appLocalStorage = new LocalStorage();

export const useAccount = (): WalletAccount | null => {
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [forceUpdateAccount, setForceUpdateAccount] = useState<boolean>(false);

  useEffect(() => {
    const updateCurrentAccount = async () => {
      const currentAccount = await appLocalStorage.getCurrentAccount();
      if (!currentAccount) {
        setAccount(null);
      } else {
        setAccount(currentAccount);
      }
    };

    updateCurrentAccount().catch(() => {
      setAccount(null);
    });
  }, [forceUpdateAccount]);

  useEffect(() => {
    if (chrome?.storage?.onChanged) {
      const onChange = (changes: object, areaName: string) => {
        if (
          areaName === "local" &&
          (ACCOUNTS_KEY in changes ||
            LAST_SELECTED_ACCOUNT_INDEX_KEY in changes)
        ) {
          setForceUpdateAccount((prevState) => !prevState);
        }
      };

      chrome.storage.onChanged.addListener(onChange);
      return () => {
        chrome.storage.onChanged.removeListener(onChange);
      };
    } else if (isInDevelopmentMode) {
      const onChange = () => {
        setForceUpdateAccount((prevState) => !prevState);
      };

      window.addEventListener(LOCAL_STORAGE_CHANGED_EVENT_KEY, onChange);
      return () => {
        window.removeEventListener(LOCAL_STORAGE_CHANGED_EVENT_KEY, onChange);
      };
    }
  }, []);

  return account;
};
