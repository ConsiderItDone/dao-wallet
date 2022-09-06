import React, { useEffect, useState } from "react";
import NavFooter from "../navFooter";
import Footer from "../footer";
import Header from "../header";
import BalanceCard from "../balanceCard";
import Icon from "../icon";
import iconsObj from "../../assets/icons";
import "./index.css";
import SendPage from "../sendPage";
import { goTo } from "react-chrome-extension-router";
import {
  LocalStorage,
  LocalStorageAccount,
} from "../../services/chrome/localStorage";
import { SessionStorage } from "../../services/chrome/sessionStorage";
import HomePage from "../homePage";

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

  const [localStorage] = useState<LocalStorage>(new LocalStorage());
  const [sessionStorage] = useState<SessionStorage>(new SessionStorage());
  const [account, setAccount] = useState<LocalStorageAccount | null>(null);

  useEffect(() => {
    const setCurrentAccount = async () => {
      const currentAccount = await localStorage.getCurrentAccount();
      if (!currentAccount) {
        console.error(
          "[BalancePageSetCurrentAccount]: failed to get current account"
        );
        goTo(HomePage);
        return;
      }

      setAccount(currentAccount);
    };

    setCurrentAccount();
  }, [localStorage, sessionStorage]);

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
              <div className="value">0 NEAR</div>
            </div>
            <div className="valueBalance">≈ $0 USD</div>
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
              name: "Total ballance",
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
            <div>Total ballance </div>
            <Icon className="arrow" src={iconsObj.arrowGrey} />
          </div>
          <div>
            <div className="valueContainer">
              <Icon src={iconsObj.nearMenu} />
              <div className="value">0.93245 NEAR</div>
            </div>
            <div className="valueBalance">≈ $7.9872 USD</div>
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
              <div className="value">0.12 NEAR</div>
            </div>
            <div className="valueBalance">≈ $8.9208 USD</div>
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
              <div className="value">0.93245 NEAR</div>
            </div>
            <div className="valueBalance">≈ $0.3302 USD</div>
          </div>
        </button>
      </div>
    );
  };

  return (
    <div className="balancePageContainer">
      <Header />
      <div className="body">
        <BalanceCard title="Available Balance" />
        {totalBalanceVisible ? (
          <button
            onClick={() => {
              setTotalBalanceVisible(!totalBalanceVisible);
              setTotalBalanceValue({
                name: "Total ballance",
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
              <div className="value">{totalBalanceValue.value}</div>
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
      <Footer />
    </div>
  );
};

export default BalancePage;
