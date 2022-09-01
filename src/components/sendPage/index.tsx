import React, { useState } from "react";
import Header from "../header";
import { ReactComponent as ArrowIcon } from "../../images/arrow.svg";
import iconsObj from "../../assets/icons";
import Icon from "../icon";
import "./index.css";

const menu = [
  { title: "TokenA", icon: iconsObj.nearMenu, value: "0.001 TKN1" },
  { title: "Near", icon: iconsObj.tokenA, value: "0.93559 NEAR" },
];

const Info = () => {
  const [step, setStep] = useState(1);
  const [visible, setVisible] = useState(false);
  const [assets, setAssets] = useState("Select asset ");
  const [amount, setAmount] = useState(0);
  const [success, setSuccess] = useState(false);
  const [recipient, setRecipient] = useState("");

  const submit = () => {
    if (!!recipient && !!amount && !!assets) {
      setSuccess(true);
    }
  };

  const menuClass = !visible ? "menu visible" : "visible";
  return (
    <div className="sendPageContainer">
      <Header />
      <div className="body">
        <div className="title">Send</div>
        <form>
          <div className="dropDownContainer">
            <button
              type="button"
              onClick={() => setVisible(!visible)}
              className={`btn ${visible ? "bg" : ""}`}
            >
              {assets}
              <ArrowIcon className="arrow" />
            </button>
            <div className={menuClass}>
              <div>
                {menu?.map((el, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setAssets(el?.title);
                      setVisible(!visible);
                    }}
                    className="btnVisible"
                    type="button"
                  >
                    <div className="iconMenu">
                      {<Icon className="icon" src={el?.icon} />}
                      <div>{el?.title}</div>
                    </div>
                    <div className="value">{el?.value}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="balanceBox">
              <div className="title">Balance</div>
              <div className="value">0</div>
            </div>
          </div>
          <div className="amountContainer">
            {!!amount && <div className="visibleAmount">Amount</div>}
            <input
              onChange={(e) => setAmount(e?.target?.valueAsNumber)}
              placeholder="Amount"
              className="amount"
              type="number"
            />
            {success && <span className="value">≈ $6.9208 USD</span>}
            <button disabled type="button" className="btnMax">
              Max
            </button>
          </div>
          <div className="toContainer">
            {recipient !== "" && <div className="visibleAmount">To</div>}
            <input
              onChange={(e) => setRecipient(e?.target?.value)}
              className="to"
              placeholder="To"
            />
            {success && <Icon src={iconsObj.success} className="successIcon" />}
          </div>
          <button onClick={submit} type="button" className="btnSubmit">
            Submit
          </button>
        </form>
        <button type="button" className="btnCancel">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Info;
