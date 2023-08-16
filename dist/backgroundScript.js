//import { MemoryHandler } from "./MemoryHandler.js";
import { AnalysisOrchestrator } from "./AnalysisOrchestrator.js";
import {MemoryHandler} from "./MemoryHandler.js"

let creating; // A global promise to avoid concurrency issues
var stockfishReady=false;

var OFFSCREEN_DIRECTORY_PATH="./offscreen/"
var OFFSCREEN_DOCUMENT_NAME="offscreen.html"


var memoryHandler;
function setup(){
  memoryHandler=new MemoryHandler();
}
async function hasDocument() {

  const matchedClients = await clients.matchAll({ includeUncontrolled: true, type: 'window' });

  for (const client of matchedClients) {
    if (client.url.endsWith(OFFSCREEN_DOCUMENT_NAME)) {
      return true;
    }
  }
  return false;
}

async function waitUntilStockfishReady(){
  while(stockfishReady==false){
    chrome.runtime.sendMessage({"type":"move array", "message":"isready"});
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}


async function setupOffscreenDocument(path) {

  if (await hasDocument()) {
    return;
  }

  if (creating) {
    await creating;
  } else {
    creating = chrome.offscreen.createDocument({
      url: path,
      reasons: [chrome.offscreen.Reason.WORKERS],
      justification: 'need to spawn web worker for stockfish',
    });

    await creating;
    creating = null;
    hasDocument();
  }
}

export async function setupIfNeededAndSendMessage(msg) {
  await setupOffscreenDocument(OFFSCREEN_DIRECTORY_PATH+OFFSCREEN_DOCUMENT_NAME)
  await waitUntilStockfishReady();
  console.log("spreman")
  chrome.runtime.sendMessage(msg);
}


chrome.runtime.onMessage.addListener((msg) => {
  if(msg.type=="stockfish"){
    if((msg.message)=="readyok"){
      stockfishReady=true;
    }
  }
})

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  
  console.log("NEW TAB LOADED", changeInfo.url)
  
});

setup();
console.log("KURC");
var analysisOrchestrator=new AnalysisOrchestrator(memoryHandler);

// const russianGameFen="rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1";
// const moveArray="e4 e5".split(" ");
// const gameId="0206005"
//setupIfNeededAndSendMessage({ "type": "move array", "message": {fen: russianGameFen}});

