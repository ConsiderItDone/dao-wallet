import { useEffect, useState } from "react";
import { getNearToUSDRatio } from "../services/coingecko/api";

export const useNearToUsdRatio = () => {
  const [nearToUsdRatio, setNearToUsdRatio] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    getNearToUSDRatio()
      .then((ratio) => {
        setNearToUsdRatio(ratio);
      })
      .catch((error) => {
        console.error("[GetNearToUSDRatio]:", error);
        setNearToUsdRatio(undefined);
      });
  }, []);

  return nearToUsdRatio;
};
