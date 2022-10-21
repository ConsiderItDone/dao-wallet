import { useState } from "react";
import { useLedger, useBorsh, useInvoke, useAuth, useQuery } from "./";
import { UsePolywrapInvokeState } from "@polywrap/react/build/invoke";
import { formatNearAmount } from "../utils/format";
import { BigNumber } from "ethers";
import { AccessKey } from "@cidt/near-plugin-js/build/wrap";
import { toPublicKey } from "../utils/near";
import {
  FT_MINIMUM_STORAGE_BALANCE,
  FT_MINIMUM_STORAGE_BALANCE_LARGE,
  NEAR_TOKEN,
} from "../consts/near";
import {
  isStorageBalanceAvailable,
  sendFungibleToken,
  transferStorageDeposit,
} from "../utils/fungibleTokens";
import { VIEW_FUNCTION_METHOD_NAME } from "../consts/wrapper";

interface SendTxArgs {
  receiverId: string;
  amount: number;
}

export const useSendTransaction = (
  token = NEAR_TOKEN
): UsePolywrapInvokeState & {
  execute: (args: SendTxArgs) => Promise<UsePolywrapInvokeState>;
  confirmLedger: boolean;
} => {
  const [state, setState] = useState<
    UsePolywrapInvokeState & { confirmLedger: boolean }
  >({
    data: undefined,
    error: undefined,
    loading: false,
    confirmLedger: false,
  });
  const { serialize } = useBorsh();
  const invoke = useInvoke();
  const { sign } = useLedger();
  const { currentAccount } = useAuth();

  const [getAccessKeys] =
    useQuery<{ accessKey: AccessKey; publicKey: string }[]>("getAccessKeys");

  const [viewFunctionExecute] = useQuery(VIEW_FUNCTION_METHOD_NAME);
  const [functionCallExecute] = useQuery("functionCall");

  const execute = async ({ receiverId, amount }: SendTxArgs) => {
    setState((state) => ({ ...state, loading: true }));
    let error: Error;
    if (!currentAccount!.isLedger) {
      let result;
      if (token.address === NEAR_TOKEN.address) {
        result = await invoke({
          method: "sendMoney",
          args: {
            signerId: currentAccount!.accountId,
            receiverId: receiverId,
            amount: formatNearAmount(amount),
          },
        });
      } else {
        /*
         If storage balance of fungible token is not available for receiver account
         we need to transfer deposit to storage with NEAR token
         before sending chosen fungible token to receiver.
        */
        const isTokenTransferAvailable = await isStorageBalanceAvailable(
          receiverId,
          token.address,
          viewFunctionExecute
        );

        if (!isTokenTransferAvailable) {
          try {
            await transferStorageDeposit(
              currentAccount!.accountId,
              receiverId,
              token.address,
              FT_MINIMUM_STORAGE_BALANCE,
              functionCallExecute
            );
          } catch (error: any) {
            if (error?.message?.includes("attached deposit is less than")) {
              await transferStorageDeposit(
                currentAccount!.accountId,
                receiverId,
                token.address,
                FT_MINIMUM_STORAGE_BALANCE_LARGE,
                functionCallExecute
              );
            }
          }
        }

        result = await sendFungibleToken(
          token.address,
          amount,
          token.decimals,
          currentAccount!.accountId,
          receiverId,
          functionCallExecute
        );
      }
      const newState = { ...state, ...result, loading: false };
      setState(newState);
      return newState;
    } else {
      try {
        const { data: accessKeys } = await getAccessKeys({
          accountId: currentAccount?.accountId,
        });

        if (accessKeys?.length) {
          const ledgerPublicKeyString = currentAccount?.publicKey;

          const keyPair = accessKeys.find(
            (key) => key.publicKey === ledgerPublicKeyString
          );

          if (keyPair) {
            const accessKey = keyPair.accessKey;
            const newNonce = BigNumber.from(accessKey.nonce)
              .add("1")
              .toString();

            const { data: transaction, error: createTransactionError } =
              await invoke({
                method: "createTransaction",
                args: {
                  publicKey: toPublicKey(currentAccount?.publicKey!),
                  nonce: newNonce,
                  signerId: currentAccount!.accountId,
                  receiverId: receiverId,
                  actions: [{ deposit: formatNearAmount(amount) }],
                },
              });

            if (createTransactionError) {
              error = createTransactionError;
            }

            if (transaction) {
              const { data: txBytes, error: serializeError } = await serialize(
                transaction
              );

              if (serializeError) {
                error = serializeError;
              }

              if (txBytes) {
                setState((state) => ({ ...state, confirmLedger: true }));
                const signature: Buffer = await sign(txBytes);
                setState((state) => ({ ...state, confirmLedger: false }));

                const sendTxResult = await invoke({
                  method: "sendTransaction",
                  args: {
                    signedTx: {
                      transaction: transaction,
                      signature: {
                        keyType: 0,
                        data: signature,
                      },
                    },
                  },
                });
                const { error: sendTxError } = sendTxResult;
                if (sendTxError) {
                  error = sendTxError;
                }
                const newState = {
                  ...state,
                  ...sendTxResult,
                  loading: false,
                };
                setState(newState);
                return newState;
              }
            }
            const newState = {
              ...state,
              loading: false,
              //@ts-ignore
              error: error,
            };
            setState(newState);
            return newState;
          }
        }
      } catch (e) {
        error = e as Error;
      }
      const newState = {
        ...state,
        loading: false,
        //@ts-ignore
        error: error,
      };
      setState(newState);
      return newState;
    }
  };

  return { execute, ...state };
};
