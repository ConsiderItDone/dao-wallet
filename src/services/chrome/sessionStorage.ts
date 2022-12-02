import { ExtensionStorage } from "./extensionStorage";
import { BrowserStorageWrapper } from "./browserStorageWrapper";
import { IS_IN_DEVELOPMENT_MODE } from "../../consts/app";
import { InjectedAPITransactionOptions } from "../../scripts/injectedAPI/injectedAPI.types";

export const SESSION_PASSWORD_KEY = "password";
export const SESSION_TRANSACTIONS_KEY = "transactions";

export const SESSION_STORAGE_PASSWORD_CHANGED_EVENT_KEY =
  "near#sessionStorageNetwork";
const SESSION_STORAGE_PASSWORD_CHANGED_EVENT = new Event(
  SESSION_STORAGE_PASSWORD_CHANGED_EVENT_KEY
);

export class SessionStorage extends ExtensionStorage<SessionStorageData> {
  constructor() {
    let storage;
    if (IS_IN_DEVELOPMENT_MODE) {
      storage = new BrowserStorageWrapper(sessionStorage);
    } else {
      storage = chrome.storage.session;
    }
    super(storage);
  }

  async getPassword(): Promise<string | undefined> {
    try {
      const storageObject = await this.get();
      return storageObject?.password;
    } catch (error) {
      console.error("[GetDecryptedPassword]:", error);
      return undefined;
    }
  }

  async setPassword(password: string | undefined): Promise<void> {
    try {
      const result = await this.set({ [SESSION_PASSWORD_KEY]: password });
      if (IS_IN_DEVELOPMENT_MODE) {
        window.dispatchEvent(SESSION_STORAGE_PASSWORD_CHANGED_EVENT);
      }
      return result;
    } catch (error) {
      console.error("[SetDecryptedPassword]:", error);
    }
  }

  async addTransactions(
    transactions: SessionStorageTransactions,
    transactionsUuid: string
  ) {
    try {
      const storageObject = await this.get();
      const storageTransactions = storageObject?.transactions || {};
      storageTransactions[transactionsUuid] = transactions;
      return await this.set({
        [SESSION_TRANSACTIONS_KEY]: storageTransactions,
      });
    } catch (error) {
      console.error("[AddTransactions]:", error);
    }
  }

  async getTransaction(
    transactionsUuid: string
  ): Promise<SessionStorageTransactions | undefined> {
    try {
      const storageObject = await this.get();
      const storageTransactions = storageObject?.transactions || {};
      return storageTransactions[transactionsUuid] || undefined;
    } catch (error) {
      console.error("[GetTransaction]:", error);
      return undefined;
    }
  }

  async updateTransactionsStatus(
    transactionsUuid: string,
    areApproved: boolean
  ): Promise<SessionStorageTransactions | undefined> {
    try {
      const storageObject = await this.get();
      const storageTransactions = storageObject?.transactions || {};
      const transactions = storageTransactions[transactionsUuid];
      if (transactions) {
        storageTransactions[transactionsUuid].areApproved = areApproved;
        await this.set({ [SESSION_TRANSACTIONS_KEY]: storageTransactions });
        return transactions;
      }
      return undefined;
    } catch (error) {
      console.error("[UpdateTransactionStatus]:", error);
      return undefined;
    }
  }
}

/**
 * Session storage data resets on browser restart.
 */
interface SessionStorageData {
  /**
   * Plaintext password without encryption.
   */
  password: string | undefined;

  /**
   * Map from uuid string to array of transactions.
   */
  transactions: Record<string, SessionStorageTransactions> | undefined;
}

export interface SessionStorageTransactions {
  areApproved: boolean | undefined;
  transactionsOptions: InjectedAPITransactionOptions[];
}
