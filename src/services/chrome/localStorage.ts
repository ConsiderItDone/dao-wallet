import { ExtensionStorage } from "./extensionStorage";
import { isEmpty } from "../../utils/common";
import { BrowserStorageWrapper } from "./browserStorageWrapper";
import { SessionStorage } from "./sessionStorage";
import { decryptPrivateKeyWithPassword } from "../../utils/encryption";
import { IS_IN_DEVELOPMENT_MODE } from "../../consts/app";
import {
  INJECTED_API_GET_CONNECTED_ACCOUNTS_METHOD,
  WALLET_INJECTED_API_MESSAGE_TARGET,
} from "../../scripts/scripts.consts";
import { InjectedAPIMessage } from "../../scripts/injectedAPI.custom.types";
import { Network } from "../../types";
import { DEFAULT_NETWORKS } from "../../consts/networks";

const HASHED_PASSWORD_KEY = "hashedPassword";
export const WEBSITES_DATA_KEY = "websitesData";

export const ACCOUNTS_KEY = "accounts";
export const LAST_SELECTED_ACCOUNT_INDEX_KEY = "lastSelectedAccountIndex";

export const NETWORKS_KEY = "networks";
export const LAST_SELECTED_NETWORK_INDEX_KEY = "lastSelectedNetworkIndex";

export const LOCAL_STORAGE_ACCOUNT_CHANGED_EVENT_KEY =
  "near#localStorageAccount";
const LOCAL_STORAGE_ACCOUNT_CHANGED_EVENT = new Event(
  LOCAL_STORAGE_ACCOUNT_CHANGED_EVENT_KEY
);

export const LOCAL_STORAGE_NETWORK_CHANGED_EVENT_KEY =
  "near#localStorageNetwork";
const LOCAL_STORAGE_NETWORK_CHANGED_EVENT = new Event(
  LOCAL_STORAGE_NETWORK_CHANGED_EVENT_KEY
);

const sessionStorage = new SessionStorage();

export class LocalStorage extends ExtensionStorage<LocalStorageData> {
  constructor() {
    let storage;
    if (IS_IN_DEVELOPMENT_MODE) {
      storage = new BrowserStorageWrapper(localStorage);
    } else {
      storage = chrome.storage.local;
    }
    super(storage);
  }

  async getHashedPassword(): Promise<string | undefined> {
    try {
      const storageObject = await this.get();
      return storageObject?.hashedPassword;
    } catch (error) {
      console.error("[GetHashedPassword]:", error);
      return undefined;
    }
  }

  async setHashedPassword(hashedPassword: string): Promise<void> {
    try {
      const result = await this.set({ [HASHED_PASSWORD_KEY]: hashedPassword });
      if (IS_IN_DEVELOPMENT_MODE) {
        window.dispatchEvent(LOCAL_STORAGE_ACCOUNT_CHANGED_EVENT);
      }
      return result;
    } catch (error) {
      console.error("[SetHashedPassword]:", error);
    }
  }

  async getAccounts(): Promise<AccountWithPrivateKey[] | undefined> {
    try {
      const storageObject = await this.get();
      const accounts = await storageObject?.accounts;

      if (!accounts) return undefined;

      const password = await sessionStorage.getPassword();
      if (!password) {
        return undefined;
      }

      return Promise.all(
        accounts.map(async (account) => ({
          ...account,
          privateKey: await this._decryptAccountPrivateKey(
            password,
            account.encryptedPrivateKey!
          ),
        }))
      );
    } catch (error) {
      console.error("[GetAccounts]:", error);
      return undefined;
    }
  }

  async addAccount(account: LocalStorageAccount): Promise<void> {
    try {
      const storageObject = await this.get();
      let accounts = storageObject?.accounts || [];
      if (isEmpty(accounts)) {
        accounts = [];
      }
      accounts.push({
        accountId: account.accountId,
        publicKey: account.publicKey,
        tokens: account.tokens,
        encryptedPrivateKey: account.encryptedPrivateKey,
        isLedger: account.isLedger,
      });
      const result = await this.set({ [ACCOUNTS_KEY]: accounts });
      if (IS_IN_DEVELOPMENT_MODE) {
        window.dispatchEvent(LOCAL_STORAGE_ACCOUNT_CHANGED_EVENT);
      }
      await this.setLastSelectedAccountIndex(accounts.length - 1);
      return result;
    } catch (error) {
      console.error("[AddAccount]:", error);
    }
  }

  async getLastSelectedAccountIndex(): Promise<number | undefined> {
    try {
      const storageObject = await this.get();
      return storageObject?.lastSelectedAccountIndex;
    } catch (error) {
      console.error("[GetLastSelectedAccountIndex]:", error);
      return undefined;
    }
  }

