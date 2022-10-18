import "./index.css";
import { NftCollection } from "../../hooks/useAccountNftCollections";
import iconsObj from "../../assets/icons";
import React from "react";

interface Props {
  nftCollections: NftCollection[];
}

export const NftList = ({ nftCollections }: Props) => {
  return (
    <div className="nftCollectionsContainer">
      {nftCollections?.length ? (
        nftCollections.map((collection, index) => (
          <div className="collection" key={index}>
            <div className="collectionHeader">
              <div className="leftPartWrapper">
                <div className="collectionIconWrapper">
                  <img
                    src={collection?.icon}
                    alt=""
                    className="collectionIcon"
                  />
                </div>
                <div className="nameAndCountWrapper">
                  <div className="name">{collection?.name}</div>
                  <div className="count">{collection?.nfts?.length}</div>
                </div>
              </div>
              <div className="rightPartWrapper">
                <div className="arrowWrapper">
                  <img src={iconsObj.arrowRight} alt="" className="arrow" />
                </div>
              </div>
            </div>
            <div className="nftsContainer">
              {collection?.nfts?.map((nft, index) => (
                <div className="nftWrapper" key={index}>
                  <img src={nft?.media} alt="" className="nftImage" />
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="noCollections">You don't have NFTs</div>
      )}
    </div>
  );
};
