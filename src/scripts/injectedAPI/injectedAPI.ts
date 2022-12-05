import { equals } from "ramda";
import {
  INJECTED_API_CONNECT_METHOD,
  INJECTED_API_DISCONNECT_METHOD,
  INJECTED_API_GET_CONNECTED_ACCOUNTS_METHOD,
  INJECTED_API_GET_NETWORK_METHOD,
  INJECTED_API_INITIALIZED_EVENT_NAME,
  INJECTED_API_SHOULD_UPDATE_CONNECTED_ACCOUNTS_METHOD,
  INJECTED_API_SHOULD_UPDATE_NETWORK_METHOD,
  INJECTED_API_SIGN_TRANSACTION_METHOD,
  INJECTED_API_SIGN_TRANSACTIONS_METHOD,
  SUPPORTED_NETWORKS,
  UNINITIALIZED_NETWORK,
  WALLET_CONTENTSCRIPT_MESSAGE_TARGET,
  WALLET_INJECTED_API_MESSAGE_TARGET,
} from "../scripts.consts";
import {
  ConnectedAccount,
  InjectedApiEvents,
  GetConnectedAccountsResponse,
  EventCallback,
} from "../scripts.types";
import {
  InjectedAPIAccount,
  InjectedAPIConnectParams,
  InjectedAPIEvents,
  InjectedAPINetwork,
  InjectedAPISignInParams,
  InjectedAPISignOutParams,
  InjectedAPISignTransactionParams,
  InjectedAPISignTransactionsParams,
  InjectedAPITransactionOptions,
  InjectedAPIUnsubscribe,
  InjectedWallet,
} from "./injectedAPI.types";
import { transactions, utils } from "near-api-js";
import { v4 as uuidv4 } from "uuid";
import { InjectedAPIMessage } from "./injectedAPI.custom.types";

export class InjectedAPI implements InjectedWallet {
  public readonly id: string = "daoWallet";

  public initialized: boolean = false;

  public get connected() {
    return this.accounts?.length > 0;
  }

  public network: InjectedAPINetwork = UNINITIALIZED_NETWORK;

  public accounts: InjectedAPIAccount[] = [];

  private accountsWithPlainPK: ConnectedAccount[] = [];

  private eventCallbacks: Map<string, EventCallback[]> = new Map<
    string,
    EventCallback[]
  >();

  constructor() {
    this.setupEventListeners();
    this.getNetwork()
      .then(() => this.getConnectedAccounts())
      .then(() => {
        this.initialized = true;
        window.dispatchEvent(new Event(INJECTED_API_INITIALIZED_EVENT_NAME));
      })
      .catch((error) => {
        console.error("DAO Wallet injected API initialization failed:", error);
      });
  }

  public async supportsNetwork(networkId: string): Promise<boolean> {
    return !!networkId && SUPPORTED_NETWORKS.indexOf(networkId) > -1;
  }

  public async connect(
    params: InjectedAPIConnectParams
  ): Promise<Array<InjectedAPIAccount>> {
    const isNetworkSupported = await this.supportsNetwork(params?.networkId);
    if (params?.networkId) {
      if (params?.networkId === this.network.networkId) {
        return this.accounts;
      } else if (!isNetworkSupported) {
        throw new Error(`Network ${params?.networkId} is not supported`);
      }
    }
    const response = await this.sendMessage<GetConnectedAccountsResponse>(
      INJECTED_API_CONNECT_METHOD,
      params,
      true
    );
    return this.handleConnectedAccountsChange(response);
  }

  public async disconnect(): Promise<void> {
    await this.sendMessage(INJECTED_API_DISCONNECT_METHOD, null, true);
    await this.handleConnectedAccountsChange([]);
  }

  public async signIn(params: InjectedAPISignInParams): Promise<void> {}

  public async signOut(params: InjectedAPISignOutParams): Promise<void> {}

  public on<EventName extends keyof InjectedAPIEvents>(
    event: EventName,
    callback: (params: InjectedAPIEvents[EventName]) => void
  ): InjectedAPIUnsubscribe {
    let callbacks = this.eventCallbacks.get(event) || [];
    callbacks.push({ signature: callback.toString(), callback });
    this.eventCallbacks.set(event, callbacks);
    return () => {
      this.off(event, callback);
    };
  }

  public off<EventName extends keyof InjectedAPIEvents>(
    event: EventName,
    callback?: (params: InjectedAPIEvents[EventName]) => void
  ): void {
    let callbacks = this.eventCallbacks.get(event) || [];
    if (callback) {
      const callbackSignature = callback.toString();
      callbacks = callbacks.filter(
        (existingCallback) => existingCallback.signature !== callbackSignature
      );
    } else {
      callbacks = [];
    }
    this.eventCallbacks.set(event, callbacks);
  }

  public async signTransaction(
    params: InjectedAPISignTransactionParams
  ): Promise<transactions.SignedTransaction> {
    this.formatSignTransactionsBeforeSend([params.transaction]);

    const response: any = await this.sendMessage(
      INJECTED_API_SIGN_TRANSACTION_METHOD,
      params,
      true
    );

    return {
      transaction: response?.transaction!,
      signature: response?.signature!,
      encode(): Uint8Array {
        return response.encodeResult;
      },
    };
  }

