import { usePolywrapInvoke } from "@polywrap/react";
import { UsePolywrapInvoke } from "@polywrap/react/build/invoke";
import { InvokeResult } from "@polywrap/core-js";

const ipfsUri = "wrap://ipfs/Qmck2PKpeC794L3ByjMfZoqH8BPDhae1craJsLySwfR6j4";

export const borshUri = ipfsUri;

export const useBorsh = (): {
  serialize: (
    args?: Record<string, unknown> | Uint8Array
  ) => Promise<InvokeResult<Buffer>>;
  deserialize: (
    args?: Record<string, unknown> | Uint8Array
  ) => Promise<InvokeResult<Record<string, any>>>;
} & Partial<UsePolywrapInvoke<Buffer>> => {
  const {
    execute: executeSerialize,
    loading,
    data,
    error,
  } = usePolywrapInvoke<Buffer>({
    uri: borshUri,
    method: "serializeTransaction",
  });

  const { execute: executeDeserialize } = usePolywrapInvoke<Buffer>({
    uri: borshUri,
    method: "deserializeTransaction",
  });

  return {
    serialize: (transaction) => executeSerialize({ transaction: transaction }),
    deserialize: (transactionBytes) =>
      executeDeserialize({ transactionBytes: transactionBytes }),
    data,
    loading,
    error,
  };
};
