import React, { useEffect, useState } from "react";
import NavFooter from "../navFooter";
import Header from "../header";
import BalanceCard from "../balanceCard";
import Icon from "../icon";
import iconsObj from "../../assets/icons";
import "./index.css";
import SendPage from "../sendPage";
import { goTo } from "react-chrome-extension-router";
import { WalletAccount } from "../../services/chrome/localStorage";
import { useQuery } from "../../hooks";
import { getNearToUSDRatio } from "../../services/coingecko/api";
import { bignumberToNumber } from "../../utils/bignumber";
import { ethers } from "ethers";
import { NEAR_TOKEN_DECIMALS_AMOUNT } from "../../consts/near";
import { useAccount } from "../../hooks/useAccount";
import { NftList } from "../nftList";
import { Token, TokenList } from "../tokenList";

const RESERVED_FOR_TRANSACTION_FEES = 0.05;

const ACCOUNT_BALANCE_METHOD_NAME = "getAccountBalance";

interface AccountBalance {
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

  const account: WalletAccount | null = useAccount();

  const [accountBalance, setAccountBalance] = useState<AccountBalance | null>(
    null
  );
  const [nearToUsdRatio, setNearToUsdRatio] = useState<number>(0);

  const [tokenList, setTokenList] = useState<Token[] | null>(null);

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
                bignumberToNumber(
                  ethers.BigNumber.from(data?.available),
                  NEAR_TOKEN_DECIMALS_AMOUNT
                ) - RESERVED_FOR_TRANSACTION_FEES,
              staked: bignumberToNumber(
                ethers.BigNumber.from(data?.staked),
                NEAR_TOKEN_DECIMALS_AMOUNT
              ),
              stateStaked: bignumberToNumber(
                ethers.BigNumber.from(data?.stateStaked),
                NEAR_TOKEN_DECIMALS_AMOUNT
              ),
              total: bignumberToNumber(
                ethers.BigNumber.from(data?.total),
                NEAR_TOKEN_DECIMALS_AMOUNT
              ),
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
    if (accountBalance && nearToUsdRatio) {
      const newTokenList: Token[] = [];

      const nearToken: Token = {
        symbol: "NEAR",
        amount: accountBalance.available,
        icon: iconsObj.nearMenu,
        usdRatio: nearToUsdRatio,
      };
      newTokenList.push(nearToken);

      const wrappedNearToken: Token = {
        symbol: "wNEAR",
        amount: 15,
        icon: iconsObj.wrappedNearTokenIcon,
        usdRatio: nearToUsdRatio,
      };
      newTokenList.push(wrappedNearToken);

      setTokenList(newTokenList);
    }
  }, [accountBalance, nearToUsdRatio]);

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
                {accountBalance?.staked ? accountBalance.staked.toFixed(5) : 0}{" "}
                NEAR
              </div>
            </div>
            <div className="valueBalance">
              ≈ $
              {accountBalance?.staked && nearToUsdRatio
                ? (accountBalance.staked * nearToUsdRatio).toFixed(5)
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
            <div>Pending release </div>
          </div>
          <div>
            <div className="valueContainer">
              <Icon src={iconsObj.nearMenu} />
              <div className="value">0 NEAR</div>
            </div>
            <div className="valueBalance">≈ $0 USD</div>
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
            <div>Reserved for transactions</div>
          </div>
          <div>
            <div className="valueContainer">
              <Icon src={iconsObj.nearMenu} />
              <div className="value">0 NEAR</div>
            </div>
            <div className="valueBalance">≈ $0 USD</div>
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
            <div>Total balance </div>
            <Icon className="arrow" src={iconsObj.arrowGrey} />
          </div>
          <div>
            <div className="valueContainer">
              <Icon src={iconsObj.nearMenu} />
              <div className="value">
                {accountBalance?.total ? accountBalance.total.toFixed(5) : 0}{" "}
                NEAR
              </div>
            </div>
            <div className="valueBalance">
              ≈ $
              {accountBalance?.total && nearToUsdRatio
                ? (accountBalance.total * nearToUsdRatio).toFixed(5)
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
          <div className="name">
            Reserved for storage<div></div>
          </div>
          <div>
            <div className="valueContainer">
              <Icon src={iconsObj.nearMenu} />
              <div className="value">
                {accountBalance?.stateStaked
                  ? accountBalance.stateStaked.toFixed(5)
                  : 0}{" "}
                NEAR
              </div>
            </div>
            <div className="valueBalance">
              ≈ $
              {accountBalance?.stateStaked && nearToUsdRatio
                ? (accountBalance.stateStaked * nearToUsdRatio).toFixed(2)
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
                ? (RESERVED_FOR_TRANSACTION_FEES * nearToUsdRatio).toFixed(2)
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
            accountBalance?.available ? accountBalance.available.toFixed(4) : 0
          }
          usdAmount={
            accountBalance?.available
              ? (accountBalance.available * nearToUsdRatio).toFixed(2)
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
                {accountBalance?.total ? accountBalance.total.toFixed(5) : 0}{" "}
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
              <div className="value">{stakeValue.value}</div>
            </div>
            {!!stakeValue?.balance && !stakeVisible && (
              <div className="valueBalance">{stakeValue?.balance}</div>
            )}
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
