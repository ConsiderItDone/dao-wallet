import { PolywrapClientConfig } from "@polywrap/client-js";
import { nearPlugin } from "@cidt/near-plugin-js";
import { keyStores, KeyPair } from "near-api-js";
import { AuthState } from "../provider/AuthProvider";

export interface AuthConfig extends AuthState {}

export function getPolywrapConfig(
  authConfig: AuthConfig
): Partial<PolywrapClientConfig> {
  const { selectedAccountIndex, network: networkId, accounts } = authConfig;

  const selectedAccount = accounts.find(
    (acc, index) => index === selectedAccountIndex
  );

  const keyStore = new keyStores.InMemoryKeyStore();

  //@ts-ignore
  window.keyStore = keyStore;

  for (const account of accounts) {
    if (account?.privateKey) {
      const keyPair = KeyPair.fromString(account.privateKey);
      keyStore.setKey(networkId, account.accountId, keyPair);
    } else {
      const keyPair = KeyPair.fromRandom("ed25519");
      keyStore.setKey(networkId, account.accountId, keyPair);
    }
  }

  return {
    plugins: [
      {
        uri: "wrap://ens/nearPlugin.polywrap.eth",
        plugin: nearPlugin({
          headers: {},
          keyStore: keyStore,
          masterAccount: selectedAccount?.accountId,
          networkId: networkId,
          nodeUrl: `https://rpc.${networkId}.near.org`,
          walletUrl: `https://wallet.${networkId}.near.org`,
          helperUrl: `https://helper.${networkId}.near.org`,
        }),
      },
    ],
  };
}
