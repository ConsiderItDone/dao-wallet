import { bignumberToNumber } from "./bignumber";
import { ethers } from "ethers";
import { InvokeResult } from "@polywrap/core-js";

const TOKEN_METADATA_METHOD_NAME = "ft_metadata";
const TOKEN_BALANCE_METHOD_NAME = "ft_balance_of";

export interface TokenMetadata {
  name: string;
  symbol: string;
  icon: string;
  decimals: number;
}

export async function fetchTokenMetadata(
  tokenAddress: string,
  viewFunctionExecute: (
    args?: Record<string, unknown> | Uint8Array
  ) => Promise<InvokeResult>
): Promise<TokenMetadata | null> {
  try {
    const result = await viewFunctionExecute({
      contractId: tokenAddress,
      methodName: TOKEN_METADATA_METHOD_NAME,
      args: JSON.stringify(""),
    });
    const viewFunctionResult = result?.data;
    const fnResult = JSON.parse(viewFunctionResult as any).result;
    const parsedResult = new TextDecoder().decode(
      Uint8Array.from(fnResult).buffer
    );
    return JSON.parse(parsedResult);
  } catch {
    return null;
  }
}

export async function fetchTokenBalance(
  tokenAddress: string,
  tokenDecimals: number,
  accountId: string,
  viewFunctionExecute: (
    args?: Record<string, unknown> | Uint8Array
  ) => Promise<InvokeResult>
): Promise<number | null> {
  try {
    const result = await viewFunctionExecute({
      contractId: tokenAddress,
      methodName: TOKEN_BALANCE_METHOD_NAME,
      args: JSON.stringify({ account_id: accountId }),
    });
    const viewFunctionResult = result?.data;
    const fnResult = JSON.parse(viewFunctionResult as any).result;
    const parsedResult = new TextDecoder().decode(
      Uint8Array.from(fnResult).buffer
    );
    const bignumberValue = JSON.parse(parsedResult);
    return bignumberToNumber(
      ethers.BigNumber.from(bignumberValue),
      tokenDecimals
    );
  } catch {
    return null;
  }
}
