import { PolywrapProvider } from "@polywrap/react";
import { useMemo } from "react";
import {
  createContext,
  ProviderProps,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  ACCOUNTS_KEY,
  LAST_SELECTED_ACCOUNT_INDEX_KEY,
  LocalStorage,
  LOCAL_STORAGE_CHANGED_EVENT_KEY,
  AccountWithPrivateKey,
} from "../services/chrome/localStorage";
import { Network } from "../types";
import { getPolywrapConfig } from "../utils/polywrap";

const appLocalStorage = new LocalStorage();

const isInDevelopmentMode = process?.env?.NODE_ENV === "development";
interface AuthProviderValue extends AuthState {
  currentAccount: AccountWithPrivateKey | undefined;
  accounts: AccountWithPrivateKey[];
  addPublicKey: (accountId: string, publicKey: string) => AccountWithPrivateKey;
  addAccount: (newAccount: AccountWithPrivateKey) => Promise<Boolean>;
  selectAccount: (index: number) => Promise<void>;
  changeNetwork: (newNetwork: Network) => Promise<Boolean>;
}

export interface AuthState {
  network: Network;
  selectedAccountIndex: number | undefined;
  accounts: AccountWithPrivateKey[];
  loading: Boolean;
}

export const AuthContext = createContext<AuthProviderValue>(
  {} as AuthProviderValue
);

const AuthProvider = (props: Omit<ProviderProps<AuthState>, "value">) => {
  const [state, setState] = useState<AuthState>({
    selectedAccountIndex: undefined,
    accounts: [],
    network: "testnet",
    loading: true,
  });

  const currentAccount = useMemo(
    () =>
      state.accounts.find((acc, index) => index === state.selectedAccountIndex),
    [state.accounts.length, state.selectedAccountIndex] //eslint-disable-line
  );
  console.log("CUrrent account", currentAccount);

  const addAccount = useCallback(async (newAccount: AccountWithPrivateKey) => {
    await appLocalStorage.addAccount(newAccount);
    setState((state) => ({
      ...state,
      accounts: [...state.accounts, newAccount],
      selectedAccountIndex: state.accounts.length,
    }));
    console.log("add Account", newAccount);

    selectAccount(newAccount.accountId);

    return true;
  }, []); //eslint-disable-line

  const selectAccount = useCallback(async (indexOrId: string | number) => {
    console.log("select account !", indexOrId);
    if (typeof indexOrId === "string") {
      const accounts = await appLocalStorage.getAccounts();
      const accountIndex = accounts?.findIndex(
        (acc) => acc.accountId === indexOrId
      );
      if (accountIndex && accountIndex >= 0) {
        await appLocalStorage.setLastSelectedAccountIndex(accountIndex);
      }
      setState((state) => ({ ...state, selectedAccountIndex: accountIndex }));
    }
    if (typeof indexOrId === "number") {
      await appLocalStorage.setLastSelectedAccountIndex(indexOrId);
      setState((state) => ({ ...state, selectedAccountIndex: indexOrId }));
    }
  }, []);

  const addPublicKey = useCallback(
    (accountId: string, publicKey: string) => {
      const index = state.accounts.findIndex(
        (acc) => acc.accountId === accountId
      );

      const accountWithPublicKey: AccountWithPrivateKey = {
        ...state.accounts[index],
        publicKey: publicKey,
      };

      const newAccountsData = [
        ...state.accounts.slice(0, index),
        accountWithPublicKey,
        ...state.accounts.slice(index),
      ];
      setState((state) => ({ ...state, accounts: newAccountsData }));

      return accountWithPublicKey;
    },
    [] //eslint-disable-line
  );

  const changeNetwork = useCallback(async (newNetwork: Network) => {
    setState((state) => ({ ...state, network: newNetwork }));
    return true;
  }, []);

  const initAccounts = useCallback(async (): Promise<
    [AccountWithPrivateKey[], number | undefined]
  > => {
    const accounts =
      (await appLocalStorage.getAccounts()) as AccountWithPrivateKey[];

    if (!accounts || !accounts.length) {
      console.info("[HeaderGetWalletsList]: user has no accounts");
      return [[], undefined];
    }

    let lastSelectedAccountIndex =
      await appLocalStorage.getLastSelectedAccountIndex();
    if (
      lastSelectedAccountIndex === null ||
      lastSelectedAccountIndex === undefined
    ) {
      lastSelectedAccountIndex = 0;
      await appLocalStorage.setLastSelectedAccountIndex(
        lastSelectedAccountIndex
      );
    }
    return [accounts, lastSelectedAccountIndex];
  }, []);

  const init = useCallback(async (network: Network = "testnet") => {
    const [accounts, lastAccountIdex] = await initAccounts();
    setState((state) => ({
      ...state,
      network,
      selectedAccountIndex: lastAccountIdex,
      accounts,
      loading: false,
    }));
  }, []); //eslint-disable-line

  useEffect(() => {
    const updateAccount = async () => {
      console.log("updateAccount called");
      const currentAccount = await appLocalStorage.getCurrentAccount();
      if (currentAccount) {
        selectAccount(currentAccount.accountId);
      }
    };

    init();
    updateAccount();
    const clearEventListeners = setEventListeners(updateAccount);

    return clearEventListeners;
  }, []); //eslint-disable-line

  return (
    <AuthContext.Provider
      value={{
        ...state,
        currentAccount,
        addAccount,
        selectAccount,
        addPublicKey,
        changeNetwork,
      }}
    >
      <PolywrapProvider {...getPolywrapConfig(state)}>
        {props.children}
      </PolywrapProvider>
    </AuthContext.Provider>
  );
};

export default AuthProvider;

const setEventListeners = (updateAccount: () => void) => {
  if (chrome?.storage?.onChanged) {
    const onChange = (changes: object, areaName: string) => {
      const shouldUpdate =
        areaName === "local" &&
        (ACCOUNTS_KEY in changes || LAST_SELECTED_ACCOUNT_INDEX_KEY in changes);

      if (shouldUpdate) {
        updateAccount();
      }
    };

    chrome.storage.onChanged.addListener(onChange);
    return () => {
      chrome.storage.onChanged.removeListener(onChange);
    };
  } else if (isInDevelopmentMode) {
    window.addEventListener(LOCAL_STORAGE_CHANGED_EVENT_KEY, updateAccount);
    return () => {
      window.removeEventListener(
        LOCAL_STORAGE_CHANGED_EVENT_KEY,
        updateAccount
      );
    };
  }
};
