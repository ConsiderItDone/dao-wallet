import base58 from "bs58";
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

//const DEFAULT_PATH = "44'/397'/0'/0'/1'";

const LedgerConnect = () => {
  const { connect } = useLedger();
  const navigate = useNavigate();
  const { addAccount } = useAuth();

  const onAfterConnect = () => {
    //TODO if(devMode)
    if (chrome.tabs) {
      navigate("/");
    } else {
      goTo(HomePage);
    }
  };

  const handleOnConnect = async () => {
    connect(async () => {
      const pkData: Buffer = await connect((client) =>
        client.getPublicKey()
      );

      const implicitAccountId = Buffer.from(pkData).toString("hex");

      const publicKeyString = toPublicKey(pkData, true) as string;
      const ids = await getAccountIds(publicKeyString);

      const newAccount = {
        accountId: implicitAccountId,
        tokens: [],
        publicKey: `ed25519:${base58.encode(pkData)}`,
        encryptedPrivateKey: "", // + pkString,
        isLedger: true,
      };

      if (!ids.length) {
        console.log("Account Not Funded");
        goTo(AccountNeedsFundingPage, {
          account: newAccount,
        });
        //Account not funded
        return;
      }
      await addAccount(newAccount);

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
