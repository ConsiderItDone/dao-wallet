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
import { useAuth } from "../../hooks";

const HomePage = () => {
  const [localStorage] = useState<LocalStorage>(new LocalStorage());
  const [sessionStorage] = useState<SessionStorage>(new SessionStorage());

  const { initProvider } = useAuth();

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
          goTo(BalancePage);
        }
      } catch (error) {
        console.error("Failed to initialize:", error);
      } finally {
        setShouldInitialize(false);
      }
    };

    if (shouldInitialize) {
      initialize().catch((error) => {
        console.error("[HomePageInitialize]:", error);
      });
    }
  }, [localStorage, sessionStorage, shouldInitialize]);

  const onPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputPassword(e?.target?.value);
  };

  const handleUnlock = async () => {
    if (isUnlocking || !storageHashedPassword) {
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
          await initProvider();
          goTo(BalancePage);
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
            disabled={isUnlocking || !inputPassword}
          >
            {isUnlocking ? <ClipLoader color="#fff" size={14} /> : "Unlock"}
          </button>
        </>
      )}
    </div>
  );
};

export default HomePage;
