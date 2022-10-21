import React from "react";
import iconsObj from "../../assets/icons";
import Header from "../header";
import Icon from "../icon";
import "./index.css";
import { goTo } from "react-chrome-extension-router";
import BalancePage from "../balancePage";
import { EXPLORER_URL } from "../../consts/near";

interface Props {
  amount: number;
  receiver: string;
  hash: string;
  tokenSymbol: string;
}

const TransactionPage = ({ amount, receiver, hash, tokenSymbol }: Props) => {
  const onContinue = () => {
    goTo(BalancePage);
  };

  return (
    <div className="transactionPageContainer">
      <Header />
      <div className="body">
        <Icon src={iconsObj.transactionIcon} className="icon" />
        <div className="title">Transaction Complete !</div>
        <div className="secondaryTitle">You sent</div>
        <div className="near">
          {amount} {tokenSymbol}
        </div>
        <div className="recipient">
          <a
            target={"_blank"}
            href={`${EXPLORER_URL}/transactions/${hash}`}
            rel="noreferrer"
          >
            {receiver}
          </a>
        </div>
        <button className="btnContinue" onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default TransactionPage;
