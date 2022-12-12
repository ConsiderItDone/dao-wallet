import { TokenAmountData } from "../components/tokenList";
import { useEffect, useState } from "react";
import { NEAR_TOKEN } from "../consts/near";
import { fetchTokenBalance, fetchTokenMetadata } from "../utils/fungibleTokens";
import { useFetchJson, useQuery } from "./useQuery";
import { VIEW_FUNCTION_METHOD_NAME } from "../consts/wrapper";
import defaultTokenIcon from "../images/defaultTokenIcon.svg";

// Returns list of account fungible tokens
export const useAccountTokens = (
  accountId: string | undefined,
  accountNearAmount: number | undefined,
  nearToUSDRatio?: number | undefined
): TokenAmountData[] | undefined => {
  const [viewFunctionExecute] = useQuery(VIEW_FUNCTION_METHOD_NAME);

  const [nearToken, setNearToken] = useState<TokenAmountData | undefined>(
    undefined
  );

  // This array doesn't include NEAR token
  const [otherTokensList, setOtherTokensList] = useState<
    TokenAmountData[] | undefined
  >(undefined);

  const getAccountFungibleTokens = useFetchJson("likelyTokensFromBlock");

  useEffect(() => {
    if (accountNearAmount !== null && accountNearAmount !== undefined) {
      setNearToken({
        token: NEAR_TOKEN,
        amount: accountNearAmount,
        usdRatio: nearToUSDRatio,
      });
    } else {
      setNearToken(undefined);
    }
  }, [accountNearAmount, nearToUSDRatio]);

  useEffect(() => {
    const formTokenList = async (accountId: string | undefined) => {
      if (!accountId) {
        setOtherTokensList([]);
        return;
      } else {
        setOtherTokensList(undefined);
      }

      try {
        const newTokenList: TokenAmountData[] = [];

        const accountFungibleTokens = await getAccountFungibleTokens<{
          list: string[];
        }>({ accountId });

        const otherFungibleTokensAddresses: string[] =
          accountFungibleTokens?.list || [];

        for (const tokenAddress of otherFungibleTokensAddresses) {
          const token = await fetchTokenMetadata(
            tokenAddress,
            viewFunctionExecute
          );
          if (!token) {
            continue;
          }

          const tokenBalance = await fetchTokenBalance(
            tokenAddress,
            token.decimals,
            accountId,
            viewFunctionExecute
          );
          if (!tokenBalance) {
            continue;
          }

          // TODO: fetch usd ratio for all tokens
          newTokenList.push({
            token: {
              ...token,
              address: tokenAddress,
              icon: token?.icon || defaultTokenIcon,
            },
            amount: tokenBalance || undefined,
            usdRatio: undefined,
          });
        }

        setOtherTokensList(newTokenList);
      } catch (error) {
        console.error("[FormTokenList]:", error);
      }
    };

    formTokenList(accountId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  return nearToken && otherTokensList
    ? [nearToken, ...otherTokensList]
    : undefined;
};
