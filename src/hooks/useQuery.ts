import { usePolywrapClient, usePolywrapInvoke } from "@polywrap/react";
import { UsePolywrapInvoke } from "@polywrap/react/build/invoke";
import { InvokeResult } from "@polywrap/core-js";

const ipfsUri =
  "wrap://ipfs/QmasRYJf2utdeU9pvC2si3G69zrEut8ZpeoQnggaF41JdU" ||
  "wrap://ipfs/QmNct7Wvafucj1zdkrtWXhJx2brv7xttrbRCBZDnFVV7Us";

export const apiUri = ipfsUri;

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

export const useInvoke = <TData = Record<string, unknown>>() => {
  const client = usePolywrapClient();
  const invoke = async ({
    method,
    args,
  }: {
    method: string;
    args: Record<string, unknown>;
  }) => client.invoke<TData>({ uri: ipfsUri, method, args });
  return invoke;
};

export const useFetchJson = (method: string) => {
  const client = usePolywrapClient();
  const fetch = async <FetchResponseType = unknown>(
    args: Record<string, unknown>
  ): Promise<FetchResponseType | undefined> =>
    client.invoke<string>({ uri: ipfsUri, method, args }).then((res) => {
      if (res.data) {
        const parsed = JSON.parse(res.data);
        return parsed as FetchResponseType;
      } else {
        return undefined;
      }
    });

  return fetch;
};
