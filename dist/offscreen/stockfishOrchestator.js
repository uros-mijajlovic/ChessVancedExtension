import { StockfishParser } from "./StockfishParser.js";
import { Config } from "./config/config.js";
export async function createStockfishOrchestrator(sendEvalAfterEveryMove) {
    var stockfish;
    await Stockfish().then(sf => {
        stockfish = sf;
    });

    const stockfishOrchestratorInst = new stockfishOrchestrator(stockfish, sendEvalAfterEveryMove);

    stockfish.addMessageListener(message => {
        stockfishOrchestratorInst.handleMainMessage(message);
    });

    chrome.runtime.onMessage.addListener((msg) => {
        console.log(msg)
        if (msg.type == "move array") {
            if (msg.message == "isready") {
                if(stockfishOrchestratorInst.isCurrentlyWorking==false){
                    chrome.runtime.sendMessage({ "type": "stockfish", "message": "readyok" })
                }
            } else {
                console.log(msg);
                chrome.runtime.sendMessage({ "type": "stockfishBack", "message": msg })
                stockfishOrchestratorInst.waitForRun(msg.message.fen, msg.message.move, msg.message.index, msg.message.gameId);
            }
        }
    })


    return stockfishOrchestratorInst;
}
class stockfishOrchestrator {
    constructor(stockfishWorkerArg, sendEvalAfterEveryMove) {
        this.sendEvalAfterEveryMove = sendEvalAfterEveryMove;
        this.stockfishWorker = stockfishWorkerArg;
        this.stockfishParser = new StockfishParser();
        if (sendEvalAfterEveryMove) {
            this.moveTimeLengthMs = 100000;
        }
        else {
            this.moveTimeLengthMs = Config.STOCKFISH_MOVETIME;
        }
        this.isCurrentlyWorking = false;
        this.currentFEN = null;
        this.analysisOrchestrator = null;
        this.whiteMove = true;
        this.stockfishWorker.postMessage(`setoption name Hash value 512`);
        this.stockfishWorker.postMessage(`setoption name Threads value 4`);
        this.stockfishWorker.postMessage(`setoption name MultiPV value 2`);
        self.onmessage = this.handleMainMessage.bind(this);



    }
    async getLichessData(fenPosition) {
        try {
            const apiUrl = `https://lichess.org/api/cloud-eval?fen=${fenPosition}&multiPv=2`;
            const response = await axios.get(apiUrl);
            // Check if the response contains any analysis data (e.g., 'evals' field).
            if (response.data.fen) {
                // The position was found in the cache (already analyzed)
                
                if (response.data.pvs.length < 2) {
                    return [false];
                }
                return [true, response.data];
            }
            else {
                // The position was not found in the cache (no analysis available).
                return [false, response.data];
            }
        }
        catch (error) {
            console.log("ERROR", error)
            return [false];
        }
    }
    async checkCache(fenString) {
        const responseFromCache = await this.getLichessData(fenString);
        if (responseFromCache[0] == true) {
            return [true, this.stockfishParser.cachedDataToParsed(responseFromCache[1])];
        }
        return [false];
    }
    deleteWorker() {
        this.stockfishWorker.terminate();
    }
    clearData() {
        this.stockfishWorker.postMessage(`stop`);
        this.stockfishParser.clearData();
        this.whiteMove = true;
        this.isCurrentlyWorking = false;
    }
    setCallback(callbackFunction) {
        this.callbackFunction = callbackFunction;
    }
    fillRestOfDataForAnalysisOrchestrator(currentEval) {
        var dataFromStockfish = {};
        dataFromStockfish["positionEvaluation"] = currentEval;
        dataFromStockfish["FENstring"] = this.currentFEN;
        dataFromStockfish["regularMove"] = this.currentRegularMove;
        dataFromStockfish["moveIndex"] = this.moveIndex;
        dataFromStockfish["gameId"]=this.gameId;
        return dataFromStockfish;
    }
    async getAnalsysForFenPosition(fenPosition, move, index, gameId) {
        this.currentFEN = fenPosition;
        this.moveIndex=index;
        this.currentRegularMove=move;
        this.gameId=gameId

        chrome.runtime.sendMessage({ "type": "stockfishBack", "result": fenPosition })
        const cachedResponse = await this.checkCache(fenPosition);
        cachedResponse[1]=this.fillRestOfDataForAnalysisOrchestrator(cachedResponse[1]);
        if (cachedResponse[0] == true) {
            this.sendDataToAnalysisOrchestrator(cachedResponse[1]);
            this.isCurrentlyWorking = false;
            console.log("za ovu poziciju imam", fenPosition, cachedResponse);
            return;
        }else{
            console.log("za ovu poziciju nemam info", fenPosition, cachedResponse);
        }
        //console.log(`position fen ${fenPosition}`);
        this.stockfishWorker.postMessage(`position fen ${fenPosition}`);
        this.stockfishWorker.postMessage(`go movetime ${this.moveTimeLengthMs}`);
    }
    async waitForRun(fenPosition, move, index, gameId) {

        while (this.isCurrentlyWorking) {
            await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for 100ms
        }
        this.isCurrentlyWorking = true;
        await this.getAnalsysForFenPosition(fenPosition, move, index, gameId);
    }
    async stopAndStartNewAnalysis(fenPosition) {
        this.stockfishWorker.postMessage(`stop`);
        this.getAnalsysForFenPosition(fenPosition, "", 0);
    }
    sendDataToAnalysisOrchestrator(data){
        chrome.runtime.sendMessage({ "type": "stockfishToAnalysis", "message": data })
    }
    handleMainMessage(message) {
        const text = message;
        if (text.startsWith('bestmove')) {
            this.whiteMove = !this.whiteMove;
            const currentEval = this.stockfishParser.getAllData();

            var dataFromStockfish = this.fillRestOfDataForAnalysisOrchestrator(currentEval);
            this.stockfishParser.clearData();

            this.sendDataToAnalysisOrchestrator(dataFromStockfish);

            this.isCurrentlyWorking = false;
        }
        else {
            this.stockfishParser.sendMessage(text, this.currentFEN);
        }
    }
}
export { stockfishOrchestrator };
