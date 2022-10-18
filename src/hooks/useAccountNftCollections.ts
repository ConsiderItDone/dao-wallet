import { useEffect, useState } from "react";
import {
  fetchNftCollectionMetadata,
  fetchNftsFromCollectionForAccount,
  listLikelyNftsContracts,
} from "../utils/nfts";
import { useQuery } from "./useQuery";
import { VIEW_FUNCTION_METHOD_NAME } from "../consts/wrapper";

export interface NftCollection {
  name: string;
  icon: string;
  contractName: string;
  nfts: Nft[];
}

export interface Nft {
  title: string;
  description: string;
  media: string;
  tokenId: string;
}

export const useAccountNftCollections = (
  accountId: string | undefined
): NftCollection[] | undefined => {
  const [viewFunctionExecute] = useQuery(VIEW_FUNCTION_METHOD_NAME);

  const [nftCollections, setNftCollections] = useState<
    NftCollection[] | undefined
  >(undefined);

  useEffect(() => {
    const getAccountNfts = async () => {
      setNftCollections(undefined);

      if (!accountId) return;

      const likelyNftContractsList = await listLikelyNftsContracts(accountId);
      if (!likelyNftContractsList?.list) {
        return;
      }

      const nftCollections: NftCollection[] = [];
      for (const collectionContractName of likelyNftContractsList.list) {
        const nftCollectionMetadata = await fetchNftCollectionMetadata(
          collectionContractName,
          viewFunctionExecute
        );
        if (!nftCollectionMetadata) {
          continue;
        }

        const nfts = await fetchNftsFromCollectionForAccount(
          collectionContractName,
          accountId,
          viewFunctionExecute
        );

        nftCollections.push({
          name: nftCollectionMetadata?.name,
          icon: nftCollectionMetadata?.icon,
          contractName: collectionContractName,
          nfts:
            nfts?.map((nftMetadata) => ({
              title: nftMetadata?.metadata?.title,
              description: nftMetadata?.metadata?.description,
              media: nftMetadata?.metadata?.media,
              tokenId: nftMetadata?.token_id,
            })) || [],
        });
      }

      setNftCollections(nftCollections);
    };

    getAccountNfts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  return nftCollections;
};
