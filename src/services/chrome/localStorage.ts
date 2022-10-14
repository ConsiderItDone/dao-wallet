import { ExtensionStorage } from "./extensionStorage";
import { isEmpty } from "../../utils/common";
import { BrowserStorageWrapper } from "./browserStorageWrapper";
import { SessionStorage } from "./sessionStorage";
import { decryptPrivateKeyWithPassword } from "../../utils/encryption";
import { PublicKey } from "@cidt/near-plugin-js/build/wrap";

const HASHED_PASSWORD_KEY = "hashedPassword";
export const ACCOUNTS_KEY = "accounts";
export const LAST_SELECTED_ACCOUNT_INDEX_KEY = "lastSelectedAccountIndex";

const isInDevelopmentMode = process?.env?.NODE_ENV === "development";
export const LOCAL_STORAGE_CHANGED_EVENT_KEY = "near#localStorage";
const LOCAL_STORAGE_CHANGED_EVENT = new Event(LOCAL_STORAGE_CHANGED_EVENT_KEY);

const sessionStorage = new SessionStorage();

export class LocalStorage extends ExtensionStorage<LocalStorageData> {
  constructor() {
    let storage;
    if (isInDevelopmentMode) {
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
      if (isInDevelopmentMode) {
        window.dispatchEvent(LOCAL_STORAGE_CHANGED_EVENT);
      }
      return result;
    } catch (error) {
      console.error("[SetHashedPassword]:", error);
    }
  }

  async getAccounts(): Promise<LocalStorageAccount[] | undefined> {
    try {
      const storageObject = await this.get();
      return storageObject?.accounts;
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
      accounts.push(account);
      const result = await this.set({ [ACCOUNTS_KEY]: accounts });
      if (isInDevelopmentMode) {
        window.dispatchEvent(LOCAL_STORAGE_CHANGED_EVENT);
      }
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
      const result = await this.set({
        [LAST_SELECTED_ACCOUNT_INDEX_KEY]: index,
      });
      if (isInDevelopmentMode) {
        window.dispatchEvent(LOCAL_STORAGE_CHANGED_EVENT);
      }
      return result;
    } catch (error) {
      console.error("[SetLastSelectedAccountIndex]:", error);
    }
  }

  async getCurrentAccount(): Promise<WalletAccount | null> {
    try {
      const currentAccount = await this._getCurrentAccount();
      if (!currentAccount) {
        throw new Error("User doesn't have current account");
      }

      const password = await sessionStorage.getPassword();
      if (!password) {
        throw new Error("Failed to get password from session storage");
      }
      let decryptedPrivateKey = "";
      try {
        decryptedPrivateKey = await decryptPrivateKeyWithPassword(
          password,
          currentAccount.encryptedPrivateKey
        );
      } catch (error) {
        console.log("[DecryptedPrivateKet]:", error);
      }
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

      return accounts[lastSelectedAccountIndex];
    } catch (error) {
      console.error("[_GetCurrentAccount]:", error);
      return null;
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

      if (isInDevelopmentMode) {
        window.dispatchEvent(LOCAL_STORAGE_CHANGED_EVENT);
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
}

export interface LocalStorageAccount {
  name: string;

  accountId: string;

  /**
   * Private key of account gets encrypted/decrypted with hashedPassword.
   */
  encryptedPrivateKey: string;
  /**
   * List of account tokens added by user. Do not include default NEAR token.
   */
  tokens: Token[];

  isLedger?: boolean;
  publicKey?: PublicKey;
}

export interface WalletAccount extends LocalStorageAccount {
  /**
   * Decrypted private key.
   */
  privateKey: string;
}

export interface Token {
  address: string;
  name: string;
  symbol: string;
  icon: string;
  decimals: number;
}
