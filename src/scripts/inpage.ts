import { InjectedAPI } from "./injectedAPI";
import { InjectedWallet } from "./injectedAPI.types";

declare global {
  interface Window {
    near: Record<string, InjectedWallet>;
  }
}

if (window) {
  if (!window.near) {
    window.near = {};
  }

  window.near.omniWallet = new InjectedAPI();
}
