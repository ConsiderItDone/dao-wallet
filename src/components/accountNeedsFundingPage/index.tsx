import React from "react";
import "./index.css";
import Header from "../header";
import { goBack, goTo } from "react-chrome-extension-router";
import BalancePage from "../balancePage";

export const AccountNeedsFundingPage = () => {
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
            The following account was successfully imported using the ledger key
            you provided:
          </div>
          <div className="ledgerKey">
            3b07ebb65199018cdKX7682EBJKZ99286723jbzknccs7376289e92
          </div>
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
