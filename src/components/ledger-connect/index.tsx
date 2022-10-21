import { goTo } from "react-chrome-extension-router";
import { useNavigate } from "react-router-dom";
import { useLedger } from "../../hooks/useLedger";
import Header from "../header";
import HomePage from "../homePage";
import "./index.css";
import { getAccountIds } from "../../utils/account";
import { useAuth } from "../../hooks";
import { toPublicKey } from "../../utils/near";
import { AccountNeedsFundingPage } from "../accountNeedsFundingPage";
import { useState } from "react";
import iconsObj from "../../assets/icons";
import Icon from "../icon";

const getLedgerHdPath = (path: string) => `44'/397'/0'/0'/${path}'`;

type ConnectLedgerState = "connect" | "confirm" | "";

const LedgerConnect = () => {
  const { connect } = useLedger();
  const navigate = useNavigate();
  const { addAccount, accounts } = useAuth();
  const [path, setPath] = useState(1);
  const [{ step, error }, setState] = useState({
    error: "",
    step: "" as ConnectLedgerState,
    loading: false,
  });

  const onAfterConnect = () => {
    //TODO if(devMode)
    if (chrome.tabs) {
      navigate("/");
    } else {
      goTo(HomePage);
    }
  };

  const handleOnConnect = async () => {
    setState((state) => ({ ...state, step: "connect" }));
    connect(async () => {
      setState((state) => ({ ...state, step: "confirm" }));
      const hdpath = getLedgerHdPath(path.toString());

      const pkData: Buffer = await connect((client) =>
        client.getPublicKey(hdpath)
      );

      const implicitAccountId = Buffer.from(pkData).toString("hex");

      const publicKeyString = toPublicKey(pkData, true) as string;
      const ids = await getAccountIds(publicKeyString);

      const existingAccount = accounts.find(
        (acc) => acc.publicKey === publicKeyString
      );

      if (existingAccount) {
        //Account already in wallet
        onAfterConnect();
        return;
      }

      const newAccount = {
        accountId: implicitAccountId,
        tokens: [],
        publicKey: publicKeyString,
        encryptedPrivateKey: "",
        isLedger: true,
      };

      if (!ids.length) {
        //Account not funded
        console.log("Account Not Funded");
        goTo(AccountNeedsFundingPage, {
          account: newAccount,
        });

        return;
      }
      await addAccount(newAccount);

      onAfterConnect();
    }).catch((e) => {
      setState((state) => ({
        ...state,
        step: "",
        loading: false,
        error: e.message,
      }));
    });
  };

  const increment = () => {
    setPath(path + 1);
  };

  const decrement = () => {
    if (path > 0) {
      setPath(path - 1);
    }
  };

  return (
    <div className="unlockWalletPageContainer">
      <Header />
      <div className="body">
        <div className="title">Unlock your Wallet</div>
        <div className="secondaryTitle">
          Unlock your device & open NEAR App <br /> to connect Ledger
        </div>
        <div className="icon" />
        {step === "confirm" ? (
          <h1>Please confirm the operation on your device...</h1>
        ) : step === "connect" ? (
          <h1>Connect to your Ledger device.</h1>
        ) : (
          <>
            <div className="ledger-dropdown-content">
              <div className="desc">
                Specify an HD path to import its linked accounts.
              </div>
              <div className="path-wrapper">
                <div className="default-paths">44 / 397 / 0 / 0</div>
                <span>&ndash;</span>
                <div className="custom-path">
                  {path}
                  <div className="buttons-wrapper">
                    <div
                      className="arrow-btn increment"
                      role="button"
                      onClick={increment}
                    >
                      <Icon src={iconsObj.arrow} />
                    </div>
                    <div
                      className="arrow-btn decrement"
                      role="button"
                      onClick={decrement}
                    >
                      <Icon src={iconsObj.arrow} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="error-wrapper">{error}</div>
            <button type="button" className="connect" onClick={handleOnConnect}>
              Connect Ledger
            </button>
            <button type="button" className="cancel">
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default LedgerConnect;