  public async signTransactions(
    params: InjectedAPISignTransactionsParams
  ): Promise<Array<transactions.SignedTransaction>> {
    this.formatSignTransactionsBeforeSend(params.transactions);

    const response: any = await this.sendMessage(
      INJECTED_API_SIGN_TRANSACTIONS_METHOD,
      params,
      true
    );

    return response.map((signedTransaction: any) => ({
      transaction: signedTransaction?.transaction!,
      signature: signedTransaction?.signature!,
      encode(): Uint8Array {
        return signedTransaction.encodeResult;
      },
    }));
  }

  // Adds event listeners for getting messages from content script and background script
  private setupEventListeners() {
    window.addEventListener("message", async (event) => {
      const message: InjectedAPIMessage = event?.data;
      const messageTo: string = message?.target;
      if (
        event?.source !== window ||
        messageTo !== WALLET_INJECTED_API_MESSAGE_TARGET
      ) {
        return;
      }

      const method = message?.method;
      const response = await message.response;
      switch (method) {
        case INJECTED_API_GET_CONNECTED_ACCOUNTS_METHOD:
          this.handleConnectedAccountsChange(response);
          break;
        case INJECTED_API_GET_NETWORK_METHOD:
          this.handleNetworkChange(response);
          break;
        case INJECTED_API_SHOULD_UPDATE_NETWORK_METHOD:
          this.getNetwork();
          break;
        case INJECTED_API_SHOULD_UPDATE_CONNECTED_ACCOUNTS_METHOD:
          this.getConnectedAccounts();
          break;
        default:
          break;
      }
    });
  }

  private async handleConnectedAccountsChange(
    accountsPromise: ConnectedAccount[] | undefined
  ) {
    let accounts = await accountsPromise;
    if (Array.isArray(accounts)) {
      if (!equals(this.accountsWithPlainPK, accounts)) {
        this.accountsWithPlainPK = accounts;

        const accountsWithPublicKey =
          accounts.map((account) => ({
            ...account,
            publicKey: utils.PublicKey.from(account.publicKey),
          })) || [];

        this.accounts = accountsWithPublicKey;
        this.executeEventCallbacks("accountsChanged", {
          accounts: accountsWithPublicKey,
        });
      }
      return this.accounts;
    }
    return [];
  }

  private async handleNetworkChange(
    network: InjectedAPINetwork
  ): Promise<InjectedAPINetwork> {
    if (!equals(this.network, network)) {
      this.network = network;
      this.executeEventCallbacks("networkChanged", { network });
    }
    return this.network;
  }

  private async getNetwork() {
    const network = await this.sendMessage<InjectedAPINetwork>(
      INJECTED_API_GET_NETWORK_METHOD,
      null,
      true
    );
    if (network) {
      await this.handleNetworkChange(network);
    }
  }

  private async getConnectedAccounts() {
    const connectedAccounts = await this.sendMessage<ConnectedAccount[]>(
      INJECTED_API_GET_CONNECTED_ACCOUNTS_METHOD,
      null,
      true
    );
    if (connectedAccounts) {
      await this.handleConnectedAccountsChange(connectedAccounts);
    }
  }

  private formatSignTransactionsBeforeSend(
    transactions: Array<InjectedAPITransactionOptions>
  ) {
    for (const transaction of transactions) {
      for (let i = 0; i < transaction?.actions?.length; i++) {
        const action = transaction.actions[i];
        switch (action.enum) {
          case "deleteKey": {
            // @ts-ignore
            transaction.actions[i].deleteKey.publicKey =
              transaction.actions[i].deleteKey.publicKey.toString();
            break;
          }
          case "addKey": {
            // @ts-ignore
            transaction.actions[i].addKey.publicKey =
              transaction.actions[i].addKey.publicKey.toString();
            break;
          }
          case "stake": {
            // @ts-ignore
            transaction.actions[i].stake.publicKey =
              transaction.actions[i].stake.publicKey.toString();
            break;
          }
          default: {
            break;
          }
        }
      }
    }
  }

  private async sendMessage<T>(
    method: string,
    params: any = null,
    shouldWaitForAnswer = false
  ): Promise<T | undefined> {
    const messageId = uuidv4();
    const message: InjectedAPIMessage = {
      id: messageId,
      target: WALLET_CONTENTSCRIPT_MESSAGE_TARGET,
      method,
      params,
    };

    let response: Promise<T> | undefined;
    if (shouldWaitForAnswer) {
      response = new Promise((resolve, reject) => {
        const listener = async (event: MessageEvent<any>) => {
          const message: InjectedAPIMessage = event?.data;
          const messageTo: string = message?.target;
          if (
            event.source === window &&
            messageTo === WALLET_INJECTED_API_MESSAGE_TARGET &&
            message?.id === messageId
          ) {
            window.removeEventListener("message", listener);
            if (message?.response?.error) {
              reject(new Error(message?.response?.error));
            }
            resolve(message?.response as T);
          }
        };

        window.addEventListener("message", listener);
      });
    } else {
      response = undefined;
    }

    window.postMessage(message, window.location.origin);
    return response;
  }

  private executeEventCallbacks(eventName: InjectedApiEvents, data: any) {
    let eventCallbacks = this.eventCallbacks.get(eventName) || [];
    eventCallbacks.forEach((eventCallback) => {
      eventCallback.callback(data);
    });
  }
}
