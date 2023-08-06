/// <reference types="chrome"/>

chrome.tabs.onUpdated.addListener((tabId, tab) => {
  console.log("KURWAMA")
    if (tab.url && tab.url.includes("chess.com")) {
      console.log(tab.url);
      console.log("KURAC ")
      chrome.tabs.sendMessage(tabId, {
        type: "NEW",
        videoId: "kurcina",
      });
    }
  });
  