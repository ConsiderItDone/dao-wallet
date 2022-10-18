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
import { NftList } from "../nftList";
import { TokenAmountData, TokenList } from "../tokenList";
import { fetchTokenBalance, TokenMetadata } from "../../utils/fungibleTokens";
import { VIEW_FUNCTION_METHOD_NAME } from "../../consts/wrapper";
import { useStakingData } from "../../hooks/useStakingData";
import { parseNearTokenAmount } from "../../utils/near";

const RESERVED_FOR_TRANSACTION_FEES = 0.05;

export const ACCOUNT_BALANCE_METHOD_NAME = "getAccountBalance";

const formatTokenAmount = (amount: number, fractionDigits: number = 5) => {
  return Number(amount.toFixed(fractionDigits));
};

const formatUSDAmount = (amount: number, fractionDigits: number = 2) => {
  return Number(amount.toFixed(fractionDigits));
};

export interface AccountBalance {
  available: number;
  staked: number;
  stateStaked: number;
  total: number;
}

const BalancePage = () => {
  const [step, setStep] = useState("tokens");
  const [totalBalanceVisible, setTotalBalanceVisible] = useState(true);
  const [totalBalanceValue, setTotalBalanceValue] = useState({
    name: "Total balance",
    value: "0.93245 NEAR",
    balance: "",
  });
  const [stakeVisible, setStakeVisible] = useState(true);
  const [stakeValue, setStakeValue] = useState({
    name: "Staked",
    value: "0 NEAR",
    balance: "",
  });

  const [execute, { loading: isLoadingAccountBalance }] =
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

  useEffect(() => {
    if (account?.accountId) {
      execute({ accountId: account?.accountId })
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, accountBalance, nearToUsdRatio]);

  const balanceSecondary = () => {
    return (
      <div className="dropdownStake">
        <button
          onClick={() => {
            setStakeValue({
              name: "Staked",
              value: "0 NEAR",
              balance: "= $0 USD",
            });
            setStakeVisible(!stakeVisible);
            setTotalBalanceVisible(true);
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
            setStakeValue({
              name: "Pending release",
              value: "0 NEAR",
              balance: "≈ $7.9872 USD",
            });
            setStakeVisible(!stakeVisible);
            setTotalBalanceVisible(true);
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
            setStakeValue({
              name: "Reserved for transactions",
              value: "0 NEAR",
              balance: "≈ $7.9872 USD",
            });
            setStakeVisible(!stakeVisible);
            setTotalBalanceVisible(true);
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
            setTotalBalanceValue({
              name: "Total balance",
              value: "0.93245 NEA",
              balance: "≈ $7.9872 USD",
            });
            setTotalBalanceVisible(!totalBalanceVisible);
            setStakeVisible(true);
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
            setTotalBalanceValue({
              name: "Reserved for storage",
              value: "0.12 NEAR",
              balance: "≈ $8.9208 USD",
            });
            setTotalBalanceVisible(!totalBalanceVisible);
            setStakeVisible(true);
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
            setTotalBalanceValue({
              name: "Reserved for transactions ",
              value: "0.93245 NEA",
              balance: "≈ $0.3302 USD",
            });
            setTotalBalanceVisible(!totalBalanceVisible);
            setStakeVisible(true);
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
        {totalBalanceVisible ? (
          <button
            onClick={() => {
              setTotalBalanceVisible(!totalBalanceVisible);
              setTotalBalanceValue({
                name: "Total balance",
                value: "0.93245 NEAR",
                balance: "≈ $7.9872 USD",
              });
            }}
            type="button"
            className="btnBalance"
          >
            <div className="name">
              <div>{totalBalanceValue.name}</div>
              <Icon className="arrow" src={iconsObj.arrowGrey} />
            </div>
            <div className="valueContainer">
              <Icon src={iconsObj.nearMenu} />
              <div className="value">
                {accountBalance?.total
                  ? formatTokenAmount(accountBalance.total)
                  : 0}{" "}
                NEAR
              </div>
            </div>
            {!!totalBalanceValue.balance && !totalBalanceVisible && (
              <div className="valueBalance">{totalBalanceValue.balance}</div>
            )}
          </button>
        ) : (
          totalBalance()
        )}
        {stakeVisible ? (
          <button
            onClick={() => {
              setStakeVisible(!stakeVisible);
              setStakeValue({
                name: "Staked",
                value: "0 NEAR",
                balance: "$0 USD",
              });
            }}
            type="button"
            className={`btnBalanceSecondary ${
              !totalBalanceVisible ? "visible" : ""
            }`}
          >
            <div className="name">
              <div>{stakeValue.name}</div>
              <Icon className="arrow" src={iconsObj.arrowGrey} />
            </div>
            <div className="valueContainer">
              <Icon src={iconsObj.nearMenu} />
              <div className="value">
                {totalStaked ? formatTokenAmount(totalStaked) : 0} NEAR
              </div>
            </div>
          </button>
        ) : (
          balanceSecondary()
        )}
        <button
          onClick={() => goTo(SendPage)}
          className={`btnSend ${!stakeVisible ? "visible" : ""}`}
          type="button"
        >
          <Icon src={iconsObj.arrowGroup} />
          <div>Send</div>
        </button>
        <NavFooter step={step} setStep={setStep} />
      </div>
      {step === "tokens" ? (
        <TokenList tokens={tokenList || []} />
      ) : (
        <NftList nfts={[]} />
      )}
    </div>
  );
};

export default BalancePage;
