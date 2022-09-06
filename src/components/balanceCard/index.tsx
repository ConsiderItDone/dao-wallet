import React from "react";
import { ReactComponent as CopyIcon } from "../../images/copyIcon.svg";
import "./index.css";
import { shortenWalletAddress } from "../../utils/wallet";
import { ClipLoader } from "react-spinners";

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
    <div className="balanceContainer">
      {isLoading ? (
        <div className="clipLoaderContainer">
          <ClipLoader color="#9896F0" size={48} />
        </div>
      ) : (
        <>
          <div className="token">
            {shortenWalletAddress(walletAddress)}{" "}
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
