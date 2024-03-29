import React, { useState } from "react";
import { goBack, goTo } from "react-chrome-extension-router";
import FooterSettings from "../footerSettings";
import iconsObj from "../../assets/icons";
import Icon from "../icon";
import Header from "../header";
import "./index.css";
import { SelectNetworkPage } from "../selectNetworkPage";
import { useAuth } from "../../hooks";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { ExportPrivateKeyPage } from "../exportPrivateKeyPage";
import { AddCustomNetworkPage } from "../addCustomNetworkPage";
import { shortenWalletAddress } from "../../utils/wallet";

const Settings = () => {
  const { currentAccount } = useAuth();
  const [showCopiedIcon, setShowCopiedIcon] = useState<boolean>(false);

  const onAddressCopy = () => {
    setShowCopiedIcon(true);
    setTimeout(() => {
      setShowCopiedIcon(false);
    }, 1000);
  };

  const handleChangeNetwork = () => {
    goTo(SelectNetworkPage);
  };

  const handleAddCustomNetwork = () => {
    goTo(AddCustomNetworkPage);
  };

  const handleExportPrivateKey = () => {
    goTo(ExportPrivateKeyPage, { account: currentAccount });
  };

  return (
    <div className="settings">
      <Header />
      <div className="settingsContainer">
        <button onClick={() => goBack()} className="closeBtn">
          <Icon style={{ cursor: "pointer" }} src={iconsObj.x_close} />
        </button>
        <div className="titleSettings">Settings</div>
        <div className="wallet">Wallet ID</div>
        <div className="text">
          {currentAccount?.accountId?.length &&
          currentAccount.accountId.length >= 32
            ? shortenWalletAddress(currentAccount.accountId, 6, 6)
            : currentAccount?.accountId}
          <CopyToClipboard
            text={currentAccount?.accountId || ""}
            onCopy={onAddressCopy}
          >
            <div className="addressCopyIconWrapper">
              <img
                src={showCopiedIcon ? iconsObj.success : iconsObj.copyIcon}
                className="addressCopyIcon"
                alt=""
              />
            </div>
          </CopyToClipboard>
        </div>
        <button className="menuItembtn" onClick={handleChangeNetwork}>
          <div>Change Network</div>
        </button>
        <button className="menuItembtn" onClick={handleAddCustomNetwork}>
          <div>Add Custom Network</div>
        </button>
        <button className="menuItembtn" onClick={handleExportPrivateKey}>
          <div>Export Private Key</div>
        </button>
      </div>
      <FooterSettings />
    </div>
  );
};
export default Settings;
