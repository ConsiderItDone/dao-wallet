import React, { ChangeEvent, useEffect, useState } from "react";
import Icon from "../icon";
import iconsObj from "../../assets/icons";
import ChooseMethod from "../chooseMethod";
import { goTo } from "react-chrome-extension-router";
import "./index.css";
import BalancePage from "../balancePage";
import { SessionStorage } from "../../services/chrome/sessionStorage";
import { LocalStorage } from "../../services/chrome/localStorage";
import CreatePasswordPage from "../createPasswordPage";
import { isPasswordCorrect } from "../../utils/encryption";
import { ClipLoader } from "react-spinners";
import { InputField } from "../form/inputField";
import { INJECTED_API_METHOD_QUERY_PARAM_KEY } from "../../scripts/scripts.consts";
import { ConnectAccountsPage } from "../connectAccountsPage";

const HomePage = () => {
  const [localStorage] = useState<LocalStorage>(new LocalStorage());
  const [sessionStorage] = useState<SessionStorage>(new SessionStorage());

  const [isUnlocking, setIsUnlocking] = useState<boolean>(false);
  const [shouldInitialize, setShouldInitialize] = useState<boolean>(true);
  const [shouldCreateAccount, setShouldCreateAccount] =
    useState<boolean>(false);

  const [storageHashedPassword, setStorageHashedPassword] = useState<
    string | null
  >(null);
  const [inputPassword, setInputPassword] = useState<string>("");
  const [inputPasswordError, setInputPasswordError] = useState<string | null>(
    null
  );

  const [requestedInjectedApiMethod, setRequestedInjectedApiMethod] = useState<
    string | null | undefined
  >(undefined);

  useEffect(() => {
    const requestedInjectedApiMethod = new URLSearchParams(
      window.location.search
    ).get(INJECTED_API_METHOD_QUERY_PARAM_KEY);
    setRequestedInjectedApiMethod(requestedInjectedApiMethod || null);
  }, []);

  const handleNextPage = (
    requestedInjectedApiMethod: string | null | undefined
  ) => {
    switch (requestedInjectedApiMethod) {
      case "connect":
        const website = new URLSearchParams(window.location.search).get(
          "website"
        );
        goTo(ConnectAccountsPage, { website });
        return;
      default:
        goTo(BalancePage);
        return;
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const storageHashedPassword = await localStorage.getHashedPassword();
        if (!storageHashedPassword) {
          goTo(CreatePasswordPage);
          return;
        }
        setStorageHashedPassword(storageHashedPassword);

        const accounts = await localStorage.getAccounts();
        if (!accounts || accounts?.length < 1) {
          setShouldCreateAccount(true);
          return;
        }

        let lastSelectedAccountIndex =
          await localStorage.getLastSelectedAccountIndex();
        if (
          lastSelectedAccountIndex === undefined ||
          lastSelectedAccountIndex === null
        ) {
          lastSelectedAccountIndex = 0;
          await localStorage.setLastSelectedAccountIndex(
            lastSelectedAccountIndex
          );
        }

        const isUnlocked = await sessionStorage.isExtensionUnlocked();
        if (isUnlocked) {
          handleNextPage(requestedInjectedApiMethod);
        }
      } catch (error) {
        console.error("Failed to initialize:", error);
      } finally {
        setShouldInitialize(false);
      }
    };

    if (shouldInitialize && requestedInjectedApiMethod !== undefined) {
      initialize().catch((error) => {
        console.error("[HomePageInitialize]:", error);
      });
    }
  }, [
    localStorage,
    sessionStorage,
    shouldInitialize,
    requestedInjectedApiMethod,
  ]);

  const onPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputPassword(e?.target?.value);
  };

  const handleUnlock = async () => {
    if (shouldInitialize || isUnlocking || !storageHashedPassword) {
      return;
    }

    setIsUnlocking(true);

    try {
      if (isPasswordCorrect(inputPassword, storageHashedPassword)) {
        await sessionStorage.setPassword(inputPassword);
        await sessionStorage.setIsExtensionUnlocked(true);
        if (shouldCreateAccount) {
          goTo(ChooseMethod);
        } else {
          handleNextPage(requestedInjectedApiMethod);
        }
      } else {
        setInputPasswordError("Wrong password");
      }
    } catch (error) {
      console.error("[HandleUnlock]", error);
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <div className="homePageContainer">
      {shouldInitialize ? (
        <div className="title">Loading...</div>
      ) : (
        <>
          <div className="title">Omni Near Wallet</div>
          <div className="iconContainer">
            <div className="bg">
              <Icon className="omniLogo" src={iconsObj.omniLogo} />
            </div>
            <Icon className="nearMenu" src={iconsObj.nearMenu} />
          </div>
          <InputField
            fieldName="password"
            placeholder="Enter password"
            value={inputPassword}
            inputType="password"
            onChange={onPasswordChange}
            error={inputPasswordError}
            disabled={isUnlocking}
            containerClassname="homePagePasswordContainer"
            inputClassname="homePagePassword"
            errorClassname="passwordError"
          />
          <button
            onClick={handleUnlock}
            type="button"
            className="btn"
            disabled={isUnlocking || !inputPassword || shouldInitialize}
          >
            {isUnlocking ? <ClipLoader color="#fff" size={14} /> : "Unlock"}
          </button>
        </>
      )}
    </div>
  );
};

export default HomePage;
