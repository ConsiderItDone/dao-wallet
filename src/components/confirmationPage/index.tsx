import Header from "../header";
import Icon from "../icon";
import iconsObj from "../../assets/icons";
import TransactionPage from "../transactionPage";

import "./index.css";
import { goBack, goTo } from "react-chrome-extension-router";
import { useAuth, useSendTransaction } from "../../hooks";
import { ClipLoader } from "react-spinners";
import { Token } from "../../services/chrome/localStorage";
import { EXPLORER_URL, NEAR_TOKEN } from "../../consts/near";
import { useState } from "react";

interface Props {
  receiver: string;
  token: Token;
  amount: number;
  usdRatio?: number;
}

const ConfirmationPage = ({ amount, token, receiver, usdRatio }: Props) => {
  const { currentAccount: account } = useAuth();
  const { execute, loading } = useSendTransaction(token);

  const [errorTransactionHash, setErrorTransactionHash] = useState<
    string | null
  >(null);

  const onSubmit = async () => {
    setErrorTransactionHash(null);

    const { data, error } = await execute({
      receiverId: receiver,
      amount: amount,
    });

    if (data) {
      // @ts-ignore
      const executeStatus: any = data?.status;
      // @ts-ignore
      const hash = data?.transaction?.hash;
      if (executeStatus.SuccessValue === null) {
        setErrorTransactionHash(`${EXPLORER_URL}/transactions/${hash}`);
      } else {
        goTo(TransactionPage, {
          amount,
          receiver,
          tokenSymbol: token.symbol,
          //@ts-ignore
          hash,
        });
      }
    }
    if (error) {
      console.log("Error sending tx:", error);
    }
  };

  const fee = 0.00005;
  const total = amount + fee;

  const toUsdAmount = (amount: number) => {
    return usdRatio ? `< $${usdRatio * amount}USD` : "";
  };

  return (
    <div className="confirmationPageContainer">
      <Header />
      <div className="body">
        <div className="title">Confirmation</div>
        <div className="secondaryTitle">You are sending</div>
        <div className="valueTitle">
          {amount} {token.name}
        </div>
        <Icon className="iconsGroup" src={iconsObj.arrowDownGroup} />
        <div className="recipientContainer">
          <div className="title">From</div>
          <div className="value">{account?.accountId}</div>
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
                <Icon src={token.icon} />
                {token.symbol}
              </div>
            </div>
          </div>
          <div>
            <div className="title">Estimated fees</div>
            <div className="value">
              <div className="valueTitle">
                <Icon src={NEAR_TOKEN.icon} />
                {fee}
                {NEAR_TOKEN.symbol}
              </div>
              <div className="valueSecondaryTitle">{toUsdAmount(fee)}</div>
            </div>
          </div>
          <div>
            <div className="title">Estimated total</div>
            <div className="value">
              <div className="valueTitle">
                <Icon src={NEAR_TOKEN.icon} />
                {total}
                {NEAR_TOKEN.symbol}
              </div>
              <div className="valueSecondaryTitle">{toUsdAmount(total)}</div>
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
        <button
          onClick={() => goBack()}
          disabled={loading}
          className="btnCancel"
          type="button"
        >
          Cancel
        </button>
        {errorTransactionHash && (
          <div className="transactionError">
            <div className="label">Transaction Failed:</div>
            <a href={errorTransactionHash}>View Transaction</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmationPage;
