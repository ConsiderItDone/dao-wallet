import { useEffect, useState } from "react";
import {
  fetchAccountStakedBalance,
  fetchAccountUnstakedBalance,
  fetchIsAccountUnstakedBalanceAvailable,
  fetchTotalStakedAmount,
  getAccountStakingDeposits,
} from "../utils/staking";
import { useQuery } from "./useQuery";
import { VIEW_FUNCTION_METHOD_NAME } from "../consts/wrapper";
import { parseNearTokenAmount } from "../utils/near";

const MIN_STAKED_DISPLAY_AMOUNT = parseNearTokenAmount("100");

export const useAccountStakingData = (
  accountId: string | undefined
): {
  totalStaked: number | null | undefined;
  totalPending: number | null | undefined;
  totalAvailable: number | null | undefined;
} => {
  const [viewFunctionExecute] = useQuery(VIEW_FUNCTION_METHOD_NAME);

  const [totalStaked, setTotalStaked] = useState<number | null | undefined>(
    undefined
  );
  const [totalPending, setTotalPending] = useState<number | null | undefined>(
    undefined
  );
  const [totalAvailable, setTotalAvailable] = useState<
    number | null | undefined
  >(undefined);

  useEffect(() => {
    const updateStakingInfo = async (accountId: string | undefined | null) => {
      setTotalStaked(undefined);
      setTotalPending(undefined);
      setTotalAvailable(undefined);

      if (!accountId) return;

      try {
        const stakingDeposits = await getAccountStakingDeposits(accountId);
        let totalStaked = 0;
        let totalPending = 0;
        let totalAvailable = 0;
        for (const stakingDeposit of stakingDeposits) {
          const total = await fetchTotalStakedAmount(
            accountId,
            stakingDeposit.validator_id,
            viewFunctionExecute
          );
          const totalParsed = parseNearTokenAmount(total);
          if (!totalParsed || totalParsed <= 0) {
            return;
          }

          const staked = await fetchAccountStakedBalance(
            accountId,
            stakingDeposit.validator_id,
            viewFunctionExecute
          );
          const stakedBalanceParsed = parseNearTokenAmount(staked);
          if (stakedBalanceParsed) {
            totalStaked += stakedBalanceParsed;
          }

          const unstaked = await fetchAccountUnstakedBalance(
            accountId,
            stakingDeposit.validator_id,
            viewFunctionExecute
          );
          const unstakedBalanceParsed = parseNearTokenAmount(unstaked);
          if (
            unstakedBalanceParsed &&
            unstakedBalanceParsed > MIN_STAKED_DISPLAY_AMOUNT
          ) {
            const isAvailable = await fetchIsAccountUnstakedBalanceAvailable(
              accountId,
              stakingDeposit.validator_id,
              viewFunctionExecute
            );
            if (isAvailable) {
              totalAvailable += unstakedBalanceParsed;
            } else {
              totalPending += unstakedBalanceParsed;
            }
          }
        }

        setTotalStaked(totalStaked);
        setTotalPending(totalPending);
        setTotalAvailable(
          totalAvailable >= MIN_STAKED_DISPLAY_AMOUNT ? totalAvailable : 0
        );
      } catch (error) {
        console.error("[UpdateStakingInfo]:", error);
      }
    };

    updateStakingInfo(accountId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  return { totalStaked, totalPending, totalAvailable };
};
