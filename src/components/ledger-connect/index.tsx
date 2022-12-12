import { goBack, goTo } from "react-chrome-extension-router";
import { useNavigate } from "react-router-dom";
import { useLedger } from "../../hooks/useLedger";
import Header from "../header";
import HomePage from "../homePage";
import "./index.css";
import { useAuth, useFetchJson } from "../../hooks";
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

  const getAccountIds = useFetchJson("accountsAtPublicKey");

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
      const ids = await getAccountIds<string[]>({ publicKeyString });

      if (!ids) {
        //TODO add error display, reset page state
        console.log("Error getting accounts");
      }

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

      if (!ids || !ids.length) {
        //Account not funded
        console.log("Account Not Funded");
        if (chrome.tabs) {
          navigate("/");
        }
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

  const handleRetry = () => {
    setState((state) => ({
      ...state,
      error: "",
      step: "",
      loading: false,
    }));
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
        <div className="title">
          {error ? (
            "Connection Error"
          ) : step === "" ? (
            "Authorize Wallet"
          ) : (
            <>
              Connect to your <br /> Ledger device
            </>
          )}
        </div>
        <div className="secondaryTitle">
          {error ? (
            error
          ) : step === "" ? (
            <>
              Unlock your device & open NEAR App <br /> to connect Ledger
            </>
          ) : step === "connect" ? (
            <>
              Make sure your Ledger is connected securely, and <br /> that the
              NEAR app is open on your device.
            </>
          ) : (
            <>Please confirm the operation on your device...</>
          )}
        </div>
        <div className={`iconWrapper ${error ? "errorIconWrapper" : ""}`}>
          <img
            src={error ? iconsObj.errorIcon : iconsObj.unlockIcon}
            alt=""
            className="icon"
          />
        </div>
        {step === "" ? (
          <>
            {!error ? (
              <div className="ledger-dropdown-content">
                <div className="desc">
                  Specify an HD path to import <br /> its linked accounts.
                </div>
                <div className="path-wrapper">
                  <div className="default-paths">44 / 397 / 0 / 0</div>
                  <span>&ndash;</span>
                  <div className="custom-path">
                    <span className="path-value">{path}</span>
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
            ) : null}
            {error ? (
              <button type="button" className="btn retry" onClick={handleRetry}>
                Retry
              </button>
            ) : (
              <button
                type="button"
                className="btn connect"
                onClick={handleOnConnect}
              >
                Authorize
              </button>
            )}
            <button
              type="button"
              className="btn cancel"
              onClick={() => goBack()}
            >
              Cancel
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default LedgerConnect;