  async setLastSelectedAccountIndex(index: number): Promise<void> {
    try {
      const currentLastSelectedAccountIndex =
        await this.getLastSelectedAccountIndex();
      if (currentLastSelectedAccountIndex === index) {
        return;
      }

      const result = await this.set({
        [LAST_SELECTED_ACCOUNT_INDEX_KEY]: index,
      });
      if (IS_IN_DEVELOPMENT_MODE) {
        window.dispatchEvent(LOCAL_STORAGE_ACCOUNT_CHANGED_EVENT);
      }
      return result;
    } catch (error) {
      console.error("[SetLastSelectedAccountIndex]:", error);
    }
  }

  async getCurrentAccount(): Promise<AccountWithPrivateKey | null> {
    try {
      const currentAccount = await this._getCurrentAccount();
      if (!currentAccount) {
        return null;
      }

      const password = await sessionStorage.getPassword();
      if (!password) {
        return null;
      }
      const decryptedPrivateKey = await this._decryptAccountPrivateKey(
        password,
        currentAccount.encryptedPrivateKey!
      );
      return { ...currentAccount, privateKey: decryptedPrivateKey };
    } catch (error) {
      console.error("[GetCurrentAccount]:", error);
      return null;
    }
  }

  private async _getCurrentAccount(): Promise<LocalStorageAccount | null> {
    try {
      const accounts = await this.getAccounts();
      if (!accounts || !accounts?.length) {
        return null;
      }

      let lastSelectedAccountIndex = await this.getLastSelectedAccountIndex();
      if (
        lastSelectedAccountIndex === null ||
        lastSelectedAccountIndex === undefined
      ) {
        lastSelectedAccountIndex = 0;
        await this.setLastSelectedAccountIndex(lastSelectedAccountIndex);
      }

      return accounts[lastSelectedAccountIndex];
    } catch (error) {
      console.error("[_GetCurrentAccount]:", error);
      return null;
    }
  }

  async getNetworks(): Promise<Network[] | null> {
    try {
      const storageObject = await this.get();
      const customNetworks = await storageObject?.customNetworks;
      if (!customNetworks) {
        return DEFAULT_NETWORKS;
      } else {
        return [...DEFAULT_NETWORKS, ...customNetworks];
      }
    } catch (error) {
      console.error("[GetNetworks]:", error);
      return null;
    }
  }

  async addCustomNetwork(customNetwork: Network) {
    try {
      const storageObject = await this.get();
      let customNetworks = storageObject?.customNetworks || [];
      if (isEmpty(customNetworks)) {
        customNetworks = [];
      }
      customNetworks.push({
        networkId: customNetwork.networkId,
        nodeUrl: customNetwork.nodeUrl,
      });
      const result = await this.set({ [NETWORKS_KEY]: customNetworks });
      if (IS_IN_DEVELOPMENT_MODE) {
        window.dispatchEvent(LOCAL_STORAGE_NETWORK_CHANGED_EVENT);
      }
      await this.setLastSelectedAccountIndex(customNetworks.length - 1);
      return result;
    } catch (error) {
      console.error("[AddCustomNetwork]:", error);
      return null;
    }
  }

  async getLastSelectedNetworkIndex(): Promise<number | undefined> {
    try {
      const storageObject = await this.get();
      return storageObject?.lastSelectedNetworkIndex;
    } catch (error) {
      console.error("[GetLastSelectedNetworkIndex]:", error);
      return undefined;
    }
  }

  async setLastSelectedNetworkIndex(index: number): Promise<void> {
    try {
      const currentLastSelectedNetworkIndex =
        await this.getLastSelectedNetworkIndex();
      if (currentLastSelectedNetworkIndex === index) {
        return;
      }

      const result = await this.set({
        [LAST_SELECTED_NETWORK_INDEX_KEY]: index,
      });
      if (IS_IN_DEVELOPMENT_MODE) {
        window.dispatchEvent(LOCAL_STORAGE_NETWORK_CHANGED_EVENT);
      }
      return result;
    } catch (error) {
      console.error("[SetLastSelectedNetworkIndex]:", error);
    }
  }

  async getCurrentNetwork(): Promise<Network | undefined> {
    try {
      const networks = await this.getNetworks();

      if (!networks) return undefined;

      let lastSelectedNetworkIndex = await this.getLastSelectedNetworkIndex();
      if (
        lastSelectedNetworkIndex === null ||
        lastSelectedNetworkIndex === undefined
      ) {
        lastSelectedNetworkIndex = 0;
        await this.setLastSelectedNetworkIndex(lastSelectedNetworkIndex);
      }

      return networks[lastSelectedNetworkIndex];
    } catch (error) {
      console.error("[GetCurrentNetwork]:", error);
      return undefined;
    }
  }

