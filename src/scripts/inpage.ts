import { InjectedAPI } from "./injectedAPI/injectedAPI";
import { InjectedWallet } from "./injectedAPI/injectedAPI.types";

declare global {
  interface Window {
    near: Record<string, InjectedWallet>;
  }
}

if (window) {
  if (!window.near) {
    window.near = {};
  }

  window.near.daoWallet = new InjectedAPI();
}
