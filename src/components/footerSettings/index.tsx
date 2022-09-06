import React from "react";
import Icon from "../icon";
import iconsObj from "../../assets/icons";
import "./index.css";

const FooterSettings = () => {
  return (
    <div className="footerSettings">
      <div className="title">
        Created by CIDT using
        <span className="link">Polywrap</span> technlogies
      </div>
      <div className="icon">
        <Icon src={iconsObj.logoCIDT} />
      </div>
      <div className="logo">
        <Icon src={iconsObj.nearIcon} /> <Icon src={iconsObj.polywrapLogo} />
      </div>
    </div>
  );
};

export default FooterSettings;
