import React from "react";
import { goBack, goTo } from "react-chrome-extension-router";
import { ReactComponent as CopyIcon } from "../../images/copyIcon.svg";
import FooterSettings from "../footerSettings";
import iconsObj from "../../assets/icons";
import Icon from "../icon";
import Header from "../header";
import "./index.css";
import { SelectNetworkPage } from "../selectNetworkPage";
import { useAuth } from "../../hooks";

const Settings = () => {
  const { currentAccount } = useAuth();

  const handleChangeNetwork = () => {
    goTo(SelectNetworkPage);
  };

  return (
    <div className="settings">
      <Header />
      <div className="settingsContainer">
        <button onClick={() => goBack()} className="closeBtn">
          <Icon style={{ cursor: "pointer" }} src={iconsObj.x_close} />
        </button>
        <div className="titleSettings">Settings</div>
        <div className="wallet">Wallet ID</div>
        <div className="text">
          {currentAccount?.accountId} <CopyIcon className="copyIcon" />
        </div>
        <button className="menuItembtn" onClick={handleChangeNetwork}>
          <div>Change Network</div>
        </button>
        <button className="menuItembtn">
          <div>Export Private Key</div>
        </button>
      </div>
      <FooterSettings />
    </div>
  );
};
export default Settings;
