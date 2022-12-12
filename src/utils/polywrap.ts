import { PolywrapClientConfig } from "@polywrap/client-js";
import { nearPlugin } from "@cidt/near-plugin-js";
import { keyStores, KeyPair } from "near-api-js";
import { AuthState } from "../provider/AuthProvider";
import { getNearConnectionConfig } from "./near";
import { InvokeResult } from "@polywrap/core-js";
import { Network } from "../types";
import { AccountWithPrivateKey } from "../services/chrome/localStorage";

export interface AuthConfig extends AuthState {}

export function getPolywrapConfig(
  authConfig: AuthConfig,
  selectedAccount: AccountWithPrivateKey | undefined,
  selectedNetwork: Network
): Partial<PolywrapClientConfig> {
  const { accounts } = authConfig;

  const keyStore = new keyStores.InMemoryKeyStore();

  //@ts-ignore
  window.keyStore = keyStore;

  for (const account of accounts) {
    if (account?.privateKey) {
      const keyPair = KeyPair.fromString(account.privateKey);
      keyStore.setKey(selectedNetwork.networkId, account.accountId, keyPair);
    }
  }

  return {
    plugins: [
      {
        uri: "wrap://ens/nearPlugin.polywrap.eth",
        plugin: nearPlugin(
          getNearConnectionConfig(selectedNetwork, keyStore, selectedAccount)
        ),
      },
    ],
  };
}

export async function fetchWithViewFunction(
  args: any,
  viewFunctionExecute: (
    args?: Record<string, unknown> | Uint8Array
  ) => Promise<InvokeResult>
) {
  try {
    const result = await viewFunctionExecute(args);
    const viewFunctionResult = result?.data;
    const fnResult = JSON.parse(viewFunctionResult as any).result;
    const parsedResult = new TextDecoder().decode(
      Uint8Array.from(fnResult).buffer
    );
    return JSON.parse(parsedResult);
  } catch {
    return null;
  }
}
