import { ApplicationStorageArea } from "./extensionStorage";

const STORAGE_DATA_KEY = "daoWallet";

/**
 * Used to imitate extension storage when running application in development mode in browser as react app.
 */
export class BrowserStorageWrapper implements ApplicationStorageArea {
  private storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  async get(
    keys: string | string[] | { [p: string]: any } | null | undefined
  ): Promise<{ [p: string]: any }> {
    return this.getParsedStorageObject() || {};
  }

  async set(items: { [p: string]: any }): Promise<void> {
    let storageObject: any = this.getParsedStorageObject();
    if (!storageObject) {
      storageObject = {};
    }
    storageObject = { ...storageObject, ...items };
    this.storage.setItem(STORAGE_DATA_KEY, JSON.stringify(storageObject));
  }

  private getParsedStorageObject(): object | undefined {
    const storageObject = this.storage.getItem(STORAGE_DATA_KEY);
    if (!storageObject) {
      return undefined;
    }

    const data = JSON.parse(storageObject);
    if (!data) {
      return undefined;
    }

    return data;
  }
}
