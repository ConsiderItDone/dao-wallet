import React, { useState } from "react";
import Icon from "../icon";
import iconsObj from "../../assets/icons";
import ChooseMethod from "../chooseMethod";
import { goTo } from "react-chrome-extension-router";
import "./index.css";

const HpmePage = () => {
  const [password, setPassword] = useState("");

  const submit = () => {
    if (password === "123") {
      goTo(ChooseMethod);
    } else {
      setPassword("");
    }
  };

  return (
    <div className="homePageContainer">
      <div className="title">Omni Near Wallet</div>
      <div className="iconContainer">
        <div className="bg">
          <Icon className="omniLogo" src={iconsObj.omniLogo} />
        </div>
        <Icon className="nearMenu" src={iconsObj.nearMenu} />
      </div>
      <input
        onChange={(e) => setPassword(e?.target?.value)}
        placeholder="Enter password"
        className="password"
        value={password}
        type="password"
      />
      <button onClick={submit} type="button" className="btn">
        Unlock
      </button>
    </div>
  );
};

export default HpmePage;
