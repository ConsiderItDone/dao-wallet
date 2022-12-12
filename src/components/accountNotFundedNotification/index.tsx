import React from "react";
import "./index.css";
import { NEAR_TOKEN } from "../../consts/near";

export const AccountNotFundedNotification = () => {
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
      </div>
    </div>
  );
};
