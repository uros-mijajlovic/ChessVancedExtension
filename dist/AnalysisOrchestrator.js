//import * as Chess from './dependencies/chess.js';
import * as sacrifice from './sacrifice.js';
import { MemoryHandler } from "./MemoryHandler.js"


function getWinPercentFromCP(cp){
    return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1)
    
}
export class AnalysisOrchestrator {
    constructor() {
        this.gameAnalysis = [];
        this.analysisArray = [];
        this.stopped = false;
        this.running = false;
        this.waitingForStockfish = false;
        this.memoryHandler = new MemoryHandler();
        this.stockfishReady = false;
        this.moveQueue = [];
        this.analysisBlocked=false;

        this.analyzedMoves = []; // cuva poteze za koje je vec pozvan analyzeGame

        chrome.runtime.onMessage.addListener((msg) => {
            if (msg.type == "stockfishToAnalysis") {
                this.sendEval(msg.message);
            }

            if (msg.type == "analyzeMoves") {
                this.analyzeMoveArray(msg.message.moves, msg.message.gameId, msg.message.playerSide, msg.message.playerElos);
            }

            if (msg.type == "fromContentScript") {
                console.log("IPAK SE OKRECE")
            }
            if (msg.type == "stockfish") {
                if ((msg.message) == "readyok") {
                    this.stockfishReady = true;
                }
            }
        })



        chrome.tabs.onActivated.addListener( (activeInfo) => {
            chrome.tabs.get(activeInfo.tabId, (tab) => {

                if (tab && tab.url) {
                    this.stopExtensionIfOnWebsite(tab.url)
                }
            });
        });
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab)=>{
            if (tab.active) {
                this.stopExtensionIfOnWebsite(tab.url)
                
            }
        })

        this.analyzeMovesThread();

    }

    stopExtensionIfOnWebsite(tabUrl){
        console.log("compairing urls", tabUrl, this.gameId)
        if(this.gameId && tabUrl!=this.gameId){
            console.log("gonna block", tabUrl, this.gameId)
            this.analysisBlocked=true;
        }else{
            console.log("not gonna block", tabUrl, this.gameId)
            this.analysisBlocked=false;
        }
    }
    clearData() {
        this.gameAnalysis = [];
        this.analysisArray = [];
    }

    async hasDocument() {

        const matchedClients = await clients.matchAll({ includeUncontrolled: true, type: 'window' });

        for (const client of matchedClients) {
            if (client.url.endsWith("offscreen.html")) {
                return true;
            }
        }
        return false;
    }

    async waitUntilStockfishReady() {
        while (this.stockfishReady == false) {
            console.log("stockfish is not readyy")
            chrome.runtime.sendMessage({ "type": "move array", "message": "isready" });
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }


    async setupStockfish() {

        const path = "./offscreen/" + "offscreen.html"
        if (await this.hasDocument()) {
            return;
        }
        await chrome.offscreen.createDocument({
            url: path,
            reasons: [chrome.offscreen.Reason.WORKERS || chrome.offscreen.Reason.IFRAME_SCRIPTING],
            justification: 'need to spawn web worker for stockfish',
        });

    }
    async setupIfNeededAndSendMessage(msg) {
        
        await this.setupStockfish();
        await this.waitUntilStockfishReady(msg.gameId);
        this.stockfishReady = false;
        console.log("spreman")
        chrome.runtime.sendMessage(msg);
        await new Promise((resolve) => setTimeout(resolve, 500));

    }

    async analyzeMovesThread() {
        while (true) {
            await new Promise((resolve) => setTimeout(resolve, 200));
            if (!this.analysisBlocked && this.moveQueue.length > 0) {

                var { fen, move, index } = this.moveQueue.shift();
                console.log("popped from queue ", fen, move, index, { fen: fen, move: move, index: index, gameId: this.gameId });
                await this.setupIfNeededAndSendMessage({ "type": "move array", "message": { fen: fen, move: move, index: index, gameId: this.gameId } });
            }
        }
    }
    async clearDataIfNewGame(newGameId) {

        var oldGameId;
        oldGameId = (await chrome.storage.local.get(["currentGameId"])).currentGameId;

        if (oldGameId != newGameId) {
            this.gameId = newGameId;
            
            try {
                await chrome.offscreen.closeDocument();
            } catch (e) {
                console.log(e);
            }
            await this.setupStockfish();
            this.analyzedMoves = [];
            this.moveQueue = []
            this.gameAnalysis=[]
            this.analysisArray=[]
            this.totalMoveArray=[]
            this.totalFenArray=[]
            console.log("IDEVI NISU ISTI", oldGameId, newGameId);
            await chrome.storage.local.set({ "currentGameId": newGameId });
            await chrome.storage.local.set({ "analysisData": [] });
            await chrome.storage.local.set({ "movearray": [] });
            await chrome.storage.local.set({ "fenarray": [] });
            await chrome.storage.local.set({ "analyzedFens": [] });
            console.log("sve ocisceno, navodno")
        }
    }
    returnNewMoves(newMoveArray) {
        const oldMoveArray = this.analyzedMoves;

        const newMoves = Array.from(newMoveArray.slice(oldMoveArray.length));

        console.log(oldMoveArray.length, "oldvsnew", oldMoveArray.toString(), "|", newMoveArray.toString(), "|", newMoves.toString());
        for (const newMove of newMoves) {
            this.analyzedMoves.push(newMove);
        }
        return newMoves;
    }
    async analyzeMoveArray(moveArray, gameId, playerSide, playerElos=[-3, -3]) {
        await this.clearDataIfNewGame(gameId);
        console.log(moveArray);

        this.playerSide=playerSide;

        var oldFenArrayLength;
        if (this.totalFenArray) {
            oldFenArrayLength = this.totalFenArray.length;
        } else {
            oldFenArrayLength = 0
        }

        this.totalMoveArray = sacrifice.moveStringArrayToMoveArray(moveArray);
        this.totalFenArray = sacrifice.moveStringArrayToFenArray(moveArray);

        chrome.storage.local.set({ "moveArray": this.totalMoveArray });
        chrome.storage.local.set({ "fenArray": this.totalFenArray });
        chrome.storage.local.set({ "playerSide": this.playerSide });
        chrome.storage.local.set({ "playerElos": playerElos });

        for (let i = oldFenArrayLength; i < this.totalFenArray.length; i++) {
            if (i == 0) {
                this.moveQueue.push({ fen: this.totalFenArray[i], move: "", index: i})
            } else {
                this.moveQueue.push({ fen: this.totalFenArray[i], move: this.totalMoveArray[i - 1].fromto, index: i })

            }
        }


    }
    calculateMoveBrilliance(playersMove, moveIndex) {
        if (moveIndex < 2) {
            return "gray";
        }
        const isWhiteMove = moveIndex % 2;
        const beforeMoveAnalysis = this.analysisArray[this.analysisArray.length - 2];
        const afterMoveAnalysis = this.analysisArray[this.analysisArray.length - 1];

        const beforeMoveWinPercent = getWinPercentFromCP(afterMoveAnalysis[0]["CPreal"])
        const afterMoveWinPercent = getWinPercentFromCP(beforeMoveAnalysis[0]["CPreal"])

        console.log(this.analysisArray);
        if (!(1 in beforeMoveAnalysis)) {
            return "gray";
        }
        //console.log("CALCULATING BRILLIANCE", beforeMoveAnalysis, playersMove);
        //console.log(`i think the move ${this.moveArray[moveIndex-1].fromto}, ${moveIndex-1}`)
        //console.log(dataForFen);
        const afterMoveCpDiscrepancy = (afterMoveAnalysis[0]["CPreal"] - beforeMoveAnalysis[0]["CPreal"]) * (isWhiteMove ? 1 : -1);
        if (this.analysisArray.length > 2) {
            const afterLastMoveAnalysis = this.analysisArray[this.analysisArray.length - 3];
            if (afterMoveCpDiscrepancy > -75) {
                if (Math.abs(afterMoveAnalysis[0]["CPreal"]) < 75 || (isWhiteMove == 1 && afterMoveAnalysis[0]["CPreal"] > 0) || (isWhiteMove == 0 && afterMoveAnalysis[0]["CPreal"] < 0)) {
                    if (sacrifice.didSacrificeIncrease(afterLastMoveAnalysis[0]["FEN"], beforeMoveAnalysis[0]["FEN"], afterMoveAnalysis[0]["FEN"], playersMove)) {
                        return "brilliant";
                    }
                }
            }
        }
        if (playersMove == beforeMoveAnalysis[0]["move"]) {
            if (Math.abs((Math.abs(beforeMoveAnalysis[0]["CPreal"]) - Math.abs(beforeMoveAnalysis[1]["CPreal"]))) > 100) {
                return "great";
            }
            else {
                return "best";
            }
        }

        const winPercentDiscrepancy = (afterMoveWinPercent - beforeMoveWinPercent) * (isWhiteMove ? -1 : 1)


        if (playersMove == beforeMoveAnalysis[1]["move"] && Math.abs((Math.abs(beforeMoveAnalysis[0]["CPreal"]) - Math.abs(beforeMoveAnalysis[1]["CPreal"]))) < 100) {
            return "good";
        }
        if (winPercentDiscrepancy < -30) {
            return "blunder";
        }
        if (winPercentDiscrepancy < -15) {
            return "mistake";
        }
        if (winPercentDiscrepancy < -10) {
            return "inaccuracy";
        }
        return "gray";
    }
    //postoji sansa da ovde dodje do nekog utrkivanja, najlaksi nacin da se resi je da svaki potez iz analysis-a ima index
    async sendEval(dataFromStockfish) {
        //chrome.runtime.sendMessage({type:"justLettingEveryoneKnow", message:dataFromStockfish});
        
        if (this.stopped) {
            return;
        }
        var gameId = dataFromStockfish["gameId"]
        console.log(gameId, "gameId in sendEval", dataFromStockfish["FENstring"])
        if (gameId != this.gameId) {
            return;
        }
        console.log("")

        var dataForFen = dataFromStockfish["positionEvaluation"];
        var FENstring = dataFromStockfish["FENstring"];
        var regularMove = dataFromStockfish["regularMove"];
        var moveIndex = dataFromStockfish["moveIndex"];
        
        const moveAnalysis = {};
        const centipawns = dataForFen[0]["CP"];
        //console.log(FENstring, centipawns, dataForFen);
        if (dataForFen[0]["cpOrMate"] == "mate") {
            if(dataForFen[0]["isCheckmated"]==true){
              moveAnalysis["CP"] = "M0";
              moveAnalysis["evaluation"] = -centipawns * 49;
              dataForFen[0]["CPreal"]= -centipawns*2000;
            }else{
              const mateForOpposite = (centipawns > 0) ? 1 : -1;
              moveAnalysis["CP"] = "M" + centipawns.toString();
              moveAnalysis["evaluation"] = mateForOpposite * 49;
              dataForFen[0]["CPreal"] = mateForOpposite*2000;
            }
      
          } else {
            var evalScoreForGraph = 50 * (2 / (1 + Math.exp(-0.004 * centipawns)) - 1)
            moveAnalysis["evaluation"] = evalScoreForGraph;
            moveAnalysis["CP"] = centipawns;

            dataForFen[0]["CPreal"] = centipawns;

          }

        this.analysisArray.push(dataForFen);
        moveAnalysis["moveRating"] = this.calculateMoveBrilliance(regularMove, moveIndex);
        this.gameAnalysis.push(moveAnalysis);

        console.log("gotova analiza", this.gameAnalysis);

        await chrome.storage.local.set({ "analyzedFens": this.analysisArray });
        await chrome.storage.local.set({ "analysisData": this.gameAnalysis });

        chrome.storage.local.get(["analysisData"]).then((result) => {
            console.log("Value currently is " + result.analysisData);
          });

    }
    async stopAnalysis() {
        if (this.running == false) {
            return;
        }
        this.stopped = true;
        while (this.stopped) {
            console.log("Cekam");
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        this.clearData();
        console.log("stopped and started new");
    }

}
