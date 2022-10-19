import React, { useState } from "react";
import "./index.css";
import iconsObj from "../../assets/icons";
import { goTo } from "react-chrome-extension-router";
import { NftPage } from "../nftPage";
import { NftCollection } from "../../types";

interface Props {
  collection: NftCollection;
}

export const NftCollectionGrid = ({ collection }: Props) => {
  const [shouldShowMoreNfts, setShouldShowMoreNfts] = useState(false);

  const onShowMoreNfts = () => {
    setShouldShowMoreNfts((prevState) => !prevState);
  };

  return (
    <div className="collection">
      <div className="collectionHeader">
        <div className="leftPartWrapper">
          <div className="collectionIconWrapper">
            <img src={collection?.icon} alt="" className="collectionIcon" />
          </div>
          <div className="nameAndCountWrapper">
            <div className="name">{collection?.name}</div>
            <div className="count">{collection?.nfts?.length}</div>
          </div>
        </div>
        <div className="rightPartWrapper">
          <div className="arrowWrapper" onClick={onShowMoreNfts}>
            <img
              src={iconsObj.arrowRight}
              alt=""
              className={`arrow ${shouldShowMoreNfts ? "rotated" : ""}`}
            />
          </div>
        </div>
      </div>
      <div className={`nftsContainer ${!shouldShowMoreNfts ? "closed" : ""}`}>
        {collection?.nfts?.map((nft, index) => (
          <div
            className="nftWrapper"
            key={index}
            onClick={() => {
              goTo(NftPage, {
                nft,
              });
              window.scrollTo(0, 0);
            }}
          >
            <img src={nft?.media} alt="" className="nftImage" />
          </div>
        ))}
      </div>
    </div>
  );
};
