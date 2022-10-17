import Header from "../header";
import Icon from "../icon";
import iconsObj from "../../assets/icons";
import TransactionPage from "../transactionPage";

import "./index.css";
import { goBack, goTo } from "react-chrome-extension-router";
import { useAuth, useSendTransaction } from "../../hooks";
import { ClipLoader } from "react-spinners";
import { Token } from "../../services/chrome/localStorage";

interface Props {
  receiver: string;
  token: Token;
  amount: number;
}

const ConfirmationPage = ({ amount, token, receiver }: Props) => {
  const { currentAccount: account } = useAuth();

  const { execute, loading } = useSendTransaction(account?.accountId!);

  const onSubmit = async () => {
    const { data, error } = await execute({ receiverId: "", amount: amount });

    if (data) {
      goTo(TransactionPage, {
        amount,
        receiver,
        //@ts-ignore
        hash: data?.transaction?.hash,
      });
    }
    if (error) {
      console.log("Error sending tx:", error);
    }
  };

  const fee = 0.00005;
  const total = amount + fee;

  const toUsdAmount = (amount: number) => {
    //TODO get usdRatio
    const ratio = token.decimals;
    return `< $${ratio * amount}USD`;
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
                <Icon src={token.icon} />
                {fee}
                {token.symbol}
              </div>
              <div className="valueSecondaryTitle">{toUsdAmount(fee)}</div>
            </div>
          </div>
          <div>
            <div className="title">Estimated total</div>
            <div className="value">
              <div className="valueTitle">
                <Icon src={token.icon} />
                {total}
                {token.symbol}
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
        <button onClick={() => goBack()} className="btnCancel" type="button">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ConfirmationPage;
