import React, { ChangeEvent, useEffect, useState } from "react";
import "./index.css";
import Header from "../header";
import { goBack } from "react-chrome-extension-router";

const MIN_PASSPHRASE_WORDS_AMOUNT = 12;

export const RecoverWithPassphrasePage = () => {
  const [passphrase, setPassphrase] = useState<string>("");
  const [passphraseError, setPassphraseError] = useState<
    string | null | undefined
  >(undefined);
  const [isValidatingPassphrase, setIsValidatingPassphrase] =
    useState<boolean>(false);

  useEffect(() => {
    const validatePassphrase = (passphrase: string) => {
      setIsValidatingPassphrase(true);

      try {
        if (!passphrase) {
          setPassphraseError(undefined);
          return;
        }

        const passphraseWords = passphrase.trim().split(" ");
        if (passphraseWords?.length < MIN_PASSPHRASE_WORDS_AMOUNT) {
          setPassphraseError("Passphrase should contain at least 12 words");
          return;
        }

        setPassphraseError(null);
      } catch (error) {
        console.error("[ValidatePassphrase]:", error);
        setPassphraseError("Passphrase validation failed");
      } finally {
        setIsValidatingPassphrase(false);
      }
    };

    validatePassphrase(passphrase);
  }, [passphrase]);

  const onPassphraseChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassphrase(event?.target?.value);
  };

  const handleAccountImport = () => {
    //TODO: import account with passphrase
    setPassphraseError("Recover using passphrase is not yet implemented");
  };

  const onCancel = () => {
    goBack();
  };

  return (
    <div className="recoverWithPassphrasePageContainer">
      <Header />
      <div className="body">
        <div className="title">Recover using Passphrase</div>
        <div className="subtitle">
          Enter the backup passphrase associated with the account
        </div>
        <div className="form">
          <input
            className="passphraseInput"
            placeholder="Passphrase (12 words)"
            onChange={onPassphraseChange}
          />
          {!!passphrase && passphraseError && (
            <div className="errorMessage">{passphraseError}</div>
          )}
        </div>
        <button
          onClick={handleAccountImport}
          disabled={
            !passphrase ||
            passphraseError === undefined ||
            !!passphraseError ||
            isValidatingPassphrase
          }
          className="importAccountButton"
        >
          Import Account
        </button>
        <div className="cancel" onClick={onCancel}>
          Cancel
        </div>
      </div>
    </div>
  );
};
