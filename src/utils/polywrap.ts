import { PolywrapClientConfig } from "@polywrap/client-js";
import { nearPlugin } from "@cidt/near-plugin-js";
import { fileSystemResolverPlugin } from "@polywrap/fs-resolver-plugin-js";
import { fileSystemPlugin } from "@polywrap/fs-plugin-js";
import { keyStores, KeyPair } from "near-api-js";

export function getPolywrapConfig(): Partial<PolywrapClientConfig> {
  const accountId = "polydev.testnet";
  const networkId = "testnet";
  const privateKey =
    "ed25519:4HbxvXyS76rvNdHcad3HegGzdVcpNid3LE1vbdZNMSqygZJrL2PRQDzPWZA5hopCBFuJNmp9kihyJKPEagVPsPEc";
  const keyStore = new keyStores.InMemoryKeyStore();

  //@ts-ignore
  window.keyStore = keyStore;

  const keyPair = KeyPair.fromString(privateKey);
  keyStore.setKey(networkId, accountId, keyPair);

  const ledgerAccountId =
    "d6cffd5f97babaf6226e944fb0dde03bda6b2bc3d91e665b724dbf6ea10754f2";
  const ledgerKeyPair = KeyPair.fromRandom("ed25519");
  //@ts-ignore
  window.keyPair = ledgerKeyPair;

  keyStore.setKey(networkId, ledgerAccountId, ledgerKeyPair);

  return {
    plugins: [
      {
        uri: "wrap://ens/nearPlugin.polywrap.eth",
        plugin: nearPlugin({
          headers: {},
          keyStore: keyStore,
          masterAccount: accountId,
          networkId: "testnet",
          nodeUrl: "https://rpc.testnet.near.org",
          walletUrl: "https://wallet.testnet.near.org",
          helperUrl: "https://helper.testnet.near.org",
        }),
      },
      {
        uri: "wrap://ens/fs-resolver.polywrap.eth",
        plugin: fileSystemResolverPlugin({}),
      },
      {
        uri: "wrap://ens/fs.polywrap.eth",
        plugin: fileSystemPlugin({}),
      },
    ],
  };
}
