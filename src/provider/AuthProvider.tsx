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
  LOCAL_STORAGE_ACCOUNT_CHANGED_EVENT_KEY,
  AccountWithPrivateKey,
  CUSTOM_NETWORKS_KEY,
  LOCAL_STORAGE_NETWORK_CHANGED_EVENT_KEY,
  LAST_SELECTED_NETWORK_INDEX_KEY,
} from "../services/chrome/localStorage";
import { Network } from "../types";
import { getPolywrapConfig } from "../utils/polywrap";
import { IS_IN_DEVELOPMENT_MODE } from "../consts/app";
import {
  SESSION_PASSWORD_KEY,
  SESSION_STORAGE_PASSWORD_CHANGED_EVENT_KEY,
} from "../services/chrome/sessionStorage";

const appLocalStorage = new LocalStorage();

interface AuthProviderValue extends AuthState {
  currentAccount: AccountWithPrivateKey | undefined;
  accounts: AccountWithPrivateKey[];
  addPublicKey: (accountId: string, publicKey: string) => AccountWithPrivateKey;
  addAccount: (newAccount: AccountWithPrivateKey) => Promise<Boolean>;
  selectAccount: (index: number) => Promise<void>;
  changeNetwork: (indexOrId: string | number) => Promise<Boolean>;
  currentNetwork: Network;
  explorerUrl: string;
  indexerServiceUrl: string;
}

export interface AuthState {
  selectedAccountIndex: number | undefined;
  accounts: AccountWithPrivateKey[];
  selectedNetworkIndex: number | undefined;
  networks: Network[];
  loading: Boolean;
}

const DEFAULT_STATE: AuthState = {
  selectedAccountIndex: undefined,
  accounts: [],
  selectedNetworkIndex: undefined,
  networks: [],
  loading: true,
};

export const AuthContext = createContext<AuthProviderValue>(
  {} as AuthProviderValue
);

const AuthProvider = (props: Omit<ProviderProps<AuthState>, "value">) => {
  const [state, setState] = useState<AuthState>(DEFAULT_STATE);
  const [shouldReInitAccounts, setShouldReInitAccounts] =
    useState<boolean>(false);

  const currentNetwork = useMemo(
    () =>
      state.selectedNetworkIndex !== undefined
        ? state.networks.find(
            (network, index) => index === state.selectedNetworkIndex
          )
        : undefined,
    [state.networks.length, state.selectedNetworkIndex] //eslint-disable-line
  );
  console.log("Current network", currentNetwork);

  const currentAccount = useMemo(
    () =>
      state.selectedAccountIndex !== undefined
        ? state.accounts.find(
            (acc, index) => index === state.selectedAccountIndex
          )
        : undefined,
    [state.accounts, state.selectedAccountIndex] //eslint-disable-line
  );
  console.log("Current account", currentAccount);

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
      if (accountIndex !== undefined && accountIndex >= 0) {
        await appLocalStorage.setLastSelectedAccountIndex(accountIndex);
        setState((state) => ({ ...state, selectedAccountIndex: accountIndex }));
      }
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

  const changeNetwork = useCallback(async (indexOrId: string | number) => {
    console.log("change network !", indexOrId);

    if (typeof indexOrId === "string") {
      const networks = await appLocalStorage.getNetworks();
      const networkIndex = networks?.findIndex(
        (network) => network.networkId === indexOrId
      );
      if (networkIndex !== undefined && networkIndex >= 0) {
        await appLocalStorage.setLastSelectedNetworkIndex(networkIndex);
        setState((state) => ({ ...state, selectedNetworkIndex: networkIndex }));
      }
      return true;
    }

    if (typeof indexOrId === "number") {
      await appLocalStorage.setLastSelectedNetworkIndex(indexOrId);
      setState((state) => ({ ...state, selectedNetworkIndex: indexOrId }));
      return true;
    }

    return false;
  }, []);

  const initAccounts = useCallback(async (): Promise<
    [AccountWithPrivateKey[], number | undefined]
  > => {
    const accounts =
      (await appLocalStorage.getAccounts()) as AccountWithPrivateKey[];

    if (!accounts || !accounts.length) {
      console.info("[InitAccounts]: user has no accounts");
      return [[], undefined];
    }

    const lastSelectedAccountIndex =
      await appLocalStorage.getLastSelectedAccountIndex();
    return [accounts, lastSelectedAccountIndex];
  }, []);

  const initNetworks = useCallback(async (): Promise<
    [Network[], number | undefined]
  > => {
    const networks = await appLocalStorage.getNetworks();

    if (!networks || !networks.length) {
      console.info("[InitNetworks]: couldn't get any network");
      return [[], undefined];
    }

    const lastSelectedNetworkIndex =
      await appLocalStorage.getLastSelectedNetworkIndex();
    return [networks, lastSelectedNetworkIndex];
  }, []);

  const init = useCallback(async () => {
    const [networks, lastSelectedNetworkIndex] = await initNetworks();
    const [accounts, lastAccountIndex] = await initAccounts();
    setState((state) => ({
      ...state,
      selectedAccountIndex: lastAccountIndex,
      accounts,
      selectedNetworkIndex: lastSelectedNetworkIndex,
      networks,
      loading: false,
    }));
  }, []); //eslint-disable-line

  const reinitAccounts = useCallback(async () => {
    const [accounts, lastAccountIndex] = await initAccounts();
    setState((state) => ({
      ...state,
      selectedAccountIndex: lastAccountIndex,
      accounts,
    }));
  }, []); //eslint-disable-line

  const updateAccount = useCallback(async () => {
    console.log("updateAccount called");
    const currentAccount = await appLocalStorage.getCurrentAccount();
    if (currentAccount) {
      await selectAccount(currentAccount.accountId);
    }
  }, [selectAccount]);

  const updateNetwork = useCallback(async () => {
    console.log("updateNetwork called");
    const currentNetwork = await appLocalStorage.getCurrentNetwork();
    if (currentNetwork) {
      await changeNetwork(currentNetwork.networkId);
    }
  }, [changeNetwork]);

  useEffect(() => {
    return setEventListeners(updateAccount, updateNetwork, () => {
      setShouldReInitAccounts(true);
    });
  }, [updateAccount, updateNetwork]);

  useEffect(() => {
    const initIndex = async () => {
      const selectedAccountIndex =
        await appLocalStorage.getLastSelectedAccountIndex();
      const selectedNetworkIndex =
        await appLocalStorage.getLastSelectedNetworkIndex();
      setState((state) => ({
        ...state,
        selectedAccountIndex,
        selectedNetworkIndex,
      }));
    };

    initIndex();
  }, []);

  useEffect(() => {
    if (state.selectedNetworkIndex !== undefined) {
      init();
    } else {
      setState(DEFAULT_STATE);
    }
  }, [state.selectedNetworkIndex, init]);

  useEffect(() => {
    if (shouldReInitAccounts) {
      reinitAccounts();
      setShouldReInitAccounts(false);
    }
  }, [reinitAccounts, shouldReInitAccounts]);

  return currentNetwork ? (
    <AuthContext.Provider
      value={{
        ...state,
        currentAccount,
        addAccount,
        selectAccount,
        addPublicKey,
        changeNetwork,
        currentNetwork,
        explorerUrl: currentNetwork.explorerUrl,
        indexerServiceUrl: currentNetwork.indexerServiceUrl,
      }}
    >
      <PolywrapProvider
        {...getPolywrapConfig(state, currentAccount, currentNetwork)}
      >
        {props.children}
      </PolywrapProvider>
    </AuthContext.Provider>
  ) : null;
};

