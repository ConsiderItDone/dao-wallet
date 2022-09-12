import "./index.css";

export interface NFT {
  name: string;
  icon: string;
}

interface Props {
  nfts: NFT[];
}

export const NftList = ({ nfts }: Props) => {
  return <div className="nftListContainer">You don't have NFTs</div>;
};
