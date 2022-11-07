import {
  INJECTED_API_CONNECT_METHOD,
  INJECTED_API_GET_CONNECTED_ACCOUNTS_METHOD,
  INJECTED_API_GET_NETWORK_METHOD,
  INJECTED_API_INITIALIZED_EVENT_NAME,
  UNINITIALIZED_NETWORK,
  WALLET_CONTENTSCRIPT_MESSAGE_TARGET,
  WALLET_INJECTED_API_MESSAGE_TARGET,
} from "./scripts.consts";
import {
  ConnectedAccount,
  InjectedApiEvents,
  GetConnectedAccountsResponse,
  EventCallback,
} from "./scripts.types";
import {
  InjectedAPIAccount,
  InjectedAPIConnectParams,
  InjectedAPIEvents,
  InjectedAPINetwork,
  InjectedAPISignInParams,
  InjectedAPISignOutParams,
  InjectedAPISignTransactionParams,
  InjectedAPISignTransactionsParams,
  InjectedAPIUnsubscribe,
  InjectedWallet,
} from "./injectedAPI.types";
import { transactions, utils } from "near-api-js";
import { v4 as uuidv4 } from "uuid";
import { InjectedAPIMessage } from "./injectedAPI.custom.types";

export class InjectedAPI implements InjectedWallet {
  public readonly id: string = "omniWallet";

  public initialized: boolean = false;

  public get connected() {
    return this.accounts?.length > 0;
  }

  public network: InjectedAPINetwork = UNINITIALIZED_NETWORK;

  public accounts: InjectedAPIAccount[] = [];

  private eventCallbacks: Map<string, EventCallback[]> = new Map<
    string,
    EventCallback[]
  >();

  constructor() {
    this.setupEventListeners();
    this.getNetwork()
      .then(() => {
        return this.getConnectedAccounts();
      })
      .then(() => {
        this.initialized = true;
        window.dispatchEvent(new Event(INJECTED_API_INITIALIZED_EVENT_NAME));
      })
      .catch((error) => {
        console.error(
          "Omni Near Wallet injected API initialization failed:",
          error
        );
      });
  }

  public async supportsNetwork(networkId: string): Promise<boolean> {
    return ["testnet", "mainnet"].indexOf(networkId) > -1;
  }

  // TODO: add changing network
  public async connect(
    params: InjectedAPIConnectParams
  ): Promise<Array<InjectedAPIAccount>> {
    const response = await this.sendMessage<GetConnectedAccountsResponse>(
      INJECTED_API_CONNECT_METHOD,
      null,
      true
    );
    return this.handleConnectedAccountsChange(response);
  }

  public async disconnect(): Promise<void> {
    this.handleConnectedAccountsChange([]);
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
    // TODO: send message to content script to open sign transaction popup
    return transactions.SignedTransaction.decode(Buffer.from([1, 2]));
  }

  public async signTransactions(
    params: InjectedAPISignTransactionsParams
  ): Promise<Array<transactions.SignedTransaction>> {
    // TODO: send message to content script to open sign transactions popup
    return [transactions.SignedTransaction.decode(Buffer.from([1, 2]))];
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
      // TODO: get message with current network
      switch (method) {
        case INJECTED_API_GET_CONNECTED_ACCOUNTS_METHOD:
          this.handleConnectedAccountsChange(response);
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
      const accountsWithPublicKey =
        accounts.map((account) => ({
          ...account,
          publicKey: utils.PublicKey.from(account.publicKey),
        })) || [];

      this.accounts = accountsWithPublicKey;
      this.executeEventCallbacks("accountsChanged", accountsWithPublicKey);
      return accountsWithPublicKey;
    }
    return [];
  }

  private async handleNetworkChange(
    network: InjectedAPINetwork
  ): Promise<InjectedAPINetwork> {
    this.executeEventCallbacks("networkChanged", network);
    return network;
  }

  private async getNetwork() {
    this.sendMessage<InjectedAPINetwork>(INJECTED_API_GET_NETWORK_METHOD);
  }

  private async getConnectedAccounts() {
    this.sendMessage(INJECTED_API_GET_CONNECTED_ACCOUNTS_METHOD);
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
      response = new Promise((resolve) => {
        const listener = async (event: MessageEvent<any>) => {
          const message: InjectedAPIMessage = event?.data;
          const messageTo: string = message?.target;
          if (
            event.source === window &&
            messageTo === WALLET_INJECTED_API_MESSAGE_TARGET &&
            message?.id === messageId
          ) {
            window.removeEventListener("message", listener);
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
