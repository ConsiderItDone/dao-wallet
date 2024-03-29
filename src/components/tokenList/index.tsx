import "./index.css";
import React from "react";
import { Token } from "../../services/chrome/localStorage";
import { toFixedBottom } from "../../utils/common";
import NearIcon from "../icon/nerIcon";

export interface TokenAmountData {
  token: Token;
  amount?: number;
  usdRatio?: number;
}

interface Props {
  tokens: TokenAmountData[];
}

const formatTokenAmount = (amount: number) => {
  if (!amount) return 0;
  return Number(toFixedBottom(amount, 5));
};

const formatUsdTokenAmount = (amount: number) => {
  if (!amount) return 0;
  return toFixedBottom(amount, 2);
};

export const TokenList = ({ tokens }: Props) => {
  return (
    <div className="tokenListContainer">
      {tokens?.length ? (
        tokens.map((tokenAmountData, index) => (
          <div className="token" key={index}>
            <div className="leftPartWrapper">
              <div className="iconWrapper">
                <NearIcon className="iconToken" />
              </div>
              <div className="nameAndAmountWrapper">
                <div className="amount">
                  {tokenAmountData?.amount
                    ? formatTokenAmount(tokenAmountData?.amount)
                    : "0"}{" "}
                  {tokenAmountData?.token?.symbol}
                </div>
                {tokenAmountData?.amount && tokenAmountData?.usdRatio ? (
                  <div className="usdAmount">
                    {`$${formatUsdTokenAmount(
                      tokenAmountData?.amount * tokenAmountData?.usdRatio
                    )} USD`}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="noTokens">You don't have tokens</div>
      )}
    </div>
  );
};
