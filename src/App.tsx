import React from "react";
import { Router } from "react-chrome-extension-router";
import { HomePage, LedgerConnect } from "./components";
import { HashRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "./provider/AuthProvider";

function App() {
  return (
    <HashRouter>
      <AuthProvider>
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
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
