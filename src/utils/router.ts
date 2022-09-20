import { goTo, Link } from "react-chrome-extension-router";

export function openTab(url: string, component: React.ComponentType) {
  // Check if dev environment
  if (chrome.tabs) {
    chrome.tabs && chrome.tabs.create && chrome.tabs.create({ url: url });
  } else {
    goTo(component);
  }
}
