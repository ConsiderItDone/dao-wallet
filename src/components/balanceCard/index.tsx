import React, { useState } from "react";
import "./index.css";
import { Loading } from "../animations/loading";
import { shortenWalletAddress } from "../../utils/wallet";
import { CopyToClipboard } from "react-copy-to-clipboard";
import iconsObj from "../../assets/icons";

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
  const [showCopiedIcon, setShowCopiedIcon] = useState<boolean>(false);

  const onAddressCopy = () => {
    setShowCopiedIcon(true);
    setTimeout(() => {
      setShowCopiedIcon(false);
    }, 1000);
  };

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
            {shortenWalletAddress(walletAddress, 6, 6)}
            <CopyToClipboard text={walletAddress} onCopy={onAddressCopy}>
              <div className="addressCopyIconWrapper">
                <img
                  src={showCopiedIcon ? iconsObj.success : iconsObj.copyIcon}
                  className="addressCopyIcon"
                  alt=""
                />
              </div>
            </CopyToClipboard>
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
