import React from "react";
import { PolywrapProvider } from "@polywrap/react";
import {
  ConfirmationPage,
  TrasactionPage,
  ChooseMethod,
  BalancePage,
  SendPage,
  HomePage,
  Info,
} from "./components";
import { getPolywrapConfig } from "./utils/polywrap";

function App() {
  return (
    //@ts-ignore
    <PolywrapProvider {...getPolywrapConfig()}>
      <div className="App">
        {/* <Info/> */}
        {/* <SendPage/> */}
        {/* <HomePage/> */}
        {/* <ChooseMethod/> */}
        {/* <BalancePage/> */}
        {/* <ConfirmationPage/> */}
        <TrasactionPage />
      </div>
    </PolywrapProvider>
  );
}

export default App;
