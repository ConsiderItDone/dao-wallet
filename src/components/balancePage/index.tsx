import React, { useState } from "react";
import NavFooter from "../navFooter";
import Header from "../header";
import BalanceCard from "../balanceCard";
import Icon from "../icon";
import iconsObj from "../../assets/icons";
import "./index.css";
import SendPage from "../sendPage";
import { goTo } from "react-chrome-extension-router";
import { useAuth } from "../../hooks";
import { NEAR_RESERVED_FOR_TRANSACTION_FEES } from "../../consts/near";
import { NftCollectionsList } from "../nftList";
import { TokenList } from "../tokenList";
import { useAccountStakingData } from "../../hooks/useAccountStakingData";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useAccountNftCollections } from "../../hooks/useAccountNftCollections";
import { Loading } from "../animations/loading";
import { useAccountTokens } from "../../hooks/useAccountTokens";
import { useNearToUsdRatio } from "../../hooks/useNearToUsdRatio";
import { useAccountNearBalance } from "../../hooks/useAccountNearBalance";
import { toFixedBottom } from "../../utils/common";

const formatTokenAmount = (
  amount: number | null | undefined,
  fractionDigits: number = 5
) => {
  if (!amount) return 0;
  return Number(toFixedBottom(amount, fractionDigits));
};

const formatUSDAmount = (
  amount: number | null | undefined,
  fractionDigits: number = 2
) => {
  if (!amount) return 0;
  return Number(toFixedBottom(amount, fractionDigits));
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

  const { currentAccount: account } = useAuth();

  const { accountNearBalance, isLoadingAccountBalance } = useAccountNearBalance(
    account?.accountId
  );
  const nearToUsdRatio = useNearToUsdRatio();
  const {
    totalStaked,
    totalPending: totalStakedPending,
    totalAvailable: totalStakedAvailable,
  } = useAccountStakingData(account?.accountId);

  const fungibleTokensList = useAccountTokens(
    account?.accountId,
    accountNearBalance?.available
  );
  const nftCollections = useAccountNftCollections(account?.accountId);

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
                {accountNearBalance?.total
                  ? formatTokenAmount(accountNearBalance.total)
                  : 0}{" "}
                NEAR
              </div>
            </div>
            <div className="valueBalance">
              ≈ $
              {accountNearBalance?.total && nearToUsdRatio
                ? formatUSDAmount(accountNearBalance.total * nearToUsdRatio, 5)
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
                {accountNearBalance?.stateStaked
                  ? formatTokenAmount(accountNearBalance.stateStaked)
                  : 0}{" "}
                NEAR
              </div>
            </div>
            <div className="valueBalance">
              ≈ $
              {accountNearBalance?.stateStaked && nearToUsdRatio
                ? formatUSDAmount(
                    accountNearBalance.stateStaked * nearToUsdRatio
                  )
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
              <div className="value">
                {NEAR_RESERVED_FOR_TRANSACTION_FEES} NEAR
              </div>
            </div>
            <div className="valueBalance">
              ≈ $
              {nearToUsdRatio
                ? formatUSDAmount(
                    NEAR_RESERVED_FOR_TRANSACTION_FEES * nearToUsdRatio
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
            accountNearBalance?.available
              ? formatTokenAmount(accountNearBalance.available, 4)
              : 0
          }
          usdAmount={
            accountNearBalance?.available && nearToUsdRatio
              ? formatUSDAmount(accountNearBalance.available * nearToUsdRatio)
              : 0
          }
          isLoading={isLoadingAccountBalance || !account || !accountNearBalance}
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
                accountNearBalance?.total,
                <>
                  <Icon src={iconsObj.nearMenu} />
                  <div className="value">
                    {formatTokenAmount(accountNearBalance?.total)} NEAR
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
        Array.isArray(fungibleTokensList) ? (
          <TokenList tokens={fungibleTokensList} />
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
