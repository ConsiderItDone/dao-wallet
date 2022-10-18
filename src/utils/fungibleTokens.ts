import { bignumberToNumber } from "./bignumber";
import { ethers } from "ethers";
import { InvokeResult } from "@polywrap/core-js";
import { fetchWithViewFunction } from "./polywrap";

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
  return fetchWithViewFunction(
    {
      contractId: tokenAddress,
      methodName: TOKEN_METADATA_METHOD_NAME,
      args: JSON.stringify(""),
    },
    viewFunctionExecute
  );
}

export async function fetchTokenBalance(
  tokenAddress: string,
  tokenDecimals: number,
  accountId: string,
  viewFunctionExecute: (
    args?: Record<string, unknown> | Uint8Array
  ) => Promise<InvokeResult>
): Promise<number | null> {
  const bignumberValue = await fetchWithViewFunction(
    {
      contractId: tokenAddress,
      methodName: TOKEN_BALANCE_METHOD_NAME,
      args: JSON.stringify({ account_id: accountId }),
    },
    viewFunctionExecute
  );
  return bignumberToNumber(
    ethers.BigNumber.from(bignumberValue),
    tokenDecimals
  );
}
