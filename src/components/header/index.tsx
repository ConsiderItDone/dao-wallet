import React, { useState } from "react";
import { goBack, goTo } from "react-chrome-extension-router";
import { ReactComponent as NearIcon } from "../../images/nearIcon.svg";
import { ReactComponent as OmniLogo } from "../../images/omniLogo.svg";
import { ReactComponent as LockIcon } from "../../images/lockIcon.svg";
import { ReactComponent as SettingsIcon } from "../../images/settingsIcon.svg";
import { ReactComponent as ArrowIcon } from "../../images/arrow.svg";
import Settings from "../settingsPage";
import "./index.css";

const wallets = [
  {
    id: 1,
    title: "Wallet 1",
  },
  {
    id: 2,
    title: "Wallet 2",
  },
  {
    id: 3,
    title: "Wallet 3",
  },
];

const Header = () => {
  const [wallet, setWallet] = useState(wallets[0]);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  return (
    <div className="header">
      {!dropdownVisible ? (
        <div className="item walletContainer">
          <button
            onClick={() => {
              goBack();
            }}
            className="backBtn"
          >
            <ArrowIcon />
          </button>
          <button
            onClick={() => setDropdownVisible(!dropdownVisible)}
            className="dropdownBtn"
          >
            <NearIcon className="nearIcon" />
            <div>{wallet?.title}</div>
            <ArrowIcon className="arrowIcon" />
          </button>
        </div>
      ) : (
        <div className="walletsContainer">
          <div className="item curentWallet">
            <button
              onClick={() => {
                goBack();
              }}
              className="backBtn"
            >
              <ArrowIcon />
            </button>
            <button
              onClick={() => setDropdownVisible(!dropdownVisible)}
              className="dropdownBtn"
            >
              <NearIcon className="nearIcon" />
              <div>{wallet?.title}</div>
              <ArrowIcon className="arrowIcon" />
            </button>
          </div>
          {wallets.map((el) => {
            return el?.id !== wallet?.id ? (
              <button
                onClick={() => {
                  setDropdownVisible(!dropdownVisible);
                  setWallet(el);
                }}
                key={el?.id}
                className="dropdownBtn interationBtn"
              >
                {wallet?.id === el?.id && <NearIcon className="nearIcon" />}
                <div>{el?.title} </div>
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
  );
};
export default Header;
