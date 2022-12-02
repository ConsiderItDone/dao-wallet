import React, { useState } from "react";
import {
  goBack,
  goTo as routerGoTo,
  getComponentStack,
} from "react-chrome-extension-router";
import { ReactComponent as NearIcon } from "../../images/nearIcon.svg";
import { ReactComponent as OmniLogo } from "../../images/omniLogo.svg";
import { ReactComponent as LockIcon } from "../../images/lockIcon.svg";
import { ReactComponent as SettingsIcon } from "../../images/settingsIcon.svg";
import { ReactComponent as ArrowIcon } from "../../images/arrow.svg";
import Settings from "../settingsPage";
import "./index.css";
import { SessionStorage } from "../../services/chrome/sessionStorage";
import ChooseMethod from "../chooseMethod";
import { useAuth } from "../../hooks";
import BalancePage from "../balancePage";
import HomePage from "../homePage";
import { useNavigate } from "react-router-dom";

const formatWalletName = (str: string) => {
  if (str?.length <= 8) {
    return str;
  }

  return str.substring(0, 6) + "...";
};

const Header = () => {
  const [sessionStorage] = useState<SessionStorage>(new SessionStorage());
  const {
    accounts: wallets,
    selectedAccountIndex: selectedWalletIndex,
    selectAccount,
  } = useAuth();

  const navigate = useNavigate();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const goTo = (component: React.ComponentType) => {
    if (chrome.tabs) {
      navigate("/");
    }
    routerGoTo(component);
  };

  const handleAddAccount = () => {
    goTo(ChooseMethod);
  };

  const handleWalletChange = async (walletIndex: number) => {
    setDropdownVisible(!dropdownVisible);
    selectAccount(walletIndex);
    goTo(BalancePage);
  };

  const handleGoBack = async () => {
    const componentStack = getComponentStack();
    if (componentStack?.length <= 1) {
      await sessionStorage.setPassword(undefined);
    }
    goBack();
  };

  const handleLock = async () => {
    await sessionStorage.setPassword(undefined);
    goTo(HomePage);
  };

  return (
    <div className="headerWrapper">
      <div className="header">
        {Boolean(wallets.length) && selectedWalletIndex !== undefined ? (
          !dropdownVisible ? (
            <div className="item walletContainer">
              <button onClick={handleGoBack} className="backBtn">
                <ArrowIcon />
              </button>
              <button
                onClick={() => setDropdownVisible(!dropdownVisible)}
                className="dropdownBtn"
              >
                <NearIcon className="nearIcon" />
                <div>
                  {formatWalletName(wallets[selectedWalletIndex]?.accountId)}
                </div>
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
                  <NearIcon className="currentAccountIcon" />
                  <div>{wallets[selectedWalletIndex]?.accountId}</div>
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
                    <div>{el?.accountId} </div>
                  </button>
                ) : null;
              })}
              <button
                className="btnAddAccount"
                type="button"
                onClick={handleAddAccount}
              >
                Add Account
              </button>
            </div>
          )
        ) : null}
        <div
          className={`item titleContainer ${dropdownVisible ? "visible" : ""}`}
        >
          <OmniLogo className="nearIconTitle" />
          <span className="title">Omni Near Wallet</span>
        </div>
        <div className="item">
          <button onClick={handleLock}>
            <LockIcon className="lockIcon" />
          </button>
          <button onClick={() => goTo(Settings)}>
            <SettingsIcon className="settingIcon" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default Header;
