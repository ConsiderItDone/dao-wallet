import { useState } from "react";
import { useLedger, useBorsh, useInvoke } from "./";
import { UsePolywrapInvokeState } from "@polywrap/react/build/invoke";
import { formatNearAmount } from "../utils/format";

interface SendTxArgs {
  receiverId: string;
  amount: number;
}

export const useSendTransaction = (
  accountId: string,
  isLedgerAccount = false
): UsePolywrapInvokeState & {
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

  const execute = async ({ receiverId, amount }: SendTxArgs) => {
    setState((state) => ({ ...state, loading: true }));
    let error: Error;
    if (!isLedgerAccount) {
      const result = await invoke({
        method: "sendMoney",
        args: {
          signerId: accountId,
          receiverId: receiverId,
          amount: formatNearAmount(amount),
        },
      });
      const newState = { ...result, loading: false };
      setState(newState);
      return newState;
    } else {
      const { data: transaction, error: createTransactionError } = await invoke(
        {
          method: "createTransaction",
          args: {
            signerId: accountId,
            receiverId: receiverId,
            actions: [{ deposit: formatNearAmount(amount) }],
          },
        }
      );

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
  };

  return { execute, ...state };
};
