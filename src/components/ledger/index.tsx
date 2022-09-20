//@ts-ignore
import { createClient, getSupportedTransport } from "near-ledger-js";
import { getCurrent } from "react-chrome-extension-router";
const CONNECT_HARDWARE_ROUTE = "/ledger";

/* const getEnvironmentType = (url:string) => {
  const parsedUrl = new URL(url);
  if (parsedUrl.pathname === "/popup.html") {
    return ENVIRONMENT_TYPE_POPUP;
  } else if (["/home.html"].includes(parsedUrl.pathname)) {
    return ENVIRONMENT_TYPE_FULLSCREEN;
  } else if (parsedUrl.pathname === "/notification.html") {
    return ENVIRONMENT_TYPE_NOTIFICATION;
  }
  return ENVIRONMENT_TYPE_BACKGROUND;
}; */

const Ledger = () => {
  const { props } = getCurrent();

  const handleOnConnect = async () => {
    // https://github.com/MetaMask/metamask-extension/blob/cdc0fed82885cc8f10496dffb4049140f4a536e3/ui/components/app/account-menu/account-menu.component.js#L405

    //if (getEnvironmentType(window?.location?.href) === ENVIRONMENT_TYPE_POPUP) {

    const transport = await getSupportedTransport();
    transport.setScrambleKey("NEAR");

    transport.on("disconnect", () => {
      console.log("DISCONNECT");
    });

    const client = await createClient(transport);

    console.log("client", client);
    const pk = await client.getPublicKey();

    console.log("pk", pk);
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

export default Ledger;
