import React from "react";
import "./index.css";
import Header from "../header";
import { goBack, goTo } from "react-chrome-extension-router";
import BalancePage from "../balancePage";
import { useAuth } from "../../hooks";
import {
  LocalStorageAccount,
} from "../../services/chrome/localStorage";

interface Props {
  account: LocalStorageAccount;
}

export const AccountNeedsFundingPage = ({ account }: Props) => {
  const { addAccount } = useAuth();

  const handleContinue = async () => {
    await addAccount(account);
    goTo(BalancePage);
  };

  const handleCancel = () => {
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
            {account.isLedger ? "ledger key" : "passphrase"} you provided:
          </div>
          <div className="accountKey">
            {account.isLedger ? account.publicKey : account.encryptedPrivateKey}
          </div>
          <div className="text">
            The account has not yet been funded. Purchase $NEAR to perform
            transactions with the account
          </div>
        </div>
        <button onClick={handleContinue} className="okButton">
          Ok
        </button>
        <button className="cancel" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};
