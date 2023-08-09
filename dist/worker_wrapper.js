async function getClients(){
    const matchedClients = await clients.matchAll();
    console.log(matchedClients)
}
try{
    console.log(chrome);
    chrome.offscreen.createDocument({
        url: './background.html',
        reasons: [chrome.offscreen.Reason.WORKERS],
        justification: 'need to spawn web worker for stockfish',
      });
}catch(e){
    console.log(e);
}
chrome.runtime.onMessage.addListener((msg) =>{
    console.log(msg);
})

getClients();
console.log("all imported");
