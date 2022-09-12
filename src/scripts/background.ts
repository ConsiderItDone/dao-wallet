// @ts-ignore

const POPUP_HEIGHT = 600;
const POPUP_WIDTH = 400;

async function openPopup() {
  let top = 0;
  let left = 0;

  // Try to position popup in top right corner of last focused window
  try {
    const lastFocusedWindow = await chrome.windows.getLastFocused();
    if (
      lastFocusedWindow?.top &&
      lastFocusedWindow?.left &&
      lastFocusedWindow?.width
    ) {
      top = lastFocusedWindow.top;
      left = lastFocusedWindow.left + (lastFocusedWindow.width - POPUP_WIDTH);
    }
  } catch {}

  await chrome.windows.create({
    url: chrome.runtime.getURL("index.html"),
    type: "popup",
    height: POPUP_HEIGHT,
    width: POPUP_WIDTH,
    top,
    left,
  });
}

if (chrome?.runtime) {
  // Catch messages from content script
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request?.type === "near#enable") {
      openPopup();
    }

    sendResponse();
  });
}
