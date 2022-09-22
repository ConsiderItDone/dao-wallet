import { goTo } from "react-chrome-extension-router";
import { useNavigate } from "react-router-dom";
import { useLedger } from "../../hooks/useLedger";
import { LocalStorage } from "../../services/chrome/localStorage";
import { createNewWallet } from "../../utils/wallet";
import HomePage from "../homePage";

const LedgerConnect = () => {
  const { connect, getPublicKey } = useLedger();
  const navigate = useNavigate();

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
      const pk = await getPublicKey();
      //TODO do something with PK

      const { accountId, privateKey } = createNewWallet(pk);
      await new LocalStorage().addAccount({
        name: pk,
        accountId,
        encryptedPrivateKey: privateKey,
        tokens: [],
      });
      onAfterConnect();
    });
  };

  return (
    <div>
      <button
        style={{
          background: "white",
          borderRadius: "8px",
          padding: "12px 20px",
          cursor: "pointer",
        }}
        onClick={handleOnConnect}
      >
        Connect
      </button>
    </div>
  );
};

export default LedgerConnect;
