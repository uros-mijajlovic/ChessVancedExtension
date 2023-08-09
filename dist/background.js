

console.log("i dunno");
var stockfish;
chrome.runtime.sendMessage("i dunno says hi from bg");
Stockfish().then((sf) => {
    stockfish = sf;
    console.log("i dunno");
    chrome.runtime.sendMessage("UCI");
    
    stockfish.addMessageListener((message) => {
        chrome.runtime.sendMessage(message);
    });

    sf.postMessage("uci")
    sf.postMessage("go movetime 1000");
    
});

