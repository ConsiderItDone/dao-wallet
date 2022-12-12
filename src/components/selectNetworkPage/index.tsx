import React, { useState } from "react";
import "./index.css";
import Header from "../header";
import { useAuth } from "../../hooks";
import { goBack, goTo } from "react-chrome-extension-router";
import iconsObj from "../../assets/icons";
import BalancePage from "../balancePage";
import { Loading } from "../animations/loading";

export const SELECT_NETWORK_TIMEOUT = 1500;

export const SelectNetworkPage = () => {
  const { networks, selectedNetworkIndex, changeNetwork } = useAuth();

  const [isChangingNetwork, setIsChangingNetwork] = useState<boolean>(false);

  const handleChangeNetwork = async (networkId: string) => {
    setIsChangingNetwork(true);
    await changeNetwork(networkId);
    setTimeout(() => {
      goTo(BalancePage);
    }, SELECT_NETWORK_TIMEOUT);
  };

  const onBack = () => {
    goBack();
  };

  return (
    <div className="selectNetworkPageContainer">
      <Header />
      <div className="body">
        {isChangingNetwork ? (
          <div className="clipLoaderContainer">
            <Loading />
          </div>
        ) : (
          <>
            <div className="title">Choose Network</div>
            <div className="networksContainer">
              {networks.map((network, index) => (
                <button
                  key={index}
                  className={`network ${
                    index === selectedNetworkIndex ? "chosenNetwork" : ""
                  }`}
                  onClick={
                    index !== selectedNetworkIndex
                      ? () => {
                          handleChangeNetwork(network.networkId);
                        }
                      : () => {}
                  }
                >
                  {network.networkId}
                  {index === selectedNetworkIndex ? (
                    <div className="successIconWrapper">
                      <img
                        src={iconsObj.success}
                        alt=""
                        className="successIcon"
                      />
                    </div>
                  ) : null}
                </button>
              ))}
            </div>
            <button className="backBtn" onClick={onBack}>
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
};
