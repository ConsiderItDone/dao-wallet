import { usePolywrapInvoke } from "@polywrap/react";
import { UsePolywrapInvoke } from "@polywrap/react/build/invoke";
import { InvokeResult } from "@polywrap/core-js";

export const apiUri = "wrap://ipfs/QmW6rsaFCx9mNDdqzKfGjmKv5bqtUknrd9a8RGiKisk5Xh";

export const useQuery = <TData = Record<string, unknown>>(
  method: string
): [
  (args?: Record<string, unknown> | Uint8Array) => Promise<InvokeResult<TData>>,
  Partial<UsePolywrapInvoke<TData>>
] => {
  const { execute, loading, data, error } = usePolywrapInvoke<TData>({
    uri: apiUri,
    method: method,
  });
  return [execute, { data, loading, error }];
};
