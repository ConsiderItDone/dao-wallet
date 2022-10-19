import React from "react";
import "./index.css";
import Header from "../header";
import { NFT } from "../../types";
import iconsObj from "../../assets/icons";

interface Props {
  nft: NFT;
}

export const NftPage = ({ nft }: Props) => {
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
          <div className="descriptionHeader">
            <div className="label">Description</div>
            <div className="showDescriptionWrapper">
              <img
                src={iconsObj.arrowUp}
                alt=""
                className="showDescriptionIcon"
              />
            </div>
          </div>
          <div className="description">{nft?.description}</div>
        </div>
        <button className="transferButton">Transfer</button>
      </div>
    </div>
  );
};
