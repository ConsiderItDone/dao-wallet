import "./index.css";
import React from "react";
import { NftCollection } from "../../types";
import { NftCollectionGrid } from "../nftCollectionGrid";

interface Props {
  nftCollections: NftCollection[];
}

export const NftCollectionsList = ({ nftCollections }: Props) => {
  return (
    <div className="nftCollectionsContainer">
      {nftCollections?.length &&
      nftCollections.some((collection) => collection?.nfts?.length > 0) ? (
        nftCollections.map((collection, index) => (
          <NftCollectionGrid collection={collection} key={index} />
        ))
      ) : (
        <div className="noCollections">You don't have NFTs</div>
      )}
    </div>
  );
};
