declare var Stockfish: any;
let stockfish;
const globalVariable = { currentTabId: null }; // Bad... but... whatever :)

const sendMessageToContentJs = (tabId, message) => {
  chrome.tabs.sendMessage(tabId, message);
};

Stockfish().then((sf) => {
  stockfish = sf;
  sf.addMessageListener((message) => {
    console.log(message);
    sendMessageToContentJs(globalVariable.currentTabId, {
      type: 'stockfish',
      message: message,
    });
  });
});
