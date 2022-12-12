import React from "react";
import "./index.css";
import { BalancePageFooterTab } from "../balancePage";

interface Props {
  step: BalancePageFooterTab;
  setStep: React.Dispatch<React.SetStateAction<BalancePageFooterTab>>;
}

const NavFooter = ({ step, setStep }: Props) => {
  return (
    <div className="navFooterWrapper">
      <div className="btnContainer">
        <button
          onClick={() => setStep("tokens")}
          className={step === "tokens" ? "active" : ""}
        >
          Tokens
        </button>
        <button
          onClick={() => setStep("NFT")}
          className={step === "NFT" ? "active" : ""}
        >
          NFT
        </button>
        <button
          onClick={() => setStep("activity")}
          className={step === "activity" ? "active" : ""}
        >
          Activity
        </button>
      </div>
    </div>
  );
};

export default NavFooter;
