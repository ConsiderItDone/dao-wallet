import { useEffect, useState } from "react";
import {
  fetchStakingDepositInfo,
  getAccountStakingDeposits,
} from "../utils/staking";
import { useQuery } from "./useQuery";
import { VIEW_FUNCTION_METHOD_NAME } from "../consts/wrapper";
import { parseNearTokenAmount } from "../utils/near";

export const useStakingData = (accountId: string | undefined) => {
  const [viewFunctionExecute] = useQuery(VIEW_FUNCTION_METHOD_NAME);

  const [totalStake, setTotalStake] = useState<number | null | undefined>(
    undefined
  );

  useEffect(() => {
    const updateStakingInfo = async (accountId: string) => {
      try {
        const stakingDeposits = await getAccountStakingDeposits(accountId);
        let totalStaked = 0;
        for (const stakingDeposit of stakingDeposits) {
          const stakingDepositAmount = await fetchStakingDepositInfo(
            accountId,
            stakingDeposit.validator_id,
            viewFunctionExecute
          );
          if (stakingDepositAmount) {
            totalStaked += parseNearTokenAmount(stakingDepositAmount);
          }
        }
        setTotalStake(totalStaked);
      } catch (error) {
        console.error("[UpdateStakingInfo]:", error);
      }
    };

    if (accountId) {
      updateStakingInfo(accountId);
    } else {
      setTotalStake(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  return totalStake;
};
