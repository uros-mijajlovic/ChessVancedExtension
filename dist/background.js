var stockfish;
async function startStockfish(){
    await Stockfish().then((sf) => {
        stockfish = sf;
        console.log("i dunno");
    
        stockfish.addMessageListener((message) => {
            chrome.runtime.sendMessage({ "type": "stockfish", "message": message });
        });
    });

    chrome.runtime.onMessage.addListener((msg) => {
        console.log(msg);
        
        if (msg.type == "stockfishOrchestrator") {
            if(msg.message=="isready"){
                chrome.runtime.sendMessage({ "type": "stockfish", "message": "readyok" })
            }else{
                stockfish.postMessage(msg.message);
            }
        }
    })
}
startStockfish();


