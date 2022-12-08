import React, { ChangeEvent, useState } from "react";
import "./index.css";
import Header from "../header";
import { ClipLoader } from "react-spinners";
import { goBack, goTo } from "react-chrome-extension-router";
import { useAuth } from "../../hooks";
import BalancePage from "../balancePage";
import { LocalStorage } from "../../services/chrome/localStorage";
import { MAINNET, TESTNET } from "../../consts/networks";
import { NetworkID } from "../../types";

const appLocalStorage = new LocalStorage();

export const AddCustomNetworkPage = () => {
  const { networks, currentNetwork } = useAuth();

  const [networkId, setNetworkId] = useState<string>("");
  const [networkIdError, setNetworkIdError] = useState<
    string | null | undefined
  >(undefined);

  const [nodeUrl, setNodeUrl] = useState<string>("");
  const [defaultNetworkId, setDefaultNetworkId] = useState<NetworkID>(
    currentNetwork?.networkId === "mainnet" ? "mainnet" : "testnet"
  );
  const [isAddingCustomNetwork, setIsAddingCustomNetwork] =
    useState<boolean>(false);

  const onNetworkIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNetworkId(event?.target?.value);
    setNetworkIdError(null);
  };
  const onNodeUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNodeUrl(event?.target?.value);
  };
  const onDefaultNetworkIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDefaultNetworkId(event?.target?.value);
  };

  const handleAddCustomNetwork = async () => {
    if (isAddingCustomNetwork) return;

    setIsAddingCustomNetwork(true);

    try {
      for (const existingNetwork of networks) {
        if (networkId === existingNetwork.networkId) {
          setNetworkIdError("Network with such network ID is already added");
          return;
        }
      }

      let defaultNetwork = defaultNetworkId === "mainnet" ? MAINNET : TESTNET;
      await appLocalStorage.addCustomNetwork({
        ...defaultNetwork,
        networkId,
        nodeUrl,
      });
      goTo(BalancePage);
    } catch (error) {
      console.error("[HandleAddCustomNetwork]:", error);
      setNetworkIdError("Failed to add custom network");
    } finally {
      setIsAddingCustomNetwork(false);
    }
  };

  const onCancel = () => {
    goBack();
  };

  return (
    <div className="addCustomNetworkPageContainer">
      <Header />
      <div className="body">
        <div className="title">Add Custom Network</div>
        <div className="form">
          <input
            className="networkDataInput"
            placeholder="Network ID"
            onChange={onNetworkIdChange}
            value={networkId}
            disabled={isAddingCustomNetwork}
          />
          {!!networkId && networkIdError && (
            <div className="errorMessage">{networkIdError}</div>
          )}
          <input
            className="networkDataInput"
            placeholder="Node URL"
            value={nodeUrl}
            onChange={onNodeUrlChange}
            disabled={isAddingCustomNetwork}
          />
          <div className="radioInputsContainer">
            <input
              type="radio"
              id="mainnet"
              name="isMainnet"
              value="mainnet"
              checked={defaultNetworkId === "mainnet"}
              onChange={onDefaultNetworkIdChange}
            />
            <label className="radioInputLabel" htmlFor="mainnet">
              Mainnet
            </label>
            <input
              type="radio"
              id="testnet"
              name="isTestnet"
              value="testnet"
              checked={defaultNetworkId === "testnet"}
              onChange={onDefaultNetworkIdChange}
            />
            <label className="radioInputLabel" htmlFor="testnet">
              Testnet
            </label>
          </div>
        </div>
        <button
          onClick={handleAddCustomNetwork}
          disabled={
            !networkId ||
            networkIdError === undefined ||
            !!networkIdError ||
            !nodeUrl ||
            isAddingCustomNetwork
          }
          className="addCustomNetworkButton"
        >
          {isAddingCustomNetwork ? (
            <ClipLoader color="#fff" size={14} />
          ) : (
            "Add"
          )}
        </button>
        <button
          className="cancel"
          onClick={onCancel}
          disabled={isAddingCustomNetwork}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
