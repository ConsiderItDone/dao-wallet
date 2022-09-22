import React from "react";
import { Router } from "react-chrome-extension-router";
import { PolywrapProvider } from "@polywrap/react";
import { HomePage, LedgerConnect } from "./components";
import { getPolywrapConfig } from "./utils/polywrap";
import { HashRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <HashRouter>
      <PolywrapProvider {...getPolywrapConfig()}>
        <Routes>
          <Route
            path="/"
            element={
              <Router>
                <HomePage />
              </Router>
            }
          />
          <Route path="ledger" element={<LedgerConnect />} />
        </Routes>
      </PolywrapProvider>
    </HashRouter>
  );
}

export default App;
