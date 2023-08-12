
export class MemorySender {
    constructor() {
        this.waiting = false;
        chrome.runtime.onMessage.addListener((msg) => {

            if (msg.type == "MemoryHandler") {
                if (msg.status == "ok") {
                    this.waiting = false;
                }
            }
        })
    }

    async awaitResponse() {
        while(this.waiting){
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    async setData(key, value){
        var dataToSet = {}
        dataToSet["key"]=key;
        dataToSet["value"]=value;

        this.waiting=true;
        chrome.runtime.sendMessage({ "type": "MemoryHandlerSet", "message": dataToSet });
        await this.awaitResponse();
    }

    async printData(key){
        chrome.runtime.sendMessage({ "type": "MemoryHandlerGet", "message": key });
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