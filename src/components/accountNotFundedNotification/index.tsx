import React from "react";
import "./index.css";
import iconsObj from "../../assets/icons";
import { NEAR_TOKEN } from "../../consts/near";

export const AccountNotFundedNotification = () => {
  const openDepositPage = async () => {
    // TODO: open page where user can deposit NEAR
  };

  return (
    <div className="accountNotFundedNotificationContainer">
      <div className="token">
        <div className="leftPartWrapper">
          <div className="iconWrapper">
            <img src={NEAR_TOKEN.icon} alt="" className="icon" />
          </div>
          <div className="messageWrapper">
            <div className="title">Deposit NEAR</div>
            <div className="info">
              You'll need NEAR tokens to perform transactions
            </div>
          </div>
        </div>
        <div className="rightPartWrapper">
          <div className="imgWrapper" onClick={openDepositPage}>
            <img src={iconsObj.plusIcon} alt="" className="img" />
          </div>
        </div>
      </div>
    </div>
  );
};
