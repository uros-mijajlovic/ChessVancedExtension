
let creating; // A global promise to avoid concurrency issues
var stockfishReady=false;


async function hasDocument() {

  const matchedClients = await clients.matchAll({ includeUncontrolled: true, type: 'window' });

  for (const client of matchedClients) {
    console.log(client.url);
    if (client.url.endsWith("background.html")) {
      console.log("VEC GA IMAMO KURVE")
      return true;
    }
  }
  console.log("NEMAMO GA IMAMO KURVE")
  return false;
}

async function waitUntilStockfishReady(){
  while(stockfishReady==false){
    chrome.runtime.sendMessage({"type":"stockfishOrchestrator", "message":"isready"});
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
    console.log("has document")
    hasDocument();
  }
}

async function setupIfNeededAndSendMessage(msg) {
  await setupOffscreenDocument("./background.html")
  await waitUntilStockfishReady();
  console.log("spreman")
  chrome.runtime.sendMessage({ "type": "stockfishOrchestrator", "message": msg.message });
}

chrome.runtime.onMessage.addListener((msg) => {

  console.log(msg);

  if(msg.type=="stockfish"){
    if((msg.message)=="readyok"){
      stockfishReady=true;
    }
  }
  if (msg.type == "SO") {
    setupIfNeededAndSendMessage(msg);
  }
})

setupIfNeededAndSendMessage({ "type": "stockfishOrchestrator", "message": "go movetime 50" });

