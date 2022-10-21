import { useQuery } from "./useQuery";
import { AccountBalance } from "../components/balancePage";
import { useEffect, useState } from "react";
import { parseNearTokenAmount } from "../utils/near";
import { NEAR_RESERVED_FOR_TRANSACTION_FEES } from "../consts/near";

export const ACCOUNT_BALANCE_METHOD_NAME = "getAccountBalance";

export const useAccountNearBalance = (
  accountId: string | undefined
): {
  accountNearBalance: AccountBalance | undefined;
  isLoadingAccountBalance: boolean | undefined;
} => {
  const [accountBalanceQueryExecute, { loading: isLoadingAccountBalance }] =
    useQuery<AccountBalance>(ACCOUNT_BALANCE_METHOD_NAME);

  const [accountNearBalance, setAccountNearBalance] = useState<
    AccountBalance | undefined
  >(undefined);

  useEffect(() => {
    const getAccountNearBalance = async (accountId: string | undefined) => {
      setAccountNearBalance(undefined);
      if (!accountId) {
        return;
      }

      try {
        const balanceData = await accountBalanceQueryExecute({
          accountId: accountId,
        });
        if (balanceData?.error) {
          console.error("[GetAccountNearBalanceData]:", balanceData.error);
        }
        const data = balanceData?.data;
        if (data) {
          setAccountNearBalance({
            available:
              parseNearTokenAmount(data?.available) -
              NEAR_RESERVED_FOR_TRANSACTION_FEES,
            staked: parseNearTokenAmount(data?.staked),
            stateStaked: parseNearTokenAmount(data?.stateStaked),
            total: parseNearTokenAmount(data?.total),
          });
        } else {
          console.error(
            "[GetAccountNearBalance]: received empty account balance data"
          );
        }
      } catch (error) {
        console.error("[GetAccountNearBalance]:", error);
      }
    };

    getAccountNearBalance(accountId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  return { accountNearBalance, isLoadingAccountBalance };
};
