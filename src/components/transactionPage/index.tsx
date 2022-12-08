import React from "react";
import iconsObj from "../../assets/icons";
import Header from "../header";
import Icon from "../icon";
import "./index.css";
import { goTo } from "react-chrome-extension-router";
import BalancePage from "../balancePage";
import { useAuth } from "../../hooks";
import { shortenWalletAddress } from "../../utils/wallet";

function formatAccountId(accountId: string | undefined) {
  if (!accountId) return accountId;
  return accountId?.length >= 16
    ? shortenWalletAddress(accountId, 6, 6)
    : accountId;
}

interface Props {
  amount: number;
  receiver: string;
  hash: string;
  tokenSymbol: string;
}

const TransactionPage = ({ amount, receiver, hash, tokenSymbol }: Props) => {
  const { explorerUrl } = useAuth();

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
            href={`${explorerUrl}/transactions/${hash}`}
            rel="noreferrer"
          >
            {formatAccountId(receiver)}
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
