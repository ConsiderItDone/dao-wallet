import React, { useState } from "react";
import Header from "../header";
import { goTo } from "react-chrome-extension-router";
import BalancePage from "../balancePage";

import "./index.css";
import { LocalStorage } from "../../services/chrome/localStorage";
import { createNewWallet } from "../../utils/wallet";
import { encryptPrivateKeyWithPassword } from "../../utils/encryption";
import HomePage from "../homePage";
import { SessionStorage } from "../../services/chrome/sessionStorage";
import { useAccount } from "../../hooks/useAccount";
import { RecoverWithPassphrasePage } from "../recoverWithPassphrasePage";

const ChooseMethod = () => {
  const [localStorage] = useState<LocalStorage>(new LocalStorage());
  const [sessionStorage] = useState<SessionStorage>(new SessionStorage());
  const account = useAccount();

  const [isCreatingAccount, setIsCreatingAccount] = useState<boolean>(false);

  const handleCreateWithSecurePassphrase = async () => {
    if (isCreatingAccount) {
      return;
    }

    setIsCreatingAccount(true);

    try {
      let accounts = await localStorage.getAccounts();
      if (!accounts) {
        accounts = [];
      }

      const name = `Wallet ${accounts.length + 1}`;
      const { accountId, privateKey } = createNewWallet();
      const password = await sessionStorage.getPassword();
      if (!password) {
        console.error(
          "[HandleCreateWithSecurePassphrase]: failed to get password from session storage"
        );
        goTo(HomePage);
        return;
      }

      const encryptedPrivateKey = await encryptPrivateKeyWithPassword(
        password,
        privateKey
      );

      await localStorage.addAccount({
        name,
        accountId,
        encryptedPrivateKey,
        tokens: [],
      });
      goTo(BalancePage);
    } catch (error) {
      console.error("[HandleCreateWithSecurePassphrase]:", error);
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleRecoverFromPassphrase = async () => {
    goTo(RecoverWithPassphrasePage);
  };

  const handlerCreateWithLedger = async () => {
    // TODO: create account using ledger
    handleCreateWithSecurePassphrase();
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
            disabled={isCreatingAccount}
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
            disabled={isCreatingAccount}
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
            disabled={isCreatingAccount}
          >
            <div className="btnTitle">Ledger Hardware Wallet</div>
            <div className="btnText">
              Secure your account with a Ledger hardware device
            </div>
          </button>
        </div>
        {account ? (
          <button className="btnCancel" type="button">
            Cancel
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default ChooseMethod;
