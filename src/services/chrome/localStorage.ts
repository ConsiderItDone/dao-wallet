import { ExtensionStorage } from "./extensionStorage";
import { isEmpty } from "../../utils/utils";

const HASHED_PASSWORD_KEY = "hashedPassword";
const ACCOUNTS_KEY = "accounts";
const LAST_SELECTED_ACCOUNT_INDEX_KEY = "lastSelectedAccountIndex";

export class LocalStorage extends ExtensionStorage<LocalStorageData> {
  constructor() {
    super(chrome.storage.local);
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
      return this.set({ [HASHED_PASSWORD_KEY]: hashedPassword });
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
      return this.set({ [ACCOUNTS_KEY]: accounts });
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
      return this.set({ [LAST_SELECTED_ACCOUNT_INDEX_KEY]: index });
    } catch (error) {
      console.error("[SetLastSelectedAccountIndex]:", error);
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

interface LocalStorageAccount {
  name: string;
  encryptedPrivateKey: string;
}
