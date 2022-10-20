import { useCallback, useRef } from "react";
//@ts-ignore
import { createClient, getSupportedTransport } from "near-ledger-js";
import * as bs58 from "bs58";

interface NearLedgerClient {
  getVersion: () => Promise<string>;
  getPublicKey: (path?: string) => Promise<Buffer>;
  sign: (transactionData: any, path?: string) => Promise<Buffer>;
}

export const useLedger = () => {
  const clientRef = useRef<NearLedgerClient>();
  const client = clientRef.current;
  const transportRef = useRef();

  const init = useCallback(async () => {
    const transport = await getSupportedTransport();
    transport.setScrambleKey("NEAR");

    transport.on("disconnect", () => {
      console.log("DISCONNECT");
    });
    transportRef.current = transport;
  }, []);

  const connect = useCallback(
    async (callback?: (client: NearLedgerClient) => any) => {
      if (!transportRef.current) {
        await init();
      }

      const client = await createClient(transportRef.current);
      clientRef.current = client;

      if (callback) {
        const res = await callback(client);

        closeConnection();
        return res;
      }
    },
    [init]
  );

  const closeConnection = async () => {
    //@ts-ignore
    if (transportRef.current && transportRef.current.close) {
      //@ts-ignore
      transportRef.current.close();
      transportRef.current = undefined;
      clientRef.current = undefined;
    }
  };

  const getPublicKey = useCallback(
    async (path?: string): Promise<string> => {
      let bytes: Buffer | number[] = [];
      if (client) {
        bytes = await client.getPublicKey();
      } else {
        bytes = await connect((client) => client.getPublicKey(path));
      }
      return bs58.encode(bytes);
    },
    [client, connect]
  );

  const sign = useCallback(
    async (transactionData: any, path?: string) => {
      if (client) {
        return await client.sign(transactionData, path);
      } else {
        return await connect((client) => client.sign(transactionData, path)); //.then(async () => await client!.sign(transactionData, path));
      }
    },
    [client, connect]
  );

  return { connect, getPublicKey, sign, client };
};
