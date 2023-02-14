import React, { useState } from "react";
import "./index.css";
import { Loading } from "../animations/loading";
import { shortenWalletAddress } from "../../utils/wallet";
import { CopyToClipboard } from "react-copy-to-clipboard";
import iconsObj from "../../assets/icons";
import NearIcon from "../icon/nerIcon";

interface BalanceCardProps {
  title: string;
  walletAddress: string;
  nearAmount: string | number;
  usdAmount: string | number;
  isLoading?: boolean;
  isAccountNotFunded?: boolean;
}

const BalanceCard = ({
  title,
  walletAddress,
  nearAmount,
  usdAmount,
  isLoading = false,
  isAccountNotFunded = false,
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
            <div className="iconWrapper">
              <NearIcon className="icon" />
            </div>
            <div className="address">
              {walletAddress?.length >= 32
                ? shortenWalletAddress(walletAddress, 6, 6)
                : walletAddress}
            </div>
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
          <div className="balance">
            {isAccountNotFunded ? "-" : nearAmount} NEAR
          </div>
          <div className="text">
            {isAccountNotFunded ? "-" : `≈ ${usdAmount}`} USD
          </div>
        </>
      )}
    </div>
  );
};

export default BalanceCard;
