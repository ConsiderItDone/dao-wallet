import { INDEXER_SERVICE_URL } from "../consts/near";
import { InvokeResult } from "@polywrap/core-js";

const CUSTOM_REQUEST_HEADERS = {};
const STAKING_DEPOSIT_DATA_METHOD_NAME = "get_account_total_balance";

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

export async function fetchStakingDepositInfo(
  accountId: string,
  validatorId: string,
  viewFunctionExecute: (
    args?: Record<string, unknown> | Uint8Array
  ) => Promise<InvokeResult>
): Promise<string | null> {
  try {
    const result = await viewFunctionExecute({
      contractId: validatorId,
      methodName: STAKING_DEPOSIT_DATA_METHOD_NAME,
      args: JSON.stringify({ account_id: accountId }),
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
