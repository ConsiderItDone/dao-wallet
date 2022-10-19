import React, { useState } from "react";
import "./index.css";
import Header from "../header";
import { NFT } from "../../types";
import iconsObj from "../../assets/icons";
import { goTo } from "react-chrome-extension-router";
import { TransferNftPage } from "../transferNftPage";

interface Props {
  nft: NFT;
}

export const NftPage = ({ nft }: Props) => {
  const [shouldShowDescription, setShouldShowDescription] =
    useState<boolean>(true);

  const onShowDescription = () => {
    setShouldShowDescription((prevState) => !prevState);
  };

  const onTransfer = () => {
    goTo(TransferNftPage, { nft });
  };

  return (
    <div className="nftPageContainer">
      <Header />
      <div className="body">
        <div className="nftHeaderWrapper">
          <div className="nftTitle">{nft?.title}</div>
          <div className="contextMenuDotsWrapper">
            <img
              src={iconsObj.verticalDots}
              alt=""
              className="contextMenuDots"
            />
          </div>
        </div>
        <div className="nftMediaWrapper">
          <img src={nft?.media} alt="" className="nftMedia" />
        </div>
        <div className="ownerWrapper">
          <div className="label">Owner</div>
          <div className="value">{nft?.owner}</div>
        </div>
        <div className="descriptionWrapper">
          <div className="descriptionHeader" onClick={onShowDescription}>
            <div className="label">Description</div>
            <div className="showDescriptionWrapper">
              <img
                src={iconsObj.arrowUp}
                alt=""
                className={`showDescriptionIcon ${
                  !shouldShowDescription ? "reversed" : ""
                }`}
              />
            </div>
          </div>
          <div
            className={`description ${
              !shouldShowDescription ? "descriptionHidden" : ""
            }`}
          >
            {nft?.description}
          </div>
        </div>
        <button className="transferButton" onClick={onTransfer}>
          Transfer
        </button>
      </div>
    </div>
  );
};
