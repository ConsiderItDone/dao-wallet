import React from "react";
import iconsObj from "../../assets/icons";
import Header from "../header";
import Icon from "../icon";
import "./index.css";

const TrasactionPage = () => {
  return (
    <div className="transactionPageContainer">
      <Header />
      <div className="body">
        <Icon src={iconsObj.transactionIcon} className="icon" />
        <div className="title">Transaction Complete !</div>
        <div className="secondaryTitle">You sent</div>
        <div className="near">0.83 NEAR</div>
        <div className="recipient"> accomplice.poolv1.near</div>
        <button className="btnContinue">Continue</button>
      </div>
    </div>
  );
};

export default TrasactionPage;
