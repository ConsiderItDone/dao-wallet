import React from "react";
import "./index.css";

const NavFooter = ({ step, setStep }: any) => {
  return (
    <div className="navFooterWrapper">
      <div className="btnConteiner">
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
      </div>
    </div>
  );
};

export default NavFooter;
