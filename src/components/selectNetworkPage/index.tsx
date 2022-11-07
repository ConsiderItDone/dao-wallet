import React from "react";
import "./index.css";
import Header from "../header";
import { useAuth } from "../../hooks";
import { goBack, goTo } from "react-chrome-extension-router";
import iconsObj from "../../assets/icons";
import BalancePage from "../balancePage";

export const SelectNetworkPage = () => {
  const { networks, selectedNetworkIndex, changeNetwork } = useAuth();

  const onBack = () => {
    goBack();
  };

  return (
    <div className="selectNetworkPageContainer">
      <Header />
      <div className="body">
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
                  ? async () => {
                      await changeNetwork(network.networkId);
                      goTo(BalancePage);
                    }
                  : () => {}
              }
            >
              {network.networkId}
              {index === selectedNetworkIndex ? (
                <div className="successIconWrapper">
                  <img src={iconsObj.success} alt="" className="successIcon" />
                </div>
              ) : null}
            </button>
          ))}
        </div>
        <button className="backBtn" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
};
