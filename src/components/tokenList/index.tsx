import "./index.css";
import React from "react";

export interface Token {
  symbol: string;
  icon: string;
  amount: number;
  usdRatio?: number;
}

interface Props {
  tokens: Token[];
}

const formatTokenAmount = (amount: number) => {
  if (!amount) return amount;
  return Number(amount.toFixed(5));
};

const formatUsdTokenAmount = (amount: number) => {
  if (!amount) return amount;
  return amount.toFixed(2);
};

export const TokenList = ({ tokens }: Props) => {
  return (
    <div className="tokenListContainer">
      {tokens?.length ? (
        tokens.map((token, index) => (
          <div className="token" key={index}>
            <div className="leftPartWrapper">
              <div className="iconWrapper">
                <img src={token?.icon} alt="" className="icon" />
              </div>
              <div className="nameAndRatioWrapper">
                <div className="tokenName">{token?.symbol}</div>
                <div className="usdRatio">${token?.usdRatio?.toFixed(2)}</div>
              </div>
            </div>
            <div className="rightPartWrapper">
              <div className="tokenAmount">{`${formatTokenAmount(
                token?.amount
              )} ${token?.symbol}`}</div>
              <div className="tokenUsdAmount">{`≈ $${
                token?.usdRatio
                  ? formatUsdTokenAmount(token?.amount * token?.usdRatio)
                  : formatUsdTokenAmount(token?.amount)
              } USD`}</div>
            </div>
          </div>
        ))
      ) : (
        <div className="noTokens">You don't have tokens</div>
      )}
      <div className="addTokenContainer">
        <button className="addTokenButton">Add Token</button>
      </div>
    </div>
  );
};
