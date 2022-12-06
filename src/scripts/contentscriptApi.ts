import {
  KeyPair,
  keyStores,
  transactions,
  providers,
  utils,
  InMemorySigner,
} from "near-api-js";
import { AccountWithPrivateKey } from "../services/chrome/localStorage";
import { Network } from "../types";
import {
  InjectedAPISignInParamsDTO,
  InjectedAPISignOutParamsDTO,
  InjectedAPITransactionOptions,
} from "./injectedAPI/injectedAPI.types";
import { AccessKeyView } from "near-api-js/lib/providers/provider";

interface SignedTransaction {
  transaction: any;
  signature: any;
}

export interface HandleSignTransactionsResult {
  signedTransactions: SignedTransaction[];
  error: string | null;
}

export interface HandleSignInOutResult {
  error: string | null;
}

export async function handleContentScriptSignTransaction(
  accounts: AccountWithPrivateKey[],
  network: Network,
  transactionInArray: InjectedAPITransactionOptions[]
): Promise<SignedTransaction | { error: string }> {
  const signResult = await handleContentScriptSignTransactions(
    accounts,
    network,
    transactionInArray
  );
  if (!signResult.error) {
    return signResult.signedTransactions[0];
  }
  return { error: signResult.error };
}

export async function handleContentScriptSignTransactions(
  accounts: AccountWithPrivateKey[],
  network: Network,
  transactionsOptions: InjectedAPITransactionOptions[]
): Promise<HandleSignTransactionsResult> {
  try {
    const accountToNonce = new Map<string, number>();
    const accountToBlock = new Map<string, any>();

    const keyStore = new keyStores.InMemoryKeyStore();
    for (const account of accounts) {
      const keyPair = KeyPair.fromString(account.privateKey!);
      await keyStore.setKey(network.networkId, account.accountId, keyPair);
    }

    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    const signedTransactions: SignedTransaction[] = [];
    for (const transactionOptions of transactionsOptions) {
      const currentAccount = accounts.find(
        (account) => account.accountId === transactionOptions.signerId
      );
      const accountId = currentAccount?.accountId!;

      if (!accountToNonce.has(accountId)) {
        const [providerBlock, accessKey] = await Promise.all([
          provider.block({ finality: "final" }),
          provider.query<AccessKeyView>({
            request_type: "view_access_key",
            finality: "final",
            account_id: currentAccount?.accountId,
            public_key: currentAccount?.publicKey,
          }),
        ]);
        accountToNonce.set(accountId, accessKey.nonce);
        accountToBlock.set(accountId, providerBlock);
      }
      const nonce = accountToNonce.get(accountId)! + 1;
      accountToNonce.set(accountId, nonce);
      const block = accountToBlock.get(accountId);

      const signer = new InMemorySigner(keyStore);

      formatActions(transactionOptions.actions);

      const transaction = transactions.createTransaction(
        currentAccount?.accountId!,
        utils.PublicKey.from(currentAccount?.publicKey!),
        transactionOptions.receiverId,
        nonce!,
        transactionOptions.actions,
        utils.serialize.base_decode(block.header.hash)
      );

      const [, signedTx] = await transactions.signTransaction(
        // @ts-ignore
        transaction,
        signer,
        transaction.signerId,
        network.networkId
      );

      signedTransactions.push({
        transaction: signedTx?.transaction!,
        signature: signedTx?.signature!,
        // @ts-ignore
        encodeResult: signedTx.encode(),
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

async function handleContentScriptSignInOrOut(
  accountsFromStorage: AccountWithPrivateKey[],
  network: Network,
  params: InjectedAPISignInParamsDTO | InjectedAPISignOutParamsDTO,
  type: "signIn" | "signOut"
): Promise<HandleSignInOutResult> {
  try {
    const accountToNonce = new Map<string, number>();
    const accountToBlock = new Map<string, any>();

    const keyStore = new keyStores.InMemoryKeyStore();
    for (const account of accountsFromStorage) {
      const keyPair = KeyPair.fromString(account.privateKey!);
      await keyStore.setKey(network.networkId, account.accountId, keyPair);
    }

    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    const permission =
      type === "signIn"
        ? (params as InjectedAPISignInParamsDTO).permission
        : null;
    for (let i = 0; i < params.accounts.length; i += 1) {
      const currentAccountWithNewPK = params.accounts[i];
      const currentAccountFromStorage = accountsFromStorage.find(
        (account) => account.accountId === currentAccountWithNewPK.accountId
      );
      if (!currentAccountFromStorage) {
        continue;
      }

      const accountId = currentAccountFromStorage.accountId;

      if (!accountToNonce.has(accountId)) {
        const [providerBlock, accessKey] = await Promise.all([
          provider.block({ finality: "final" }),
          provider.query<AccessKeyView>({
            request_type: "view_access_key",
            finality: "final",
            account_id: accountId,
            public_key: currentAccountFromStorage.publicKey,
          }),
        ]);
        accountToNonce.set(accountId, accessKey.nonce);
        accountToBlock.set(accountId, providerBlock);
      }
      const nonce = accountToNonce.get(accountId)! + 1;
      accountToNonce.set(accountId, nonce);

      const block = accountToBlock.get(accountId);

      const signer = new InMemorySigner(keyStore);

      const keyPair = await keyStore.getKey(network.networkId, accountId);

      const actions =
        type === "signIn"
          ? [
              transactions.addKey(
                utils.PublicKey.from(currentAccountWithNewPK.publicKey),
                transactions.functionCallAccessKey(
                  permission!.receiverId,
                  permission!.methodNames,
                  permission!.allowance
                )
              ),
            ]
          : [
              transactions.deleteKey(
                utils.PublicKey.from(currentAccountWithNewPK.publicKey)
              ),
            ];

      const transaction = transactions.createTransaction(
        accountId,
        keyPair.getPublicKey(),
        accountId,
        nonce,
        actions,
        utils.serialize.base_decode(block.header.hash)
      );

      const [, signedTx] = await transactions.signTransaction(
        transaction,
        signer,
        transaction.signerId,
        network.networkId
      );

      await provider.sendTransaction(signedTx);
    }

    return { error: null };
  } catch (error: any) {
    return {
      error: error?.message || `Failed to ${type}`,
    };
  }
}

export async function handleContentScriptSignIn(
  accounts: AccountWithPrivateKey[],
  network: Network,
  params: InjectedAPISignInParamsDTO
): Promise<HandleSignInOutResult> {
  return handleContentScriptSignInOrOut(accounts, network, params, "signIn");
}

export async function handleContentScriptSignOut(
  accounts: AccountWithPrivateKey[],
  network: Network,
  params: InjectedAPISignOutParamsDTO
): Promise<HandleSignInOutResult> {
  return handleContentScriptSignInOrOut(accounts, network, params, "signOut");
}

function formatActions(actions: any[]) {
  for (let i = 0; i < actions?.length; i++) {
    const action = actions[i];
    switch (action.enum) {
      case "createAccount": {
        actions[i] = transactions.createAccount();
        break;
      }
      case "deployContract": {
        actions[i] = transactions.deployContract(
          Uint8Array.from(action.deployContract.code)
        );
        break;
      }
      case "functionCall": {
        actions[i] = transactions.functionCall(
          action.functionCall.methodName,
          action.functionCall.args,
          action.functionCall.gas,
          action.functionCall.deposit
        );
        break;
      }
      case "transfer": {
        actions[i] = transactions.transfer(action.transfer.deposit);
        break;
      }
      case "stake": {
        actions[i] = transactions.stake(
          action.stake.stake,
          utils.PublicKey.from(action.stake.publicKey)
        );
        break;
      }
      case "addKey": {
        if (action.addKey.accessKey.permission.enum === "fullAccess") {
          actions[i] = transactions.addKey(
            utils.PublicKey.from(action.addKey.publicKey),
            transactions.fullAccessKey()
          );
        } else {
          actions[i] = transactions.addKey(
            utils.PublicKey.from(action.addKey.publicKey),
            transactions.functionCallAccessKey(
              action.addKey.accessKey.permission.functionCall.receiverId,
              action.addKey.accessKey.permission.functionCall.methodNames,
              action.addKey.accessKey.permission.functionCall.allowance
            )
          );
        }
        break;
      }
      case "deleteKey": {
        actions[i] = transactions.deleteKey(
          utils.PublicKey.from(action.deleteKey.publicKey)
        );
        break;
      }
      case "deleteAccount": {
        actions[i] = transactions.deleteAccount(
          action.deleteAccount.beneficiaryId
        );
        break;
      }
      default: {
        return {
          type: action.enum,
          params: (action as any)[action.enum],
        };
      }
    }
  }
}
