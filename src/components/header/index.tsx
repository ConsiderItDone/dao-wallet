import React from "react";
import { ReactComponent as NearIcon } from "../../images/nearIcon.svg";
import { ReactComponent as OmniLogo } from "../../images/omniLogo.svg";
import { ReactComponent as LockIcon } from "../../images/lockIcon.svg";
import { ReactComponent as SettingsIcon } from "../../images/settingsIcon.svg";
import { ReactComponent as ArrowIcon } from "../../images/arrow.svg";
import "./index.css";

const Header = () => {
  return (
    <div className="header">
      <div className="item">
        <button className="backBtn">
          <ArrowIcon />
        </button>
        <button className="dropdownBtn">
          <NearIcon className="nearIcon" />
          <div>Wallet 1 </div>
          <ArrowIcon className="arrowIcon" />
        </button>
      </div>
      <div className="item titleContainer">
        <OmniLogo className="nearIconTitle" />
        <span className="title">Omni Near Wallet</span>
      </div>
      <div className="item">
        <button>
          <LockIcon className="lockIcon" />
        </button>
        <button>
          <SettingsIcon className="settingIcon" />
        </button>
      </div>
    </div>
  );
};
export default Header;
