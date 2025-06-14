chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "smartCopy",
    title: "SmartCopy",
    contexts: ["selection", "image"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "smartCopy") {
    if (info.selectionText) {
      chrome.tabs.sendMessage(tab.id, {action: "copyText", text: info.selectionText});
    } else if (info.srcUrl) {
      chrome.tabs.sendMessage(tab.id, {action: "copyImage", url: info.srcUrl});
    }
  }
});