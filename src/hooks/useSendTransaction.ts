import { useState } from "react";
import { useLedger, useBorsh, useInvoke, useAuth, useQuery } from "./";
import { UsePolywrapInvokeState } from "@polywrap/react/build/invoke";
import { formatNearAmount } from "../utils/format";
import { BigNumber } from "ethers";
import { AccessKey } from "@cidt/near-plugin-js/build/wrap";
import { toPublicKey } from "../utils/near";

interface SendTxArgs {
  receiverId: string;
  amount: number;
}

export const useSendTransaction = (): UsePolywrapInvokeState & {
  execute: (args: SendTxArgs) => Promise<UsePolywrapInvokeState>;
} => {
  const [state, setState] = useState<UsePolywrapInvokeState>({
    data: undefined,
    error: undefined,
    loading: false,
  });
  const { serialize } = useBorsh();
  const invoke = useInvoke();
  const { sign } = useLedger();
  const { currentAccount } = useAuth();

  const [getAccessKeys] =
    useQuery<{ accessKey: AccessKey; publicKey: string }[]>("getAccessKeys");

  const execute = async ({ receiverId, amount }: SendTxArgs) => {
    setState((state) => ({ ...state, loading: true }));
    let error: Error;
    if (!currentAccount!.isLedger) {
      const result = await invoke({
        method: "sendMoney",
        args: {
          signerId: currentAccount!.accountId,
          receiverId: receiverId,
          amount: formatNearAmount(amount),
        },
      });
      const newState = { ...result, loading: false };
      setState(newState);
      return newState;
    } else {
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
          const newNonce = BigNumber.from(accessKey.nonce).add("1").toString();

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
              //@ts-ignore
              const signature = await sign(txBytes);

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

      const newState = {
        ...state,
        loading: false,
        //@ts-ignore
        error: error,
      };
      setState(newState);
      return newState;
    }
    return state;
  };

  return { execute, ...state };
};
