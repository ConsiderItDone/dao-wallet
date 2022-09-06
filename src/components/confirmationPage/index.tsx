import React from "react";
import Header from "../header";
import Icon from "../icon";
import iconsObj from "../../assets/icons";
import TransactionPage from "../transactionPage";

import "./index.css";
import { goBack, goTo } from "react-chrome-extension-router";

const ConfirmationPage = () => {
  return (
    <div className="confirmationPageContainer">
      <Header />
      <div className="body">
        <div className="title">Confirmation</div>
        <div className="secondaryTitle">You are sending</div>
        <div className="valueTitle">0.83 NEAR</div>
        <Icon className="iconsGroup" src={iconsObj.arrowDownGroup} />
        <div className="recipientContainer">
          <div className="title">From</div>
          <div className="value">
            df4d127066e5716ebf9970cecb0bb444d
            <br />
            e72a5ccbbaca40562bbeb4a68472920
          </div>
        </div>
        <div className="adddressContainer">
          <div className="title">To</div>
          <div className="value">accomplice.poolv1.near</div>
        </div>
        <div className="assetContainer">
          <div style={{ height: "16px", marginBottom: "12px" }}>
            <div className="title">Asset</div>
            <div className="value">
              <div className="valueTitle">
                <Icon src={iconsObj.nearMenu} />
                NEAR
              </div>
            </div>
          </div>
          <div>
            <div className="title">Estimated fees</div>
            <div className="value">
              <div className="valueTitle">
                <Icon src={iconsObj.nearMenu} />
                0.00005 NEAR
              </div>
              <div className="valueSecondaryTitle">{`${"< $0.01 USD"}`}</div>
            </div>
          </div>
          <div>
            <div className="title">Estimated total</div>
            <div className="value">
              <div className="valueTitle">
                <Icon src={iconsObj.nearMenu} />
                0.00105 NEAR
              </div>
              <div className="valueSecondaryTitle">{`${"< $0.01 USD"}`}</div>
            </div>
          </div>
        </div>
        <button
          onClick={() => goTo(TransactionPage)}
          className="btnSend"
          type="button"
        >
          Confirm & Send
        </button>
        <button onClick={() => goBack()} className="btnCancel" type="button">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ConfirmationPage;
