import React from "react";
import Header from "../header";
import { goBack, goTo } from "react-chrome-extension-router";
import "./index.css";
import { RecoverWithPassphrasePage } from "../recoverWithPassphrasePage";
import { openTab } from "../../utils/router";
import LedgerConnect from "../ledger-connect";
import { useAuth } from "../../hooks";
import CreateWithSecurePassphrasePage from "../createWithSecurePassphrasePage";

const ChooseMethod = () => {
  const { currentAccount: account } = useAuth();

  const handleCreateWithSecurePassphrase = () => {
    goTo(CreateWithSecurePassphrasePage);
  };

  const handleRecoverFromPassphrase = () => {
    goTo(RecoverWithPassphrasePage);
  };

  const handlerCreateWithLedger = async () => {
    await openTab("/ledger", LedgerConnect);
  };

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
            onClick={handleCreateWithSecurePassphrase}
            type="button"
            className="btnChoose"
          >
            <div className="btnTitle">Create With Secure Passphrase</div>
            <div className="btnText">
              Generate and safely store a unique passphrase
            </div>
          </button>
          <button
            onClick={handleRecoverFromPassphrase}
            type="button"
            className="btnChoose"
          >
            <div className="btnTitle">Recover From Passphrase</div>
            <div className="btnText">
              Use mnemonic passphrase to recover existing account
            </div>
          </button>
          <button
            onClick={handlerCreateWithLedger}
            type="button"
            className="btnChoose"
          >
            <div className="btnTitle">Ledger Hardware Wallet</div>
            <div className="btnText">
              Secure your account with a Ledger hardware device
            </div>
          </button>
        </div>
        {account ? (
          <button className="btnCancel" type="button" onClick={() => goBack()}>
            Cancel
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default ChooseMethod;
