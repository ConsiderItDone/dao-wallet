import { INDEXER_SERVICE_URL } from "../consts/near";
import { InvokeResult } from "@polywrap/core-js";
import { fetchWithViewFunction } from "./polywrap";

const CUSTOM_REQUEST_HEADERS = {};
const GET_ACCOUNT_TOTAL_BALANCE_METHOD_NAME = "get_account_total_balance";
const GET_ACCOUNT_STAKED_BALANCE_METHOD_NAME = "get_account_staked_balance";
const GET_ACCOUNT_UNSTAKED_BALANCE_METHOD_NAME = "get_account_unstaked_balance";
const GET_IS_ACCOUNT_UNSTAKED_BALANCE_AVAILABLE_METHOD_NAME =
  "is_account_unstaked_balance_available";

interface AccountStakingDepositData {
  deposit: string;
  validator_id: string;
}

export async function getAccountStakingDeposits(
  accountId: string
): Promise<AccountStakingDepositData[]> {
  return fetch(`${INDEXER_SERVICE_URL}/staking-deposits/${accountId}`, {
    headers: {
      ...CUSTOM_REQUEST_HEADERS,
    },
  }).then((res) => res.json());
}

export async function fetchTotalStakedAmount(
  accountId: string,
  validatorId: string,
  viewFunctionExecute: (
    args?: Record<string, unknown> | Uint8Array
  ) => Promise<InvokeResult>
): Promise<string | null> {
  return fetchWithViewFunction(
    {
      contractId: validatorId,
      methodName: GET_ACCOUNT_TOTAL_BALANCE_METHOD_NAME,
      args: JSON.stringify({ account_id: accountId }),
    },
    viewFunctionExecute
  );
}

export async function fetchAccountStakedBalance(
  accountId: string,
  validatorId: string,
  viewFunctionExecute: (
    args?: Record<string, unknown> | Uint8Array
  ) => Promise<InvokeResult>
): Promise<string | null> {
  return fetchWithViewFunction(
    {
      contractId: validatorId,
      methodName: GET_ACCOUNT_STAKED_BALANCE_METHOD_NAME,
      args: JSON.stringify({ account_id: accountId }),
    },
    viewFunctionExecute
  );
}

export async function fetchAccountUnstakedBalance(
  accountId: string,
  validatorId: string,
  viewFunctionExecute: (
    args?: Record<string, unknown> | Uint8Array
  ) => Promise<InvokeResult>
): Promise<string | null> {
  return fetchWithViewFunction(
    {
      contractId: validatorId,
      methodName: GET_ACCOUNT_UNSTAKED_BALANCE_METHOD_NAME,
      args: JSON.stringify({ account_id: accountId }),
    },
    viewFunctionExecute
  );
}

export async function fetchIsAccountUnstakedBalanceAvailable(
  accountId: string,
  validatorId: string,
  viewFunctionExecute: (
    args?: Record<string, unknown> | Uint8Array
  ) => Promise<InvokeResult>
): Promise<string | null> {
  return fetchWithViewFunction(
    {
      contractId: validatorId,
      methodName: GET_IS_ACCOUNT_UNSTAKED_BALANCE_AVAILABLE_METHOD_NAME,
      args: JSON.stringify({ account_id: accountId }),
    },
    viewFunctionExecute
  );
}
