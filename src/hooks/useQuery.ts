import path from "path";
import { usePolywrapInvoke } from "@polywrap/react";
import { UsePolywrapInvoke } from "@polywrap/react/build/invoke";
import { InvokeResult } from "@polywrap/core-js";

const basePath = `${__dirname}/cases/wrappers`;

const wrapperPath = path.resolve(`${basePath}/wasm-as/simple-storage`);

const fsPath = `${wrapperPath}/build`;

const fsUri = `fs/${fsPath}`;
const ipfsUri = "wrap://ipfs/QmW6rsaFCx9mNDdqzKfGjmKv5bqtUknrd9a8RGiKisk5Xh";

export const apiUri = fsUri || ipfsUri;

export const useQuery = <TData = Record<string, unknown>>(
  method: string
): [
  (args?: Record<string, unknown> | Uint8Array) => Promise<InvokeResult<TData>>,
  Partial<UsePolywrapInvoke<TData>>
] => {
  const { execute, loading, data, error } = usePolywrapInvoke<TData>({
    uri: ipfsUri,
    method: method,
  });
  return [execute, { data, loading, error }];
};
