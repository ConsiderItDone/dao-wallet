import base58 from "bs58";
import { goTo } from "react-chrome-extension-router";
import { useNavigate } from "react-router-dom";
import { useLedger } from "../../hooks/useLedger";
import { LocalStorage } from "../../services/chrome/localStorage";
import Header from "../header";
import HomePage from "../homePage";
import "./index.css";
import { getAccountIds } from "../../utils/account";

const LedgerConnect = () => {
  const { connect } = useLedger();
  const navigate = useNavigate();

  const onAfterConnect = () => {
    console.log("onAfterConnect");
    //TODO if(devMode)
    if (chrome.tabs) {
      navigate("/");
    } else {
      goTo(HomePage);
    }
  };

  const handleOnConnect = async () => {
    connect(async () => {
      const pkData = await connect((client) => client.getPublicKey());

      const implicitAccountId = Buffer.from(pkData).toString("hex");
      console.log("implicitAccountId", implicitAccountId);
      //const { accountId, privateKey } = createNewWallet(implicitAccountId);
      //TODO
      const ids = await getAccountIds(base58.encode(pkData));
      console.log("pk accounts", ids);

      try {
        await new LocalStorage().addAccount({
          accountId: implicitAccountId,
          encryptedPrivateKey: "",
          tokens: [],
        });
      } catch (e) {
        console.log("[Try to add ledger acc to localStorage]:", e);
      }
      onAfterConnect();
    });
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
        <button type="button" className="connect" onClick={handleOnConnect}>
          Connect Ledger
        </button>
        <button type="button" className="cancel">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default LedgerConnect;
