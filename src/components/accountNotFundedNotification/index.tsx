import React from "react";
import "./index.css";
import NearIcon from "../icon/nerIcon";

export const AccountNotFundedNotification = () => {
  return (
    <div className="accountNotFundedNotificationContainer">
      <div className="token">
        <div className="leftPartWrapper">
          <div className="iconWrapper">
            <NearIcon width="20" height="20" />
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
