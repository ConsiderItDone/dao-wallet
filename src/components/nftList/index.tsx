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
      {nftCollections?.length ? (
        nftCollections.map((collection) => (
          <NftCollectionGrid collection={collection} />
        ))
      ) : (
        <div className="noCollections">You don't have NFTs</div>
      )}
    </div>
  );
};
