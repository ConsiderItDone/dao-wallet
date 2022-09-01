import React from "react";
import path from "path";
import iconsObj from "../../assets/icons";
import Header from "../header";
import Icon from "../icon";
import "./index.css";
import { useQuery } from "../../hooks";
import { usePolywrapClient } from "@polywrap/react";

const wrapperPath = path.join(__dirname, "wrapper");

const fsPath = `${wrapperPath}`;

const fsUri = `fs/${fsPath}`;

const TrasactionPage = () => {
  const [execute, { data, loading, error }] = useQuery<string>("getBlock");
  const client = usePolywrapClient();

  const handleOnClick = async () => {
    execute({ blockQuery: { finality: "final" } }).then((res) => {
      console.log(res);
      //alert("Check your console");
    });
    //const resolved = await client.resolveUri(fsUri);

    /* console.log("path", path);
    console.log("uri", fsUri);
    console.log("resolved", resolved); */
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
