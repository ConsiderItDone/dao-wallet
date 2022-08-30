import { PolywrapClientConfig } from "@polywrap/client-js";
import { nearPlugin } from "@cidt/near-plugin-js";

export function getPolywrapConfig(): Partial<PolywrapClientConfig> {
  return {
    plugins: [
      {
        uri: "wrap://ens/nearPlugin.polywrap.eth",
        plugin: nearPlugin({
          headers: {},
          networkId: "testnet",
          nodeUrl: "https://rpc.testnet.near.org",
          walletUrl: "https://wallet.testnet.near.org",
          helperUrl: "https://helper.testnet.near.org",
        }),
      },
    ],
  };
}
