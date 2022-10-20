import { NEAR_TOKEN } from "../consts/near";

export const formatFungibleTokenAmount = (
  amount: number | string,
  tokenDecimals: number
): string => {
  const value = amount.toString();

  const [int, decimals] = value.includes(".")
    ? value.split(".")
    : value.split(",");

  let result = int.replaceAll("0", "");

  const decimalValue = (decimals || "").padEnd(tokenDecimals, "0");

  result = result.concat(decimalValue);

  return result;
};

export const formatNearAmount = (amount: number | string): string => {
  return formatFungibleTokenAmount(amount, NEAR_TOKEN.decimals);
};
