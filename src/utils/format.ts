import { NEAR_TOKEN } from "../consts/near";

export const formatNearAmount = (amount: number | string): string => {
  const value = amount.toString();

  const [int, decimals] = value.includes(".")
    ? value.split(".")
    : value.split(",");

  let result = int.replaceAll("0", "");

  const decimalValue = (decimals || "").padEnd(NEAR_TOKEN.decimals, "0");

  result = result.concat(decimalValue);

  return result;
};
