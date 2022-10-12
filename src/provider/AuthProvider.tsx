import { PublicKey } from "@cidt/near-plugin-js/build/wrap";
import { PolywrapProvider } from "@polywrap/react";
import {
  createContext,
  ProviderProps,
  useCallback,
  useEffect,
  useState,
} from "react";
import { AccountData, Network } from "../types";
import { getPolywrapConfig } from "../utils/polywrap";

interface AuthProviderValue extends AuthState {
  selectedAccount: AccountData | undefined;
  accounts: AccountData[];
  addPublicKey: (accountId: string, publicKey: PublicKey) => AccountData;
  addAccount: (newAccount: AccountData) => Promise<Boolean>;
  changeNetwork: (newNetwork: Network) => Promise<Boolean>;
}

export interface AuthState {
  network: Network;
  selectedAccountIndex: Number | undefined;
  accounts: AccountData[];
  loading: Boolean;
}

export const AuthContext = createContext<AuthProviderValue>(
  {} as AuthProviderValue
);

const AuthProvider = (props: Omit<ProviderProps<AuthState>, "value">) => {
  const [state, setState] = useState<AuthState>({
    selectedAccountIndex: undefined,
    accounts: [],
    network: "mainnet",
    loading: true,
  });

  const selectedAccount = state.accounts.find(
    (acc, index) => index === state.selectedAccountIndex
  );

  const addAccount = useCallback(async (newAccount: AccountData) => {
    setState((state) => ({
      ...state,
      accounts: [...state.accounts, newAccount],
      selectedAccountIndex: state.accounts.length,
    }));
    return true;
  }, []);

  const addPublicKey = useCallback(
    (accountId: string, publicKey: PublicKey) => {
      const index = state.accounts.findIndex(
        (acc) => acc.accountId === accountId
      );

      const accountWithPublicKey: AccountData = {
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

  const initAccounts = useCallback(async (): Promise<AccountData[]> => {
    if (process.env.REACT_APP_DEV_MODE) {
      return [
        {
          accountId: "polydev.testnet",
          privateKey:
            "ed25519:4HbxvXyS76rvNdHcad3HegGzdVcpNid3LE1vbdZNMSqygZJrL2PRQDzPWZA5hopCBFuJNmp9kihyJKPEagVPsPEc",
        },
        {
          accountId:
            "d6cffd5f97babaf6226e944fb0dde03bda6b2bc3d91e665b724dbf6ea10754f2",
        },
      ];
    }
    // TODO init accounts from storage or elsewhere
    return [];
  }, []);

  const init = useCallback(async (network: Network = "testnet") => {
    console.log("Initializing Auth Provider");
    const accounts = await initAccounts();
    setState((state) => ({ ...state, network, accounts, loading: false }));
  }, []); //eslint-disable-line

  useEffect(() => {
    init();
  }, []); //eslint-disable-line

  return (
    <AuthContext.Provider
      value={{
        ...state,
        selectedAccount,
        addAccount,
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
