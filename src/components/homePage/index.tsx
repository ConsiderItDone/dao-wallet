import React, { useState } from "react";
import Icon from "../icon";
import iconsObj from "../../assets/icons";
import "./index.css";

const HpmePage = () => {
  const [password, setPassword] = useState("");
  const submit = () => {
    console.log(password);
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
        className="password"
        type="password"
        placeholder="Enter password"
      />
      <button onClick={submit} type="button" className="btn">
        Unlock
      </button>
    </div>
  );
};

export default HpmePage;
