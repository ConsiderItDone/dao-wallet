import { usePolywrapInvoke } from "@polywrap/react";
import { UsePolywrapInvoke } from "@polywrap/react/build/invoke";
import { InvokeResult } from "@polywrap/core-js";

const ipfsUri = "wrap://ipfs/Qmck2PKpeC794L3ByjMfZoqH8BPDhae1craJsLySwfR6j4";

export const borshUri = ipfsUri;

export const useBorsh = <TData = Record<string, unknown>>(): {
  serialize: (
    args?: Record<string, unknown> | Uint8Array
  ) => Promise<InvokeResult<TData>>;
} & Partial<UsePolywrapInvoke<TData>> => {
  const { execute, loading, data, error } = usePolywrapInvoke<TData>({
    uri: borshUri,
    method: "serializeTransaction",
  });

  return {
    serialize: (transaction) => execute({ transaction: transaction }),
    data,
    loading,
    error,
  };
};
