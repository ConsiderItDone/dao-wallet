import {
  emitDevelopmentStorageEvent,
  ExtensionStorage,
} from "./extensionStorage";
import { BrowserStorageWrapper } from "./browserStorageWrapper";
import { IS_IN_DEVELOPMENT_MODE } from "../../consts/app";
import {
  InjectedAPISignInParamsDTO,
  InjectedAPISignOutParamsDTO,
  InjectedAPITransactionOptions,
} from "../../scripts/injectedAPI/injectedAPI.types";

export const SESSION_PASSWORD_KEY = "password";
export const SESSION_TRANSACTIONS_DATA_KEY = "transactionsData";

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
      emitDevelopmentStorageEvent(SESSION_STORAGE_PASSWORD_CHANGED_EVENT);
      return result;
    } catch (error) {
      console.error("[SetDecryptedPassword]:", error);
    }
  }

  async addTransactionsData(
    transactionsData: SessionStorageTransactionsData,
    transactionsDataUuid: string
  ) {
    try {
      const storageObject = await this.get();
      const storageTransactionsData = storageObject?.transactionsData || {};
      storageTransactionsData[transactionsDataUuid] = transactionsData;
      return await this.set({
        [SESSION_TRANSACTIONS_DATA_KEY]: storageTransactionsData,
      });
    } catch (error) {
      console.error("[AddTransactions]:", error);
    }
  }

  async getTransactionsData(
    transactionsDataUuid: string
  ): Promise<SessionStorageTransactionsData | undefined> {
    try {
      const storageObject = await this.get();
      const storageTransactionsData = storageObject?.transactionsData || {};
      return storageTransactionsData[transactionsDataUuid] || undefined;
    } catch (error) {
      console.error("[GetTransaction]:", error);
      return undefined;
    }
  }

  async updateTransactionsDataStatus(
    transactionsDataUuid: string,
    isApproved: boolean
  ): Promise<SessionStorageTransactionsData | undefined> {
    try {
      const storageObject = await this.get();
      const storageTransactionsData = storageObject?.transactionsData || {};
      const transactionsData = storageTransactionsData[transactionsDataUuid];
      if (transactionsData) {
        storageTransactionsData[transactionsDataUuid].isApproved = isApproved;
        await this.set({
          [SESSION_TRANSACTIONS_DATA_KEY]: storageTransactionsData,
        });
        return transactionsData;
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
   * Map from uuid string to transactions data.
   */
  transactionsData: Record<string, SessionStorageTransactionsData> | undefined;
}

export interface SessionStorageTransactionsData {
  dataType: TransactionsDataType;
  data: TransactionsData;
  isApproved: boolean | undefined;
}

export type TransactionsDataType = "signTransactions" | "signIn" | "signOut";
export type TransactionsData =
  | InjectedAPITransactionOptions[]
  | InjectedAPISignInParamsDTO
  | InjectedAPISignOutParamsDTO;
