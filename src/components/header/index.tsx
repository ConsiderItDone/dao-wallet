import React, { useEffect, useState } from "react";
import { goBack, goTo, getComponentStack } from "react-chrome-extension-router";
import { ReactComponent as NearIcon } from "../../images/nearIcon.svg";
import { ReactComponent as OmniLogo } from "../../images/omniLogo.svg";
import { ReactComponent as LockIcon } from "../../images/lockIcon.svg";
import { ReactComponent as SettingsIcon } from "../../images/settingsIcon.svg";
import { ReactComponent as ArrowIcon } from "../../images/arrow.svg";
import Settings from "../settingsPage";
import "./index.css";
import { SessionStorage } from "../../services/chrome/sessionStorage";
import {
  LocalStorage,
  LocalStorageAccount,
} from "../../services/chrome/localStorage";

const Header = () => {
  const [localStorage] = useState<LocalStorage>(new LocalStorage());
  const [sessionStorage] = useState<SessionStorage>(new SessionStorage());

  const [wallets, setWallets] = useState<LocalStorageAccount[] | null>(null);
  const [selectedWalletIndex, setSelectedWalletIndex] = useState<number | null>(
    null
  );

  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    const getWalletsList = async () => {
      const accounts = await localStorage.getAccounts();
      if (!accounts || !accounts.length) {
        console.error("[HeaderGetWalletsList]: user has no accounts");
        return;
      }

      let lastSelectedAccountIndex =
        await localStorage.getLastSelectedAccountIndex();
      if (
        lastSelectedAccountIndex === null ||
        lastSelectedAccountIndex === undefined
      ) {
        lastSelectedAccountIndex = 0;
        await localStorage.setLastSelectedAccountIndex(
          lastSelectedAccountIndex
        );
      }

      setWallets(accounts);
      setSelectedWalletIndex(lastSelectedAccountIndex);
    };

    getWalletsList();
  }, []);

  const handleWalletChange = (walletIndex: number) => {
    setDropdownVisible(!dropdownVisible);
    setSelectedWalletIndex(walletIndex);
  };

  const handleGoBack = async () => {
    const componentStack = getComponentStack();
    if (componentStack?.length <= 1) {
      await sessionStorage.setIsExtensionUnlocked(false);
    }
    goBack();
  };

  return wallets &&
    selectedWalletIndex !== null &&
    selectedWalletIndex !== undefined ? (
    <div className="header">
      {!dropdownVisible ? (
        <div className="item walletContainer">
          <button onClick={handleGoBack} className="backBtn">
            <ArrowIcon />
          </button>
          <button
            onClick={() => setDropdownVisible(!dropdownVisible)}
            className="dropdownBtn"
          >
            <NearIcon className="nearIcon" />
            <div>{wallets[selectedWalletIndex]?.name}</div>
            <ArrowIcon className="arrowIcon" />
          </button>
        </div>
      ) : (
        <div className="walletsContainer">
          <div className="item curentWallet">
            <button onClick={handleGoBack} className="backBtn">
              <ArrowIcon />
            </button>
            <button
              onClick={() => setDropdownVisible(!dropdownVisible)}
              className="dropdownBtn"
            >
              <NearIcon className="nearIcon" />
              <div>{wallets[selectedWalletIndex]?.name}</div>
              <ArrowIcon className="arrowIcon" />
            </button>
          </div>
          {wallets.map((el, index) => {
            return index !== selectedWalletIndex ? (
              <button
                onClick={() => handleWalletChange(index)}
                key={index}
                className="dropdownBtn interationBtn"
              >
                {selectedWalletIndex === index && (
                  <NearIcon className="nearIcon" />
                )}
                <div>{el?.name} </div>
              </button>
            ) : null;
          })}
          <button className="btnChooseNetwork" type="button">
            Choose Network
          </button>
        </div>
      )}
      <div
        className={`item titleContainer ${dropdownVisible ? "visible" : ""}`}
      >
        <OmniLogo className="nearIconTitle" />
        <span className="title">Omni Near Wallet</span>
      </div>
      <div className="item">
        <button>
          <LockIcon className="lockIcon" />
        </button>
        <button onClick={() => goTo(Settings)}>
          <SettingsIcon className="settingIcon" />
        </button>
      </div>
    </div>
  ) : null;
};
export default Header;
