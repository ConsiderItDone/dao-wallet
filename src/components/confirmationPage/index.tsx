import React from "react";
import Header from "../header";
import Icon from "../icon";
import iconsObj from "../../assets/icons";
import TransactionPage from "../transactionPage";

import "./index.css";
import { goBack, goTo } from "react-chrome-extension-router";
import { NEAR_TOKEN } from "../../consts/near";
import { useQuery } from "../../hooks";
import { ClipLoader } from "react-spinners";

interface Props {
  receiver: string;
  asset: string;
  amount: number;
}

const formatNearAmount = (amount: number | string): string => {
  const value = amount.toString();

  const [int, decimals] = value.includes(".")
    ? value.split(".")
    : value.split(",");

  let result = int.replaceAll("0", "");

  const decimalValue = (decimals || "").padEnd(NEAR_TOKEN.decimals, "0");

  result = result.concat(decimalValue);

  return result;
};

const ConfirmationPage = ({ amount, asset, receiver }: Props) => {
  const accountId = "polydev.testnet";

  const [execute, { loading }] = useQuery("sendMoney");

  const nearAmount = amount;
  const onSubmit = () => {
    execute({
      signerId: accountId,
      receiverId: receiver,
      amount: formatNearAmount(amount),
    }).then(({ data, error }) => {
      data && console.log("data", data);
      error && console.log("error", error);

      if (data) {
        goTo(TransactionPage, {
          amount,
          receiver,
          //@ts-ignore
          hash: data?.transaction?.hash,
        });
      }
    });
  };

  return (
    <div className="confirmationPageContainer">
      <Header />
      <div className="body">
        <div className="title">Confirmation</div>
        <div className="secondaryTitle">You are sending</div>
        <div className="valueTitle">{nearAmount} NEAR</div>
        <Icon className="iconsGroup" src={iconsObj.arrowDownGroup} />
        <div className="recipientContainer">
          <div className="title">From</div>
          <div className="value">{accountId}</div>
        </div>
        <div className="adddressContainer">
          <div className="title">To</div>
          <div className="value">{receiver}</div>
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
                NEAR 0.00005 NEAR
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
          onClick={onSubmit}
          disabled={loading}
          className="btnSend"
          type="button"
        >
          {!loading ? (
            "Confirm & Send"
          ) : (
            <div className="clipLoaderContainer">
              <ClipLoader color="#9896F0" size={16} />
            </div>
          )}
        </button>
        <button onClick={() => goBack()} className="btnCancel" type="button">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ConfirmationPage;
