import React from "react";
import Header from "../header";
import { goTo } from "react-chrome-extension-router";
import BalancePage from "../balancePage";

import "./index.css";

const ChooseMethod = () => {
  return (
    <div className="chooseMethodContainer">
      <Header />
      <div className="body">
        <div className="title">Choose a Security Method</div>
        <div className="text">
          Select a method to secure and recover your account. This will be used
          to verify important activity, recover your account and access your
          account from other devices
        </div>
        <div className="btnContainer">
          <button
            onClick={() => {
              goTo(BalancePage);
            }}
            type="button"
            className="btnChoose"
          >
            <div className="btnTitle">Secure Passphrase</div>
            <div className="btnText">
              Generate and safely store a unique passphrase
            </div>
          </button>
          <button
            onClick={() => {
              goTo(BalancePage);
            }}
            type="button"
            className="btnChoose"
          >
            <div className="btnTitle">Ledger Hardware Wallet</div>
            <div className="btnText">
              Secure your account with a Ledger hardware device
            </div>
          </button>
        </div>
        <button className="btnCancel" type="button">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ChooseMethod;
