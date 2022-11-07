export type ACCOUNTS_CHANGED_EVENT = "accountsChanged";
export type NETWORK_CHANGED_EVENT = "networkChanged";
export type InjectedApiEvents = ACCOUNTS_CHANGED_EVENT | NETWORK_CHANGED_EVENT;

export interface EventCallback {
  signature: string;
  callback: (data: any) => any;
}

export interface ConnectedAccount {
  accountId: string;
  publicKey: string;
}

export type GetConnectedAccountsResponse = Promise<ConnectedAccount[]>;
