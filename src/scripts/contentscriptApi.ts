import { KeyPair, keyStores } from "near-api-js";
import { getNearConnectionConfig } from "../utils/near";
import { nearPlugin } from "@cidt/near-plugin-js";
import { PolywrapClient } from "@polywrap/client-js";
import {
  SignTransactionResult,
  Transaction,
} from "@cidt/near-plugin-js/build/wrap";
import { apiUri } from "../hooks";
import { AccountWithPrivateKey } from "../services/chrome/localStorage";
import { Network } from "../types";
import { InjectedAPITransactionOptions } from "./injectedAPI/injectedAPI.types";

interface SignedTransaction {
  transaction: any;
  signature: any;
}

export interface HandleSignResult {
  signedTransactions: SignedTransaction[];
  error: string | null;
}

export async function handleContentscriptSignTransaction(
  accounts: AccountWithPrivateKey[],
  network: Network,
  transactionInArray: InjectedAPITransactionOptions[]
): Promise<SignedTransaction | { error: string }> {
  const signResult = await handleContentscriptSignTransactions(
    accounts,
    network,
    transactionInArray
  );
  if (!signResult.error) {
    return signResult.signedTransactions[0];
  }
  return { error: signResult.error };
}

export async function handleContentscriptSignTransactions(
  accounts: AccountWithPrivateKey[],
  network: Network,
  transactionsOptions: InjectedAPITransactionOptions[]
): Promise<HandleSignResult> {
  try {
    const keyStore = new keyStores.InMemoryKeyStore();
    for (const account of accounts) {
      const keyPair = KeyPair.fromString(account.privateKey!);
      await keyStore.setKey(network.networkId, account.accountId, keyPair);
    }

    const signedTransactions: SignedTransaction[] = [];
    for (const transactionOptions of transactionsOptions) {
      const currentAccount = accounts.find(
        (account) => account.accountId === transactionOptions.signerId
      );

      const nearConfig = getNearConnectionConfig(
        network!,
        keyStore,
        currentAccount
      );

      const polywrapConfig = {
        plugins: [
          {
            uri: "wrap://ens/nearPlugin.polywrap.eth",
            plugin: nearPlugin(nearConfig),
          },
        ],
      };
      const client = new PolywrapClient(polywrapConfig);

      formatTransactionOptions(transactionOptions);

      const createdTransaction = await client.invoke<Transaction>({
        uri: apiUri,
        method: "createTransaction",
        args: { ...transactionOptions },
      });

      const createdTransactionData = createdTransaction.data as Transaction;

      const signResult = await client.invoke<SignTransactionResult>({
        uri: apiUri,
        method: "signTransaction",
        args: {
          transaction: createdTransactionData,
        },
      });

      const signedTx = signResult.data?.signedTx;
      signedTransactions.push({
        transaction: signedTx?.transaction!,
        signature: signedTx?.signature!,
      });
    }

    return { signedTransactions, error: null };
  } catch (error: any) {
    return {
      signedTransactions: [],
      error: error?.message || "Failed to sign transaction",
    };
  }
}

// TODO: make it work with other actions (not only 'functionCall')
function formatTransactionOptions(transactionOptions: any) {
  for (let i = 0; i < transactionOptions.actions?.length; i++) {
    const action = transactionOptions.actions[i];
    if (action?.functionCall) {
      const args = action.functionCall.args.buffer;
      // @ts-ignore
      transactionOptions.actions[i] = {
        ...action.functionCall,
        // @ts-ignore
        args,
      };
    }
  }
}