export default AuthProvider;

const setEventListeners = (
  updateAccount: () => void,
  updateNetwork: () => void,
  reinitAccounts: () => void
) => {
  if (chrome?.storage?.onChanged) {
    const onChange = (changes: object, areaName: string) => {
      const shouldUpdateAccount =
        areaName === "local" &&
        (ACCOUNTS_KEY in changes || LAST_SELECTED_ACCOUNT_INDEX_KEY in changes);

      if (shouldUpdateAccount) {
        updateAccount();
      }

      const shouldUpdateNetwork =
        areaName === "local" &&
        (CUSTOM_NETWORKS_KEY in changes ||
          LAST_SELECTED_NETWORK_INDEX_KEY in changes);

      if (shouldUpdateNetwork) {
        updateNetwork();
      }

      const shouldReinitAccounts =
        shouldUpdateNetwork ||
        (areaName === "session" && SESSION_PASSWORD_KEY in changes);

      if (shouldReinitAccounts) {
        reinitAccounts();
      }
    };

    chrome.storage.onChanged.addListener(onChange);
    return () => {
      chrome.storage.onChanged.removeListener(onChange);
    };
  } else if (IS_IN_DEVELOPMENT_MODE) {
    window.addEventListener(
      LOCAL_STORAGE_ACCOUNT_CHANGED_EVENT_KEY,
      updateAccount
    );

    window.addEventListener(
      LOCAL_STORAGE_NETWORK_CHANGED_EVENT_KEY,
      updateNetwork
    );

    window.addEventListener(
      SESSION_STORAGE_PASSWORD_CHANGED_EVENT_KEY,
      reinitAccounts
    );

    return () => {
      window.removeEventListener(
        LOCAL_STORAGE_ACCOUNT_CHANGED_EVENT_KEY,
        updateAccount
      );

      window.removeEventListener(
        LOCAL_STORAGE_NETWORK_CHANGED_EVENT_KEY,
        updateNetwork
      );

      window.removeEventListener(
        SESSION_STORAGE_PASSWORD_CHANGED_EVENT_KEY,
        reinitAccounts
      );
    };
  }
};
