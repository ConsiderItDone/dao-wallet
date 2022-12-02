import React, { useEffect, useState } from "react";
import "./index.css";
import { goBack, goTo } from "react-chrome-extension-router";
import { SessionStorage } from "../../services/chrome/sessionStorage";
import Header from "../header";
import HomePage from "../homePage";
import { encryptPrivateKeyWithPassword } from "../../utils/encryption";
import BalancePage from "../balancePage";
import {
  generateNewSeedPhrase,
  getImplicitAccountId,
} from "../../utils/account";
import { useAuth } from "../../hooks";
import { CopyToClipboard } from "react-copy-to-clipboard";

const CreateWithSecurePassphrasePage = () => {
  const [sessionStorage] = useState<SessionStorage>(new SessionStorage());

  const { currentNetwork, addAccount } = useAuth();

  const [seedPhrase, setSeedPhrase] = useState<string>("");
  const [publicKey, setPublicKey] = useState<string>("");
  const [privateKey, setPrivateKey] = useState<string>("");

  const [isCreatingAccount, setIsCreatingAccount] = useState<boolean>(false);

  const [showCopiedMessage, setShowCopiedMessage] = useState<boolean>(false);
  const [hasUserCopiedPassphrase, setHasUserCopiedPassphrase] =
    useState<boolean>(false);

  useEffect(() => {
    const initAccountCreation = () => {
      const { seedPhrase, secretKey, publicKey } = generateNewSeedPhrase();
      setSeedPhrase(seedPhrase);
      setPublicKey(publicKey);
      setPrivateKey(secretKey);
    };

    initAccountCreation();
  }, []);

  const handleCreateWithSecurePassphrase = async () => {
    if (isCreatingAccount) {
      return;
    }

    setIsCreatingAccount(true);

    try {
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

      if (!currentNetwork) {
        console.error(
          "[HandleCreateWithSecurePassphrase]: failed to get current network"
        );
        return;
      }

      const implicitAccountId = getImplicitAccountId(publicKey);
      await addAccount({
        accountId: implicitAccountId,
        publicKey,
        privateKey,
        encryptedPrivateKey,
        tokens: [],
        isLedger: false,
      });

      goTo(BalancePage);
    } catch (error) {
      console.error("[HandleCreateWithSecurePassphrase]:", error);
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const onSeedPhraseCopy = () => {
    setHasUserCopiedPassphrase(true);
    setShowCopiedMessage(true);
    setTimeout(() => {
      setShowCopiedMessage(false);
    }, 1000);
  };

  const onCancel = () => {
    goBack();
  };

  return (
    <div className="createWithSecurePassphrasePageContainer">
      <Header />
      <div className="body">
        <div className="title">Copy Mnemonic Phrase to safe place</div>
        <div className="seedPhraseContainer">
          {seedPhrase?.split(" ").map((word, index) => (
            <div className="word" key={index}>
              <span className="wordIndex">{index + 1}.</span> {word}
            </div>
          ))}
        </div>
        <div className="buttonsContainer">
          <CopyToClipboard text={seedPhrase} onCopy={onSeedPhraseCopy}>
            <button className="createAccountButton copyButton">
              {showCopiedMessage ? "Copied!" : "Copy"}
            </button>
          </CopyToClipboard>
          <button
            onClick={handleCreateWithSecurePassphrase}
            className="createAccountButton nextStepButton"
            disabled={!hasUserCopiedPassphrase || isCreatingAccount}
          >
            Create Account
          </button>
        </div>
        <button
          className="cancel cancelFirstStep"
          onClick={onCancel}
          disabled={isCreatingAccount}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CreateWithSecurePassphrasePage;
