import React from "react";
import { goBack } from "react-chrome-extension-router";
import { ReactComponent as CopyIcon } from "../../images/copyIcon.svg";
import FooterSettings from "../footerSettings";
import iconsObj from "../../assets/icons";
import Icon from "../icon";
import Header from "../header";
import { items } from "./mock";
import "./index.css";

const Settings = () => {
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
          0xa3417B...2acF5 <CopyIcon className="copyIcon" />
        </div>
        {items.map((el) => {
          return (
            <button key={el?.id} className="menuItembtn">
              <div>{el?.title} </div>
            </button>
          );
        })}
      </div>
      <FooterSettings />
    </div>
  );
};
export default Settings;
