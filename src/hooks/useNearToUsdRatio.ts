import { useEffect } from "react";
import { useQuery } from "./useQuery";

export const useNearToUsdRatio = () => {
  const [getNearToUSDRatio, { data: nearToUsdRatio }] = useQuery<{
    usd: string;
    last_updated_at: string;
  }>("nearToUsdRatio");

  useEffect(() => {
    getNearToUSDRatio();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return nearToUsdRatio ? Number(nearToUsdRatio?.usd) : undefined;
};
