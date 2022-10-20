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

export const INDEXER_SERVICE_URL = "https://testnet-api.kitwallet.app";

export const FT_TRANSFER_GAS = "15000000000000";
export const NFT_TRANSFER_GAS = "30000000000000";
export const TOKEN_TRANSFER_DEPOSIT = "1";
