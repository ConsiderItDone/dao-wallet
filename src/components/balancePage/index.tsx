import React, { useEffect, useState } from "react";
import NavFooter from "../navFooter";
import Header from "../header";
import BalanceCard from "../balanceCard";
import Icon from "../icon";
import iconsObj from "../../assets/icons";
import "./index.css";
import SendPage from "../sendPage";
import { goTo } from "react-chrome-extension-router";
import { AccountWithPrivateKey } from "../../services/chrome/localStorage";
import { useAuth, useQuery } from "../../hooks";
import { getNearToUSDRatio } from "../../services/coingecko/api";
import { NEAR_TOKEN } from "../../consts/near";
import { NftCollectionsList } from "../nftList";
import { TokenAmountData, TokenList } from "../tokenList";
import { fetchTokenBalance, TokenMetadata } from "../../utils/fungibleTokens";
import { VIEW_FUNCTION_METHOD_NAME } from "../../consts/wrapper";
import { useStakingData } from "../../hooks/useStakingData";
import { parseNearTokenAmount } from "../../utils/near";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useAccountNftCollections } from "../../hooks/useAccountNftCollections";
import { Loading } from "../animations/loading";

const RESERVED_FOR_TRANSACTION_FEES = 0.05;

export const ACCOUNT_BALANCE_METHOD_NAME = "getAccountBalance";

const formatTokenAmount = (
  amount: number | null | undefined,
  fractionDigits: number = 5
) => {
  if (!amount) return 0;
  return Number(amount.toFixed(fractionDigits));
};

const formatUSDAmount = (
  amount: number | null | undefined,
  fractionDigits: number = 2
) => {
  if (!amount) return 0;
  return Number(amount.toFixed(fractionDigits));
};

const wrapValueElementWithSkeletonLoading = (
  value: any,
  element: React.ReactElement
) => {
  if (typeof value === "number") {
    return element;
  } else {
    return (
      <Skeleton
        count={1}
        width={100}
        height={16}
        baseColor="#d9d9e5"
        highlightColor="#FFFFFF77"
      />
    );
  }
};

export interface AccountBalance {
  available: number;
  staked: number;
  stateStaked: number;
  total: number;
}

