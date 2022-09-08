import React, { useState } from "react";
import { ReactComponent as ArrowIcon } from "../../images/arrow.svg";
import { ReactComponent as ArrowGroupIcon } from "../../images/arrowGroup.svg";
import { goTo } from "react-chrome-extension-router";
import SendPage from "../sendPage";
import NavFooter from "../navFooter";
import Footer from "../footer";
import Header from "../header";
import BalanceCard from "../balanceCard";
import "./index.css";

const balance = [
  { title: "Available balance", value: "0.83 NEAR" },
  { title: "Staked", value: "0 NEAR" },
];

const Info = () => {
  const [step, setStep] = useState("tokens");

  return (
    <div className="infoContainer">
      <Header />
      <div className="body">
        <BalanceCard
          title="Available Balance"
          walletAddress="polydev.testnet"
          nearAmount={0.93245}
          usdAmount={6.9208}
        />
        <div className="cardContainer">
          {balance?.map((el) => {
            return (
              <div className="card">
                <div className="valueContainer">
                  <div>{el?.title}</div>
                  <div className="value">
                    <div className="near"></div>
                    {el?.value}
                  </div>
                </div>
                <button className="btn">
                  <ArrowIcon />
                </button>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => {
            goTo(SendPage);
          }}
          className="btnSend"
        >
          <ArrowGroupIcon className="arrowGroup" />
          Send
        </button>
        <NavFooter step={step} setStep={setStep} />
      </div>
      <Footer />
    </div>
  );
};

export default Info;
