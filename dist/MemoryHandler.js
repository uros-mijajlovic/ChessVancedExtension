
export class MemoryHandler {
    constructor() {

        chrome.runtime.onMessage.addListener((msg) => {

            if (msg.type == "MemoryHandlerSet") {
                var key=msg.message.key;
                var value=msg.message.value;
                this.setData(key, value);
            }
            if (msg.type == "MemoryHandlerGet") {
                var key = msg.message;

                const result = this.getData(key);
                console.log(result);

            }
        })
        console.log("Memory Hanlder Initialized")
    }

    async setData(key, value) {
        console.log("Setting some data", key, value)
        var dataToSet = {};
        dataToSet[key] = value;

        await chrome.storage.local.set(dataToSet);
        chrome.runtime.sendMessage({type:"MemoryHandler", status:"ok"});
    }

    async getData(key) {
        console.log("Getting some data", key)
        var searchData = [key];
        return (await chrome.storage.local.get(searchData))[key];
    }



}

// oldGameId = (await chrome.storage.local.get(["currentGameId"])).currentGameId;
// chrome.runtime.sendMessage({ "type": "stockfish", "message": "there" })
// chrome.runtime.sendMessage({ "type": "stockfish", "message": oldGameId })
// if (oldGameId != newGameId) {
//     await chrome.storage.local.set({ "currentGameId": newGameId });
//     await chrome.storage.local.set({ "gameAnalysis": {} });
//     await chrome.storage.local.set({ "analyzedFens": [] });
// }