import React from "react";
import {Router} from 'react-chrome-extension-router'
import { PolywrapProvider } from "@polywrap/react";
import {HomePage} from './components'
import { getPolywrapConfig } from "./utils/polywrap";

function App() {
  return (
    <PolywrapProvider {...getPolywrapConfig()}>
    <Router>
      <HomePage/>
    </Router>
    </PolywrapProvider>
  );
}

export default App;
