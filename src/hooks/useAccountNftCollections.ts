import { useEffect, useState } from "react";
import {
  AccountLikelyNftContractsList,
  fetchNftCollectionMetadata,
  fetchNftsFromCollectionForAccount,
} from "../utils/nfts";
import { useFetchJson, useQuery } from "./useQuery";
import { VIEW_FUNCTION_METHOD_NAME } from "../consts/wrapper";
import { NftCollection } from "../types";

export const useAccountNftCollections = (
  accountId: string | undefined
): NftCollection[] | undefined => {
  const [viewFunctionExecute] = useQuery(VIEW_FUNCTION_METHOD_NAME);

  const listLikelyNftsContracts = useFetchJson("listLikelyNftsContracts");

  const [nftCollections, setNftCollections] = useState<
    NftCollection[] | undefined
  >(undefined);

  useEffect(() => {
    const getAccountNfts = async () => {
      if (!accountId) {
        setNftCollections([]);
        return;
      } else {
        setNftCollections(undefined);
      }

      const likelyNftContractsList =
        await listLikelyNftsContracts<AccountLikelyNftContractsList>({
          accountId,
        });
      if (!likelyNftContractsList?.list) {
        setNftCollections([]);
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
              owner: nftMetadata?.owner_id,
              contractName: collectionContractName,
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
