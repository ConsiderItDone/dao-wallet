import { useQuery } from "./useQuery";
import { AccountBalance } from "../components/balancePage";
import { useEffect, useState } from "react";
import { parseNearTokenAmount } from "../utils/near";
import { NEAR_RESERVED_FOR_TRANSACTION_FEES } from "../consts/near";
import { useAuth } from "./useAuth";

export const ACCOUNT_BALANCE_METHOD_NAME = "getAccountBalance";

export const useAccountNearBalance = (
  accountId: string | undefined
): {
  accountNearBalance: AccountBalance | undefined;
  isLoadingAccountBalance: boolean | undefined;
  isAccountNotFunded: boolean | undefined;
} => {
  const { currentNetwork } = useAuth();

  const [accountBalanceQueryExecute, { loading: isLoadingAccountBalance }] =
    useQuery<AccountBalance>(ACCOUNT_BALANCE_METHOD_NAME);

  const [accountNearBalance, setAccountNearBalance] = useState<
    AccountBalance | undefined
  >(undefined);
  const [isAccountNotFunded, setIsAccountNotFunded] = useState<
    boolean | undefined
  >(undefined);

  useEffect(() => {
    const getAccountNearBalance = async (accountId: string | undefined) => {
      setAccountNearBalance(undefined);
      setIsAccountNotFunded(undefined);
      if (!accountId || !currentNetwork?.networkId) {
        return;
      }

      try {
        const balanceData = await accountBalanceQueryExecute({
          accountId: accountId,
        });
        if (balanceData?.error) {
          console.info("[GetAccountNearBalanceData]:", balanceData.error);
        }
        const data = balanceData?.data;
        if (data) {
          setIsAccountNotFunded(false);
          setAccountNearBalance({
            available: Math.max(
              parseNearTokenAmount(data?.available) -
                NEAR_RESERVED_FOR_TRANSACTION_FEES,
              0
            ),
            staked: Math.max(parseNearTokenAmount(data?.staked), 0),
            stateStaked: Math.max(parseNearTokenAmount(data?.stateStaked), 0),
            total: Math.max(parseNearTokenAmount(data?.total), 0),
          });
        } else {
          console.info(
            "[GetAccountNearBalance]: received empty account balance data. Maybe account is not funded yet"
          );
          setIsAccountNotFunded(true);
          setAccountNearBalance({
            available: 0,
            staked: 0,
            stateStaked: 0,
            total: 0,
          });
        }
      } catch (error) {
        console.error("[GetAccountNearBalance]:", error);
      }
    };

    getAccountNearBalance(accountId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, currentNetwork?.networkId]);

  return { accountNearBalance, isLoadingAccountBalance, isAccountNotFunded };
};