const BalancePage = () => {
  const [footerTab, setFooterTab] = useState("tokens");
  const [isBalanceDropdownVisible, setIsBalanceDropdownVisible] =
    useState(true);
  const [isStakeDropdownVisible, setIsStakeDropdownVisible] = useState(true);

  const [accountBalanceQueryExecute, { loading: isLoadingAccountBalance }] =
    useQuery<AccountBalance>(ACCOUNT_BALANCE_METHOD_NAME);
  const [viewFunctionExecute] = useQuery<TokenMetadata>(
    VIEW_FUNCTION_METHOD_NAME
  );

  const { currentAccount: account } = useAuth();

  const [accountBalance, setAccountBalance] = useState<AccountBalance | null>(
    null
  );
  const [nearToUsdRatio, setNearToUsdRatio] = useState<number>(0);

  const [tokenList, setTokenList] = useState<TokenAmountData[] | null>(null);

  const {
    totalStaked,
    totalPending: totalStakedPending,
    totalAvailable: totalStakedAvailable,
  } = useStakingData(account?.accountId);

  const nftCollections = useAccountNftCollections(account?.accountId);

  useEffect(() => {
    setAccountBalance(null);
    if (account?.accountId) {
      accountBalanceQueryExecute({ accountId: account?.accountId })
        .then((balanceData) => {
          if (balanceData?.error) {
            console.error("[GetAccountBalanceBalanceData]:", balanceData.error);
          }
          const data = balanceData?.data;
          if (data) {
            setAccountBalance({
              available:
                parseNearTokenAmount(data?.available) -
                RESERVED_FOR_TRANSACTION_FEES,
              staked: parseNearTokenAmount(data?.staked),
              stateStaked: parseNearTokenAmount(data?.stateStaked),
              total: parseNearTokenAmount(data?.total),
            });
          } else {
            console.error(
              "[GetAccountBalance]: received empty account balance data"
            );
            //TODO handle not funded account status
            setAccountBalance({
              available: 0,
              staked: 0,
              stateStaked: 0,
              total: 0,
            });
          }
        })
        .catch((error) => {
          console.error("[GetAccountBalance]:", error);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.accountId]);

  useEffect(() => {
    getNearToUSDRatio()
      .then((ratio) => {
        setNearToUsdRatio(ratio);
      })
      .catch((error) => {
        console.error("[BalancePageGetNearToUSDRatio]:", error);
      });
  }, []);

  useEffect(() => {
    const formTokenList = async (
      account: any | AccountWithPrivateKey,
      accountBalance: AccountBalance,
      nearToUsdRatio: number
    ) => {
      setTokenList(null);

      const newTokenList: TokenAmountData[] = [];

      const nearTokenAmountData: TokenAmountData = {
        token: NEAR_TOKEN,
        amount: accountBalance.available,
        usdRatio: nearToUsdRatio,
      };
      newTokenList.push(nearTokenAmountData);

      for (const token of account?.tokens) {
        const tokenBalance = await fetchTokenBalance(
          token.address,
          token.decimals,
          account.accountId,
          viewFunctionExecute
        );

        newTokenList.push({
          token,
          amount: tokenBalance || undefined,
          usdRatio: undefined,
        });
      }

      setTokenList(newTokenList);
    };

    if (account && accountBalance && nearToUsdRatio) {
      formTokenList(account, accountBalance, nearToUsdRatio);
    } else {
      setTokenList([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, accountBalance, nearToUsdRatio]);

  const balanceSecondary = () => {
    return (
      <div className="dropdownStake">
        <button
          onClick={() => {
            setIsStakeDropdownVisible(!isStakeDropdownVisible);
            setIsBalanceDropdownVisible(true);
          }}
          className="btn"
          type="button"
        >
          <div className="name">
            <div>Staked </div>
            <Icon className="arrow" src={iconsObj.arrowGrey} />
          </div>
          <div>
            <div className="valueContainer">
              <Icon src={iconsObj.nearMenu} />
              <div className="value">
                {totalStaked ? formatTokenAmount(totalStaked) : 0} NEAR
              </div>
            </div>
            <div className="valueBalance">
              ≈ $
              {totalStaked && nearToUsdRatio
                ? formatUSDAmount(totalStaked * nearToUsdRatio)
                : 0}{" "}
              USD
            </div>
          </div>
        </button>
        <button
          onClick={() => {
            setIsStakeDropdownVisible(!isStakeDropdownVisible);
            setIsBalanceDropdownVisible(true);
          }}
          type="button"
          className="btn"
        >
          <div className="name">
            <div>Pending release</div>
          </div>
          <div>
            <div className="valueContainer">
              <Icon src={iconsObj.nearMenu} />
              <div className="value">
                {totalStakedPending ? formatTokenAmount(totalStakedPending) : 0}{" "}
                NEAR
              </div>
            </div>
            <div className="valueBalance">
              ≈ $
              {totalStakedPending && nearToUsdRatio
                ? formatUSDAmount(totalStakedPending * nearToUsdRatio)
                : 0}{" "}
              USD
            </div>
          </div>
        </button>
        <button
          onClick={() => {
            setIsStakeDropdownVisible(!isStakeDropdownVisible);
            setIsBalanceDropdownVisible(true);
          }}
          type="button"
          className="btn"
        >
          <div className="name">
            <div>Available for withdrawal</div>
          </div>
          <div>
            <div className="valueContainer">
              <Icon src={iconsObj.nearMenu} />
              <div className="value">
                {totalStakedAvailable
                  ? formatTokenAmount(totalStakedAvailable)
                  : 0}{" "}
                NEAR
              </div>
            </div>
            <div className="valueBalance">
              ≈ $
              {totalStakedAvailable && nearToUsdRatio
                ? formatUSDAmount(totalStakedAvailable * nearToUsdRatio)
                : 0}{" "}
              USD
            </div>
          </div>
        </button>
      </div>
    );
  };

  const totalBalance = () => {
    return (
      <div className="balanceMenu">
        <button
          onClick={() => {
            setIsBalanceDropdownVisible(!isBalanceDropdownVisible);
            setIsStakeDropdownVisible(true);
          }}
          type="button"
          className="btn"
        >
          <div className="name">
            <div>Total balance</div>
            <Icon className="arrow" src={iconsObj.arrowGrey} />
          </div>
          <div>
            <div className="valueContainer">
              <Icon src={iconsObj.nearMenu} />
              <div className="value">
                {accountBalance?.total
                  ? formatTokenAmount(accountBalance.total)
                  : 0}{" "}
                NEAR
              </div>
            </div>
            <div className="valueBalance">
              ≈ $
              {accountBalance?.total && nearToUsdRatio
                ? formatUSDAmount(accountBalance.total * nearToUsdRatio, 5)
                : 0}{" "}
              USD
            </div>
          </div>
        </button>
        <button
          onClick={() => {
            setIsBalanceDropdownVisible(!isBalanceDropdownVisible);
            setIsStakeDropdownVisible(true);
          }}
          type="button"
          className="btn"
        >
          <div className="name">Reserved for storage</div>
          <div>
            <div className="valueContainer">
              <Icon src={iconsObj.nearMenu} />
              <div className="value">
                {accountBalance?.stateStaked
                  ? formatTokenAmount(accountBalance.stateStaked)
                  : 0}{" "}
                NEAR
              </div>
            </div>
            <div className="valueBalance">
              ≈ $
              {accountBalance?.stateStaked && nearToUsdRatio
                ? formatUSDAmount(accountBalance.stateStaked * nearToUsdRatio)
                : 0}{" "}
              USD
            </div>
          </div>
        </button>
        <button
          onClick={() => {
            setIsBalanceDropdownVisible(!isBalanceDropdownVisible);
            setIsStakeDropdownVisible(true);
          }}
          type="button"
          className="btn"
        >
          <div className="name">
            <div>Reserved for transactions </div>
          </div>
          <div>
            <div className="valueContainer">
              <Icon src={iconsObj.nearMenu} />
              <div className="value">{RESERVED_FOR_TRANSACTION_FEES} NEAR</div>
            </div>
            <div className="valueBalance">
              ≈ $
              {nearToUsdRatio
                ? formatUSDAmount(
                    RESERVED_FOR_TRANSACTION_FEES * nearToUsdRatio
                  )
                : 0}{" "}
              USD
            </div>
          </div>
        </button>
      </div>
    );
  };

  return (
    <div className="balancePageContainer">
      <Header />
      <div className="body">
        <BalanceCard
          title="Available Balance"
          walletAddress={account?.accountId || ""}
          nearAmount={
            accountBalance?.available
              ? formatTokenAmount(accountBalance.available, 4)
              : 0
          }
          usdAmount={
            accountBalance?.available
              ? formatUSDAmount(accountBalance.available * nearToUsdRatio)
              : 0
          }
          isLoading={isLoadingAccountBalance || !account || !accountBalance}
        />
        {isBalanceDropdownVisible ? (
          <button
            onClick={() => {
              setIsBalanceDropdownVisible(!isBalanceDropdownVisible);
            }}
            type="button"
            className="btnBalance"
          >
            <div className="name">
              <div>Total balance</div>
              <Icon className="arrow" src={iconsObj.arrowGrey} />
            </div>
            <div className="valueContainer">
              {wrapValueElementWithSkeletonLoading(
                accountBalance?.total,
                <>
                  <Icon src={iconsObj.nearMenu} />
                  <div className="value">
                    {formatTokenAmount(accountBalance?.total)} NEAR
                  </div>{" "}
                </>
              )}
            </div>
          </button>
        ) : (
          totalBalance()
        )}
        {isStakeDropdownVisible ? (
          <button
            onClick={() => {
              setIsStakeDropdownVisible(!isStakeDropdownVisible);
            }}
            type="button"
            className={`btnBalanceSecondary ${
              !isBalanceDropdownVisible ? "visible" : ""
            }`}
          >
            <div className="name">
              <div>Staked</div>
              <Icon className="arrow" src={iconsObj.arrowGrey} />
            </div>
            <div className="valueContainer">
              {wrapValueElementWithSkeletonLoading(
                totalStaked,
                <>
                  <Icon src={iconsObj.nearMenu} />
                  <div className="value">
                    {totalStaked ? formatTokenAmount(totalStaked) : 0} NEAR
                  </div>
                </>
              )}
            </div>
          </button>
        ) : (
          balanceSecondary()
        )}
        <button
          onClick={() => goTo(SendPage)}
          className={`btnSend ${!isStakeDropdownVisible ? "visible" : ""}`}
          type="button"
        >
          <Icon src={iconsObj.arrowGroup} />
          <div>Send</div>
        </button>
        <NavFooter step={footerTab} setStep={setFooterTab} />
      </div>
      {footerTab === "tokens" ? (
        Array.isArray(tokenList) ? (
          <TokenList tokens={tokenList} />
        ) : (
          <div className="footerLoadingContainer">
            <Loading />
          </div>
        )
      ) : Array.isArray(nftCollections) ? (
        <NftCollectionsList nftCollections={nftCollections} />
      ) : (
        <div className="footerLoadingContainer">
          <Loading />
        </div>
      )}
    </div>
  );
};

export default BalancePage;
