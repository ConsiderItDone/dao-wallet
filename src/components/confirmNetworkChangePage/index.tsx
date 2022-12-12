import React, { useState } from "react";
import "./index.css";
import { ClipLoader } from "react-spinners";
import { LocalStorage } from "../../services/chrome/localStorage";

const appLocalStorage = new LocalStorage();

interface Props {
  website: string;
  networkId: string;
}

export const ConfirmNetworkChangePage = ({ website, networkId }: Props) => {
  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  const onConfirm = async () => {
    setIsConfirming(true);

    const networks = await appLocalStorage.getNetworks();
    let requestedNetworkIndex: number | undefined = undefined;
    if (networks) {
      for (let i = 0; i < networks.length; i++) {
        if (networks[i].networkId === networkId) {
          requestedNetworkIndex = i;
          break;
        }
      }
    }
    if (requestedNetworkIndex !== undefined) {
      await appLocalStorage.setLastSelectedNetworkIndex(requestedNetworkIndex);
    }

    setTimeout(() => window.close(), 1000);
  };

  const onCancel = () => {
    window.close();
  };

  return (
    <div className="confirmNetworkChangePageContainer">
      <div className="body">
        <div className="originWebsite">{website}</div>
        <div className="subtitle">Requested to change network to</div>
        <div className="networkId">{networkId}</div>
        <button
          type="button"
          className="connectAccountsBtn confirm"
          onClick={onConfirm}
          disabled={isConfirming}
        >
          {isConfirming ? <ClipLoader color="#fff" size={14} /> : "Confirm"}
        </button>
        <button
          type="button"
          className="connectAccountsBtn cancel"
          onClick={onCancel}
          disabled={isConfirming}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
