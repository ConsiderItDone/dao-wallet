import React from "react";
import { Router } from "react-chrome-extension-router";
import { PolywrapProvider } from "@polywrap/react";
import { ChooseMethod, HomePage } from "./components";
import { getPolywrapConfig } from "./utils/polywrap";

function App() {
  return (
    <PolywrapProvider {...getPolywrapConfig()}>
      <Router>
        <ChooseMethod />
      </Router>
    </PolywrapProvider>
  );
}

export default App;
