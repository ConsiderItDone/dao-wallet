import { bignumberToNumber } from "./bignumber";
import { ethers } from "ethers";
import { InvokeResult } from "@polywrap/core-js";
import { fetchWithViewFunction } from "./polywrap";
import {
  FT_STORAGE_DEPOSIT_GAS,
  FT_TRANSFER_GAS,
  INDEXER_SERVICE_URL,
  TOKEN_TRANSFER_DEPOSIT,
} from "../consts/near";
import { formatFungibleTokenAmount } from "./format";

const TOKEN_METADATA_METHOD_NAME = "ft_metadata";
const TOKEN_BALANCE_METHOD_NAME = "ft_balance_of";
const TOKEN_TRANSFER_METHOD_NAME = "ft_transfer";
const GET_TOKEN_STORAGE_BALANCE_METHOD_NAME = "storage_balance_of";
const TRANSFER_STORAGE_DEPOSIT_METHOD_NAME = "storage_deposit";

export interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  icon?: string;
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

// Returns contract addresses of account fungible tokens
export async function getAccountFungibleTokens(
  accountId: string
): Promise<string[]> {
  return fetch(
    `${INDEXER_SERVICE_URL}/account/${accountId}/likelyTokensFromBlock`
  )
    .then((res) => res.json())
    .then((jsonResult: any) => jsonResult?.list);
}

interface FungibleTokenAccountStorageBalance {
  available: string;
  total: string;
}

export async function getAccountStorageBalanceOfFungibleToken(
  accountId: string,
  tokenAddress: string,
  viewFunctionExecute: (
    args?: Record<string, unknown> | Uint8Array
  ) => Promise<InvokeResult>
): Promise<FungibleTokenAccountStorageBalance | null> {
  return await fetchWithViewFunction(
    {
      contractId: tokenAddress,
      methodName: GET_TOKEN_STORAGE_BALANCE_METHOD_NAME,
      args: JSON.stringify({ account_id: accountId }),
    },
    viewFunctionExecute
  );
}

export async function isStorageBalanceAvailable(
  accountId: string,
  tokenAddress: string,
  viewFunctionExecute: (
    args?: Record<string, unknown> | Uint8Array
  ) => Promise<InvokeResult>
): Promise<boolean> {
  const storageBalance = await getAccountStorageBalanceOfFungibleToken(
    accountId,
    tokenAddress,
    viewFunctionExecute
  );
  return !!storageBalance;
}

export async function transferStorageDeposit(
  ownerAccountId: string,
  receiverAccountId: string,
  tokenAddress: string,
  storageDepositAmount: string,
  functionCallExecute: (
    args?: Record<string, unknown> | Uint8Array
  ) => Promise<InvokeResult>
) {
  return await functionCallExecute({
    contractId: tokenAddress,
    methodName: TRANSFER_STORAGE_DEPOSIT_METHOD_NAME,
    args: JSON.stringify({
      account_id: receiverAccountId,
    }),
    gas: FT_STORAGE_DEPOSIT_GAS,
    deposit: storageDepositAmount,
    signerId: ownerAccountId,
  });
}
