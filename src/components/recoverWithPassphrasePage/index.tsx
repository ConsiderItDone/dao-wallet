import React, { ChangeEvent, useEffect, useState } from "react";
import "./index.css";
import Header from "../header";
import { goBack, goTo } from "react-chrome-extension-router";
import { SessionStorage } from "../../services/chrome/sessionStorage";
import HomePage from "../homePage";
import { encryptPrivateKeyWithPassword } from "../../utils/encryption";
import BalancePage from "../balancePage";
import { useAuth } from "../../hooks";
import { getAccountIds } from "../../utils/account";
import { ClipLoader } from "react-spinners";
// @ts-ignore
import { parseSeedPhrase } from "near-seed-phrase";

const MIN_PASSPHRASE_WORDS_AMOUNT = 12;

export const RecoverWithPassphrasePage = () => {
  const [sessionStorage] = useState<SessionStorage>(new SessionStorage());

  const { accounts, addAccount } = useAuth();

  const [passphrase, setPassphrase] = useState<string>("");
  const [passphraseError, setPassphraseError] = useState<
    string | null | undefined
  >(undefined);
  const [isValidatingPassphrase, setIsValidatingPassphrase] =
    useState<boolean>(false);

  const [isImportingAccount, setIsImportingAccount] = useState<boolean>(false);

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

  const handleAccountImport = async () => {
    if (isImportingAccount) return;

    setIsImportingAccount(true);

    try {
      const { publicKey, secretKey: privateKey } = parseSeedPhrase(passphrase);

      const password = await sessionStorage.getPassword();
      if (!password) {
        console.error(
          "[HandleAccountImport]: failed to get password from session storage"
        );
        goTo(HomePage);
        return;
      }
      const encryptedPrivateKey = await encryptPrivateKeyWithPassword(
        password,
        privateKey
      );

      const accountIds: string[] = await getAccountIds(publicKey);
      if (accountIds?.length === 0) {
        setPassphraseError("Couldn't find account with specified passphrase");
        return;
      }
      const importedAccountId = accountIds[0];

      for (const account of accounts) {
        if (account.accountId === importedAccountId) {
          setPassphraseError("You have already added this account");
          return;
        }
      }

      await addAccount({
        accountId: accountIds[0],
        privateKey,
        encryptedPrivateKey,
        tokens: [],
        isLedger: false,
      });
      goTo(BalancePage);
    } catch (error) {
      console.error("[HandleAccountImport]:", error);
      setPassphraseError("Failed to import account");
    } finally {
      setIsImportingAccount(false);
    }
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
            disabled={isImportingAccount}
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
            isValidatingPassphrase ||
            isImportingAccount
          }
          className="importAccountButton"
        >
          {isImportingAccount || isValidatingPassphrase ? (
            <ClipLoader color="#fff" size={14} />
          ) : (
            "Import Account"
          )}
        </button>
        <button
          className="cancel"
          onClick={onCancel}
          disabled={isImportingAccount}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
