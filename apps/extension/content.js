chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "DRIVEAI_GET_SELECTION") {
    return;
  }

  sendResponse({
    title: document.title,
    url: location.href,
    selection: window.getSelection()?.toString() || "",
  });
});
