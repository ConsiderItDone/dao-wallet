import { Token } from "../services/chrome/localStorage";
import iconsObj from "../assets/icons";

export const NEAR_TOKEN: Token = {
  // TODO: add real near token address
  address: "dev-near",
  name: "NEAR",
  symbol: "NEAR",
  icon: iconsObj.nearMenu,
  decimals: 24,
};

export const FT_TRANSFER_GAS = "15000000000000";
export const FT_STORAGE_DEPOSIT_GAS = "30000000000000";
export const NFT_TRANSFER_GAS = "30000000000000";
export const TOKEN_TRANSFER_DEPOSIT = "1";

export const FT_MINIMUM_STORAGE_BALANCE = "1250000000000000000000";
export const FT_MINIMUM_STORAGE_BALANCE_LARGE = "12500000000000000000000";

export const NEAR_RESERVED_FOR_TRANSACTION_FEES = 0.05;
