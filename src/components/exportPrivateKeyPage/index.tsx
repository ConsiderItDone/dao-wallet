import React, { useState } from "react";
import "./index.css";
import { AccountWithPrivateKey } from "../../services/chrome/localStorage";
import Header from "../header";
import { goBack } from "react-chrome-extension-router";
import { CopyToClipboard } from "react-copy-to-clipboard";

interface Props {
  account: AccountWithPrivateKey;
}

export const ExportPrivateKeyPage = ({ account }: Props) => {
  const [showCopiedMessage, setShowCopiedMessage] = useState<boolean>(false);

  const onPrivateKeyCopy = () => {
    setShowCopiedMessage(true);
    setTimeout(() => {
      setShowCopiedMessage(false);
    }, 1000);
  };

  const onBack = () => {
    goBack();
  };

  return (
    <div className="exportPrivateKeyPageContainer">
      <Header />
      <div className="body">
        <div className="title">Export Private Key</div>
        <div className="subtitleWarning">
          Warning: do not share your private key with anyone
        </div>
        <div className="privateKeyWrapper">{account?.privateKey}</div>
        <div className="buttonsContainer">
          <CopyToClipboard
            text={account?.privateKey || ""}
            onCopy={onPrivateKeyCopy}
          >
            <button className="copyButton">
              {showCopiedMessage ? "Copied!" : "Copy"}
            </button>
          </CopyToClipboard>
          <button className="backBtn" onClick={onBack}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
};