  async addTokenForCurrentAccount(token: Token): Promise<void> {
    try {
      const accounts = await this.getAccounts();
      if (!accounts || !accounts?.length) {
        throw new Error("User has no accounts");
      }

      let lastSelectedAccountIndex = await this.getLastSelectedAccountIndex();
      if (
        lastSelectedAccountIndex === null ||
        lastSelectedAccountIndex === undefined
      ) {
        lastSelectedAccountIndex = 0;
        await this.setLastSelectedAccountIndex(lastSelectedAccountIndex);
      }

      accounts[lastSelectedAccountIndex].tokens.push(token);
      await this.set({ [ACCOUNTS_KEY]: accounts });

      if (IS_IN_DEVELOPMENT_MODE) {
        window.dispatchEvent(LOCAL_STORAGE_ACCOUNT_CHANGED_EVENT);
      }
    } catch (error) {
      console.error("[AddTokenForCurrentAccount]:", error);
    }
  }

  async currentUserHasToken(token: Token): Promise<boolean> {
    try {
      const currentAccount = await this.getCurrentAccount();
      if (!currentAccount) {
        throw new Error("User doesn't have current account");
      }

      return currentAccount.tokens.some(
        (existingToken) => existingToken.address === token.address
      );
    } catch (error) {
      console.error("[CurrentUserHasToken]:", error);
      return false;
    }
  }

  private async _decryptAccountPrivateKey(
    password: string,
    encryptedPrivateKey: string
  ): Promise<string | undefined> {
    try {
      //TODO: handle if no private key (Ledger)
      return await decryptPrivateKeyWithPassword(password, encryptedPrivateKey);
    } catch (error) {
      console.error("[DecryptPrivateKey]:", error);
    }
    return undefined;
  }

  public async getWebsiteConnectedAccounts(
    websiteAddress: string
  ): Promise<{ accountId: string; publicKey: string }[]> {
    try {
      const storageObject = await this.get();
      const accounts = storageObject?.accounts;

      if (!accounts) return [];

      const websitesData = storageObject?.websitesData;
      if (!websitesData) {
        return [];
      }
      const connectedAccountIds =
        websitesData[websiteAddress.toLowerCase()] || [];

      return connectedAccountIds.map((accountId) => {
        const correspondingAccount = accounts.find(
          (account) => account.accountId === accountId
        );
        const publicKey = correspondingAccount?.publicKey || " ";
        return {
          accountId,
          publicKey: publicKey,
        };
      });
    } catch (error) {
      console.info("[GetWebsiteConnectedAccounts]:", error);
      return [];
    }
  }

  public async setWebsiteConnectedAccounts(
    websiteAddress: string,
    accountIds: string[] | undefined
  ): Promise<string[] | undefined> {
    try {
      if (!websiteAddress) {
        throw new Error("websiteAddress arg is empty");
      }

      const storageObject = await this.get();

      let websitesData = storageObject?.websitesData;
      if (!websitesData) {
        websitesData = {};
      }
      websitesData[websiteAddress.toLowerCase()] = accountIds || [];
      await this.set({ [WEBSITES_DATA_KEY]: websitesData });

      const message: InjectedAPIMessage = {
        target: WALLET_INJECTED_API_MESSAGE_TARGET,
        method: INJECTED_API_GET_CONNECTED_ACCOUNTS_METHOD,
        response: accountIds,
      };
      //
      // console.log("[SetWebsiteConnectedAccounts] postMessage data:", {
      //   window,
      //   message,
      //   websiteAddress,
      // });
      //
      await chrome.runtime.sendMessage({
        data: message,
        origin: websiteAddress,
      });

      return accountIds;
    } catch (error) {
      console.error("[SetWebsiteConnectedAccounts]:", error);
      return undefined;
    }
  }
}

/**
 * Does not clear data when browser closes.
 */
interface LocalStorageData {
  hashedPassword: string;

  /**
   * List of user accounts.
   */
  accounts: LocalStorageAccount[];

  /**
   * Index of last selected account (if there is any).
   */
  lastSelectedAccountIndex: number;

  /**
   * Map of following data:
   *   website => list of connected accountIds
   *
   * Used by injected API to save which websites were given access to which accounts.
   */
  websitesData: Record<string, string[]>;

  /**
   * Custom networks added by user.
   */
  customNetworks: Network[];

  /**
   * Index of last selected network.
   */
  lastSelectedNetworkIndex: number;
}

export interface LocalStorageAccount {
  accountId: string;

  /**
   * Private key of account gets encrypted/decrypted with hashedPassword.
   */
  encryptedPrivateKey?: string;
  /**
   * List of account tokens added by user. Does not include default NEAR token.
   */
  tokens: Token[];

  isLedger?: boolean;
  publicKey?: string;
}

export interface AccountWithPrivateKey extends LocalStorageAccount {
  /**
   * Decrypted private key.
   */
  privateKey?: string;
}

export interface Token {
  address: string;
  name: string;
  symbol: string;
  icon: string;
  decimals: number;
}
