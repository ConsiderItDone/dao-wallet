import React from "react";
import { goBack, goTo } from "react-chrome-extension-router";
import { IS_IN_DEVELOPMENT_MODE } from "../consts/app";

export async function openTab(url: string, component: React.ComponentType) {
  // Check if dev environment
  if (chrome.tabs) {
    const current = await chrome.tabs.getCurrent();
    console.log(current);
    // If tab is not active (not fullscreen) open new tab
    if (!current?.active) {
      chrome.tabs &&
        chrome.tabs.create &&
        chrome.tabs.create({ url: "index.html#" + url });
    } else {
      goTo(component);
    }
  } else {
    goTo(component);
  }
}

export async function openExternalWebsite(url: string) {
  if (IS_IN_DEVELOPMENT_MODE) {
    window.open(url);
  } else {
    return chrome.tabs.create({
      url,
    });
  }
}

export function closeCurrentTab() {
  if (chrome.tabs && chrome.tabs.query) {
    chrome.tabs.query(
      {
        currentWindow: true,
        active: true,
      },
      (current) => {
        if (current.length < 0) return;
        chrome.tabs.query(
          {
            index: current[0].index - 1,
          },
          (popup) => {
            if (popup.length < 0) return;
            //@ts-ignore
            chrome.tabs.update(popup[0].id, { active: true });
          }
        );
        //@ts-ignore
        chrome.tabs.remove(current[0].id);
      }
    );
    return;
  } else {
    goBack();
  }
}
