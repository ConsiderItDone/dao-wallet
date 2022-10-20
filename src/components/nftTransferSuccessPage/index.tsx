import React from "react";
import "./index.css";
import Header from "../header";
import iconsObj from "../../assets/icons";
import { goTo } from "react-chrome-extension-router";
import { BalancePage } from "../index";

export const NftTransferSuccessPage = () => {
  const onContinue = () => {
    goTo(BalancePage);
  };

  return (
    <div className="nftTransferSuccessPageContainer">
      <Header />
      <div className="body">
        <div className="successIconWrapper">
          <img src={iconsObj.successBigIcon} alt="" className="successIcon" />
        </div>
        <div className="title">NFT Transfer Completed!</div>
        <button className="btnContinue" onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  );
};
