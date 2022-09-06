import { ethers } from "ethers";

export const bignumberToNumber = (
  value: ethers.BigNumber,
  decimals: number
): number => {
  if (!value) {
    return 0;
  }
  const parsedString = ethers.utils.formatUnits(value, decimals);
  return Number(parsedString);
};
