import "./index.css";
import React from "react";
import { Token } from "../../services/chrome/localStorage";
import { goTo } from "react-chrome-extension-router";
import { ImportTokensPage } from "../ImportTokensPage";
import { useAccount } from "../../hooks/useAccount";
import iconsObj from "../../assets/icons";

export interface TokenAmountData {
  token: Token;
  amount?: number;
  usdRatio?: number;
}

interface Props {
  tokens: TokenAmountData[];
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
  const account = useAccount();

  const onAddToken = () => {
    goTo(ImportTokensPage);
  };

  return (
    <div className="tokenListContainer">
      {tokens?.length ? (
        tokens.map((tokenAmountData, index) => (
          <div className="token" key={index}>
            <div className="leftPartWrapper">
              <div className="iconWrapper">
                <img
                  src={tokenAmountData?.token?.icon}
                  alt=""
                  className="icon"
                />
              </div>
              <div className="nameAndAmountWrapper">
                <div className="amount">
                  {tokenAmountData?.amount
                    ? formatTokenAmount(tokenAmountData?.amount)
                    : "-"}{" "}
                  {tokenAmountData?.token?.symbol}
                </div>
                {tokenAmountData?.amount && tokenAmountData?.usdRatio && (
                  <div className="usdAmount">
                    {`$${formatUsdTokenAmount(
                      tokenAmountData?.amount * tokenAmountData?.usdRatio
                    )} USD`}
                  </div>
                )}
              </div>
            </div>
            <div className="rightPartWrapper">
              <div className="imgWrapper">
                <img src={iconsObj.arrowRight} alt="" className="img" />
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="noTokens">You don't have tokens</div>
      )}
      <div className="addTokenContainer">
        <button
          className="addTokenButton"
          onClick={onAddToken}
          disabled={!account}
        >
          Add Token
        </button>
      </div>
    </div>
  );
};
