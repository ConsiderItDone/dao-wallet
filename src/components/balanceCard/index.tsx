import React from "react";
import { ReactComponent as CopyIcon } from "../../images/copyIcon.svg";
import "./index.css";

const BalanceCard = ({ title }: any) => {
  return (
    <div className="balanceContainer">
      <div className="token">
        df4d1274f600ee...{" "}
        <CopyIcon style={{ cursor: "pointer" }} className="copyIcon" />
      </div>
      <div className="title">{title}</div>
      <div className="balance">0.93245 NEAR</div>
      <div className="text">≈ $6.9208 USD</div>
    </div>
  );
};

export default BalanceCard;
