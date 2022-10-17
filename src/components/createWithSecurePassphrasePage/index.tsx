import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import "./index.css";
import { goBack, goTo } from "react-chrome-extension-router";
import { SessionStorage } from "../../services/chrome/sessionStorage";
import Header from "../header";
import HomePage from "../homePage";
import { encryptPrivateKeyWithPassword } from "../../utils/encryption";
import BalancePage, {
  ACCOUNT_BALANCE_METHOD_NAME,
  AccountBalance,
} from "../balancePage";
import {
  createNewAccount,
  generateNewSeedPhrase,
  isLegitAccountId,
} from "../../utils/account";
import { useAuth, useQuery } from "../../hooks";
import { accountExists } from "../../utils/account";
import { ClipLoader } from "react-spinners";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Network } from "../../types";

const ACCOUNT_ID_PATTERN = /[^a-zA-Z0-9_-]/;

const getAccountIdWithTopLevelDomain = (
  accountId: string,
  networkId: Network
): string => accountId + "." + networkId;

const CreateWithSecurePassphrasePage = () => {
  const [sessionStorage] = useState<SessionStorage>(new SessionStorage());

  const { network, addAccount } = useAuth();

  // Account ID input doesn't include top level domain (e.g. "username")
  const [accountIdInput, setAccountIdInput] = useState<string>("");
  const inputSuffix = useRef<HTMLSpanElement>(null);

  // Account ID including top level domain (e.g. "username.testnet")
  const [accountId, setAccountId] = useState<string | null>(null);
  const [accountIdError, setAccountIdError] = useState<
    string | null | undefined
  >(undefined);

  const [seedPhrase, setSeedPhrase] = useState<string>("");
  const [privateKey, setPrivateKey] = useState<string>("");

  const [executeAccountBalanceQuery] = useQuery<AccountBalance>(
    ACCOUNT_BALANCE_METHOD_NAME
  );

  const [isValidatingAccountId, setIsValidatingAccountId] =
    useState<boolean>(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState<boolean>(false);

  const [isMnemonicPhraseStep, setIsMnemonicPhraseStep] =
    useState<boolean>(true);
  const [showCopiedMessage, setShowCopiedMessage] = useState<boolean>(false);

  useEffect(() => {
    const initAccountCreation = () => {
      const { seedPhrase, secretKey } = generateNewSeedPhrase();
      setSeedPhrase(seedPhrase);
      setPrivateKey(secretKey);
    };

    initAccountCreation();
  }, []);

  useEffect(() => {
    const validateAccountId = async (accountId: string | null | undefined) => {
      if (!accountId) {
        setAccountIdError(undefined);
        return;
      }

      setIsValidatingAccountId(true);

      try {
        if (accountId.length < 2) {
          setAccountIdError("Account ID should have at least 2 symbols");
          return;
        }

        if (accountId.length > 64) {
          setAccountIdError("Account ID should be less than 65 symbols");
          return;
        }

        if (!isLegitAccountId(accountId)) {
          setAccountIdError("Account ID is not valid");
          return;
        }

        const exists = await accountExists(
          accountId,
          executeAccountBalanceQuery
        );
        if (exists) {
          setAccountIdError("Account already exists");
          return;
        }

        setAccountIdError(null);
      } catch (error) {
        console.error("[ValidateAccountId]:", error);
        setAccountIdError("Account ID validation failed");
      } finally {
        setIsValidatingAccountId(false);
      }
    };

    validateAccountId(accountId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  const handleCreateWithSecurePassphrase = async () => {
    if (!accountId || isCreatingAccount) {
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

      await createNewAccount(accountId, privateKey, network);
      await addAccount({
        accountId,
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

  const getTextWidth = (text: string, font: string): number => {
    const canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");
    if (context) {
      context.font = font;
      let metrics = context.measureText(text);
      return metrics.width;
    }
    return 0;
  };

  const updateSuffix = (userValue: string) => {
    if (inputSuffix?.current) {
      const width = getTextWidth(userValue, "16px sans-serif");
      const extraSpace = 16;
      inputSuffix.current.style.left = width + extraSpace + "px";
      inputSuffix.current.style.visibility = "visible";
      if (userValue.length === 0) {
        inputSuffix.current.style.visibility = "hidden";
      }
    }
  };

  const onAccountIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event?.target?.value;

    if (ACCOUNT_ID_PATTERN.test(value)) {
      return;
    }

    setAccountIdInput(value);
    setAccountId(
      value?.length > 0 ? getAccountIdWithTopLevelDomain(value, network) : value
    );
    updateSuffix(value);
  };

  const onSeedPhraseCopy = () => {
    setShowCopiedMessage(true);
    setTimeout(() => {
      setShowCopiedMessage(false);
    }, 1000);
  };

  const proceedToAccountIDStep = () => {
    setIsMnemonicPhraseStep(false);
  };

  const onCancel = () => {
    goBack();
  };

  return (
    <div className="createWithSecurePassphrasePageContainer">
      <Header />
      <div className="body">
        {isMnemonicPhraseStep ? (
          <>
            <div className="title">Copy Mnemonic Phrase to safe place</div>
            <div className="seedPhraseContainer">
              {seedPhrase?.split(" ").map((word, index) => (
                <div className="word" key={index}>
                  <span className="wordIndex">{index + 1}.</span> {word}
                </div>
              ))}
            </div>
            <div className="buttonsContainer">
              <button
                onClick={proceedToAccountIDStep}
                className="createAccountButton nextStepButton"
              >
                Next Step
              </button>
              <CopyToClipboard text={seedPhrase} onCopy={onSeedPhraseCopy}>
                <button className="createAccountButton copyButton">
                  {showCopiedMessage ? "Copied!" : "Copy"}
                </button>
              </CopyToClipboard>
            </div>
            <button
              className="cancel cancelFirstStep"
              onClick={onCancel}
              disabled={isCreatingAccount}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <div className="title">Create With Secure Passphrase</div>
            <div className="form">
              <div className="accountIdInputWrapper">
                <input
                  className="accountIdInput"
                  placeholder="yourname.testnet"
                  onChange={onAccountIdChange}
                  value={accountIdInput}
                  disabled={isCreatingAccount}
                />
                <span className="accountIdInputSuffix" ref={inputSuffix}>
                  .testnet
                </span>
              </div>
              {!!accountId && accountIdError && (
                <div className="errorMessage">{accountIdError}</div>
              )}
            </div>
            <button
              onClick={handleCreateWithSecurePassphrase}
              disabled={
                !accountId ||
                accountIdError === undefined ||
                !!accountIdError ||
                isValidatingAccountId ||
                isCreatingAccount
              }
              className="createAccountButton"
            >
              {isValidatingAccountId || isCreatingAccount ? (
                <ClipLoader color="#fff" size={14} />
              ) : (
                "Create Account"
              )}
            </button>
            <button
              className="cancel"
              onClick={onCancel}
              disabled={isCreatingAccount}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateWithSecurePassphrasePage;
