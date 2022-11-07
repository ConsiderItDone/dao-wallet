import {
  ACCOUNTS_KEY,
  AccountWithPrivateKey,
  LAST_SELECTED_ACCOUNT_INDEX_KEY,
  LOCAL_STORAGE_ACCOUNT_CHANGED_EVENT_KEY,
  LocalStorage,
} from "../services/chrome/localStorage";
import { useEffect, useState } from "react";
import { IS_IN_DEVELOPMENT_MODE } from "../consts/app";

const appLocalStorage = new LocalStorage();

export const useAccount = (): AccountWithPrivateKey | null => {
  const [account, setAccount] = useState<AccountWithPrivateKey | null>(null);
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
    } else if (IS_IN_DEVELOPMENT_MODE) {
      const onChange = () => {
        setForceUpdateAccount((prevState) => !prevState);
      };

      window.addEventListener(
        LOCAL_STORAGE_ACCOUNT_CHANGED_EVENT_KEY,
        onChange
      );
      return () => {
        window.removeEventListener(
          LOCAL_STORAGE_ACCOUNT_CHANGED_EVENT_KEY,
          onChange
        );
      };
    }
  }, []);

  return account;
};
