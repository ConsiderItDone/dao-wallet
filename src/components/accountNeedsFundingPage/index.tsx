import React from "react";
import "./index.css";
import Header from "../header";
import { goBack, goTo } from "react-chrome-extension-router";
import BalancePage from "../balancePage";

interface Props {
  accountKey: string;
  isAccountImportedWithLedger: boolean;
}

export const AccountNeedsFundingPage = ({
  accountKey,
  isAccountImportedWithLedger = false,
}: Props) => {
  const onOk = () => {
    goTo(BalancePage);
  };

  const onCancel = () => {
    goBack();
  };

  return (
    <div className="accountNeedsFundingPageContainer">
      <Header />
      <div className="body">
        <div className="title">Account Imported</div>
        <div className="textContainer">
          <div className="text">
            The following account was successfully imported using the{" "}
            {isAccountImportedWithLedger ? "ledger key" : "passphrase"} you
            provided:
          </div>
          <div className="accountKey">{accountKey}</div>
          <div className="text">
            The account has not yet been funded. Purchase $NEAR to perform
            transactions with the account
          </div>
        </div>
        <button onClick={onOk} className="okButton">
          Ok
        </button>
        <button className="cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};
