import { bignumberToNumber } from "./bignumber";
import { ethers } from "ethers";
import { InvokeResult } from "@polywrap/core-js";
import { fetchWithViewFunction } from "./polywrap";
import { FT_TRANSFER_GAS, TOKEN_TRANSFER_DEPOSIT } from "../consts/near";
import { formatFungibleTokenAmount } from "./format";

const TOKEN_METADATA_METHOD_NAME = "ft_metadata";
const TOKEN_BALANCE_METHOD_NAME = "ft_balance_of";
const TOKEN_TRANSFER_METHOD_NAME = "ft_transfer";

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

export async function sendFungibleToken(
  fungibleTokenContractName: string,
  amount: number,
  fungibleTokenDecimalsAmount: number,
  ownerAccountId: string,
  receiverAccountId: string,
  functionCallExecute: (
    args?: Record<string, unknown> | Uint8Array
  ) => Promise<InvokeResult>
) {
  const formattedAmount = formatFungibleTokenAmount(
    amount,
    fungibleTokenDecimalsAmount
  );
  return await functionCallExecute({
    contractId: fungibleTokenContractName,
    methodName: TOKEN_TRANSFER_METHOD_NAME,
    args: JSON.stringify({
      amount: formattedAmount,
      receiver_id: receiverAccountId,
    }),
    gas: FT_TRANSFER_GAS,
    deposit: TOKEN_TRANSFER_DEPOSIT,
    signerId: ownerAccountId,
  });
}
