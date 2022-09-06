import React, { useState } from "react";
import Header from "../header";
import { goTo } from "react-chrome-extension-router";
import BalancePage from "../balancePage";

import "./index.css";
import { LocalStorage } from "../../services/chrome/localStorage";
import { createNewWallet } from "../../utils/wallet";
import { encryptPrivateKeyWithPassword } from "../../utils/encryption";
import HomePage from "../homePage";

const ChooseMethod = () => {
  const [localStorage] = useState<LocalStorage>(new LocalStorage());

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
      const hashedPassword = await localStorage.getHashedPassword();
      if (!hashedPassword) {
        console.error(
          "[HandleCreateWithSecurePassphrase]: failed to get hashed password"
        );
        goTo(HomePage);
        return;
      }

      const encryptedPrivateKey = await encryptPrivateKeyWithPassword(
        hashedPassword,
        privateKey
      );

      await localStorage.addAccount({ name, accountId, encryptedPrivateKey });
      goTo(BalancePage);
    } catch (error) {
      console.error("[HandleCreateWithSecurePassphrase]:", error);
    } finally {
      setIsCreatingAccount(false);
    }
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
            disabled={isCreatingAccount}
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
