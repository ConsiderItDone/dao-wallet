import React from "react";
import { ReactComponent as CopyIcon } from "../../images/copyIcon.svg";
import "./index.css";
import { shortenWalletAddress } from "../../utils/wallet";
import { Loading } from "../animations/loading";

interface BalanceCardProps {
  title: string;
  walletAddress: string;
  nearAmount: string | number;
  usdAmount: string | number;
  isLoading?: boolean;
}

const BalanceCard = ({
  title,
  walletAddress,
  nearAmount,
  usdAmount,
  isLoading = false,
}: BalanceCardProps) => {
  return (
    <div
      style={{ backgroundColor: isLoading ? "inherit" : "white" }}
      className="balanceContainer"
    >
      {isLoading ? (
        <div className="clipLoaderContainer">
          <Loading />
        </div>
      ) : (
        <>
          <div className="token">
            {shortenWalletAddress(walletAddress, 4, 4)}{" "}
            <CopyIcon style={{ cursor: "pointer" }} className="copyIcon" />
          </div>
          <div className="title">{title}</div>
          <div className="balance">{nearAmount} NEAR</div>
          <div className="text">≈ ${usdAmount} USD</div>
        </>
      )}
    </div>
  );
};

export default BalanceCard;
