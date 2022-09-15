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
