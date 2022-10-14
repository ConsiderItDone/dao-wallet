import Header from "../header";
import Icon from "../icon";
import iconsObj from "../../assets/icons";
import TransactionPage from "../transactionPage";

import "./index.css";
import { goBack, goTo } from "react-chrome-extension-router";
import { useAuth, useSendTransaction } from "../../hooks";
import { ClipLoader } from "react-spinners";

interface Props {
  receiver: string;
  asset: string;
  amount: number;
}

const ConfirmationPage = ({ amount, asset, receiver }: Props) => {
  const { currentAccount: account } = useAuth();
  const nearAmount = amount;

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
