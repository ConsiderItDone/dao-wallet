import React from "react";
import path from "path";
import iconsObj from "../../assets/icons";
import Header from "../header";
import Icon from "../icon";
import "./index.css";
import { useQuery } from "../../hooks";

const TrasactionPage = () => {
  const [execute, { data, loading, error }] = useQuery<string>("getBlock");

  const handleOnClick = async () => {
    execute({ blockQuery: { finality: "final" } }).then(console.log);
  };

  return (
    <div className="transactionPageContainer">
      <Header />
      <div className="body">
        <Icon src={iconsObj.transactionIcon} className="icon" />
        <div className="title">Transaction Complete !</div>
        <div className="secondaryTitle">You sent</div>
        <div className="near">0.83 NEAR</div>
        <div className="recipient"> accomplice.poolv1.near</div>
        <button className="btnContinue">Continue</button>
        <button className="btnContinue" onClick={handleOnClick}>
          {loading ? "Loading..." : "Polywrap"}
        </button>
      </div>
    </div>
  );
};

export default TrasactionPage;
