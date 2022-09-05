import React from "react";
import { HomePage } from "./components";
import { Router } from "react-chrome-extension-router";

function App() {
  return (
    <Router>
      <HomePage />
    </Router>
  );
}

export default App;
