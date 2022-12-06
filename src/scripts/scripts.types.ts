import { InjectedAPIMessage } from "./injectedAPI/injectedAPI.custom.types";
import { Network } from "../types";
import { AccountWithPrivateKey } from "../services/chrome/localStorage";
import {
  InjectedAPISignInParamsDTO,
  InjectedAPISignOutParamsDTO,
  InjectedAPITransactionOptions,
} from "./injectedAPI/injectedAPI.types";

export type ACCOUNTS_CHANGED_EVENT = "accountsChanged";
export type NETWORK_CHANGED_EVENT = "networkChanged";
export type InjectedApiEvents = ACCOUNTS_CHANGED_EVENT | NETWORK_CHANGED_EVENT;

export interface ChromeRuntimeMessage {
  data: InjectedAPIMessage;
  origin: string;
}

export interface EventCallback {
  signature: string;
  callback: (data: any) => any;
}

export interface ConnectedAccount {
  accountId: string;
  publicKey: string;
}

export type GetConnectedAccountsResponse = Promise<ConnectedAccount[]>;

export interface ContentScriptSignTransactionsData {
  network: Network;
  accounts: AccountWithPrivateKey[];
  transactionsOptions: InjectedAPITransactionOptions[];
}

export interface ContentScriptSignInData {
  network: Network;
  accounts: AccountWithPrivateKey[];
  params: InjectedAPISignInParamsDTO;
}

export interface ContentScriptSignOutData {
  network: Network;
  accounts: AccountWithPrivateKey[];
  params: InjectedAPISignOutParamsDTO;
}
