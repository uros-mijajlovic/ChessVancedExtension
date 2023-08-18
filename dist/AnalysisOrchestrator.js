//import * as Chess from './dependencies/chess.js';
import * as sacrifice from './sacrifice.js';
import { MemoryHandler } from "./MemoryHandler.js"

export class AnalysisOrchestrator {
    constructor() {
        this.gameAnalysis = [];
        this.analysisArray = [];
        this.stopped = false;
        this.running = false;
        this.waitingForStockfish = false;
        this.currentGameId = null;
        this.memoryHandler = new MemoryHandler();
        this.stockfishReady = false;
        this.moveQueue = [];

        this.analyzedMoves = []; // cuva poteze za koje je vec pozvan analyzeGame

        chrome.runtime.onMessage.addListener((msg) => {
            if (msg.type == "stockfishToAnalysis") {
                this.sendEval(msg.message);
            }

            if (msg.type == "analyzeMoves") {
                this.analyzeMoveArray(msg.message.moves, msg.message.gameId);
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

        this.analyzeMovesThread();

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
            reasons: [chrome.offscreen.Reason.WORKERS],
            justification: 'need to spawn web worker for stockfish',
        });

    }
    async setupIfNeededAndSendMessage(msg) {
        await this.setupStockfish();
        await this.waitUntilStockfishReady(msg.gameId);
        this.stockfishReady = false;
        console.log("spreman")
        chrome.runtime.sendMessage(msg);
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    async analyzeMovesThread() {
        while (true) {
            await new Promise((resolve) => setTimeout(resolve, 200));
            if (this.moveQueue.length > 0) {

                var { fen, move, index } = this.moveQueue.shift();
                console.log("popped from queue ", fen, move, index);
                await this.setupIfNeededAndSendMessage({ "type": "move array", "message": { fen: fen, move: move, index: index, gameId: this.gameId } });
            }
        }
    }
    async clearDataIfNewGame(newGameId) {

        var oldGameId;
        oldGameId = (await chrome.storage.local.get(["currentGameId"])).currentGameId;

        if (oldGameId != newGameId) {
            this.gameId = newGameId;
            //console.log("MORAM DA OBRISEM STARI")
            try {
                await chrome.offscreen.closeDocument();
            } catch (e) {
                console.log(e);
            }
            await this.setupStockfish();
            this.analyzedMoves = [];
            this.moveQueue=[]
            console.log("IDEVI NISU ISTI", oldGameId, newGameId);
            await chrome.storage.local.set({ "currentGameId": newGameId });
            await chrome.storage.local.set({ "analysisData": [] });
            await chrome.storage.local.set({ "movearray": [] });
            await chrome.storage.local.set({ "fenarray": [] });
            await chrome.storage.local.set({ "analyzedFens": [] });
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
    async analyzeMoveArray(moveArray, gameId) {
        await this.clearDataIfNewGame(gameId);
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


        var fenArray = sacrifice.moveStringArrayToFenArray(moveArray);
        var fromtoMoves = sacrifice.moveStringArrayToMoveArray(moveArray);

        fenArray = Array.from(fenArray.slice(oldFenArrayLength));
        fromtoMoves = Array.from(fromtoMoves.slice(oldFenArrayLength));


        for (let i = 0; i < fenArray.length; i++) {
            const index = oldFenArrayLength + i;
            if (i == 0) {
                this.moveQueue.push({ fen: fenArray[i], move: "", index: index })
                //await setupIfNeededAndSendMessage({ "type": "move array", "message": { fen: fenArray[i], move: "", index: index } });
            } else {
                this.moveQueue.push({ fen: fenArray[i], move: fromtoMoves[i - 1].fromto, index: index })
                //await setupIfNeededAndSendMessage({ "type": "move array", "message": { fen: fenArray[i], move: fromtoMoves[i - 1].fromto, index: index } });

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
        if (!(1 in beforeMoveAnalysis)) {
            return "gray";
        }
        //console.log("CALCULATING BRILLIANCE", beforeMoveAnalysis, playersMove);
        //console.log(`i think the move ${this.moveArray[moveIndex-1].fromto}, ${moveIndex-1}`)
        //console.log(dataForFen);
        const afterMoveCpDiscrepancy = (afterMoveAnalysis[0]["CP"] - beforeMoveAnalysis[0]["CP"]) * (isWhiteMove ? 1 : -1);
        if (this.analysisArray.length > 2) {
            const afterLastMoveAnalysis = this.analysisArray[this.analysisArray.length - 3];
            if (afterMoveCpDiscrepancy > -75) {
                if (Math.abs(afterMoveAnalysis[0]["CP"]) < 75 || (isWhiteMove == 1 && afterMoveAnalysis[0]["CP"] > 0) || (isWhiteMove == 0 && afterMoveAnalysis[0]["CP"] < 0)) {
                    if (sacrifice.didSacrificeIncrease(afterLastMoveAnalysis[0]["FEN"], beforeMoveAnalysis[0]["FEN"], afterMoveAnalysis[0]["FEN"], playersMove)) {
                        return "brilliant";
                    }
                }
            }
        }
        if (playersMove == beforeMoveAnalysis[0]["move"]) {
            if (Math.abs((Math.abs(beforeMoveAnalysis[0]["CP"]) - Math.abs(beforeMoveAnalysis[1]["CP"]))) > 100) {
                return "great";
            }
            else {
                return "best";
            }
        }
        if (playersMove == beforeMoveAnalysis[1]["move"] && Math.abs((Math.abs(beforeMoveAnalysis[0]["CP"]) - Math.abs(beforeMoveAnalysis[1]["CP"]))) < 100) {
            return "good";
        }
        if (afterMoveCpDiscrepancy < -200) {
            return "mistake";
        }
        return "gray";
    }
    //postoji sansa da ovde dodje do nekog utrkivanja, najlaksi nacin da se resi je da svaki potez iz analysis-a ima index
    sendEval(dataFromStockfish) {
        //chrome.runtime.sendMessage({type:"justLettingEveryoneKnow", message:dataFromStockfish});

        if (this.stopped) {
            return;
        }
        var gameId = dataFromStockfish["gameId"]

        if (gameId!=this.gameId){
            return;
        }

        var dataForFen = dataFromStockfish["positionEvaluation"];
        var FENstring = dataFromStockfish["FENstring"];
        var regularMove = dataFromStockfish["regularMove"];
        var moveIndex = dataFromStockfish["moveIndex"];
        this.analysisArray.push(dataForFen);
        const moveAnalysis = {};
        const centipawns = dataForFen[0]["CP"];
        //console.log(FENstring, centipawns, dataForFen);
        if (dataForFen[0]["cpOrMate"] == "mate") {
            console.log(centipawns);
            console.log(dataForFen);
            const mateForOpposite = (centipawns > 0) ? 1 : -1;
            moveAnalysis["CP"] = "M" + centipawns.toString();
            moveAnalysis["evaluation"] = mateForOpposite * 49;
        }
        else {
            var evalScoreForGraph = 50 * (2 / (1 + Math.exp(-0.004 * centipawns)) - 1);
            moveAnalysis["evaluation"] = evalScoreForGraph;
            moveAnalysis["CP"] = centipawns;
        }
        moveAnalysis["moveRating"] = this.calculateMoveBrilliance(regularMove, moveIndex);
        this.gameAnalysis.push(moveAnalysis);

        console.log("gotova analiza", this.gameAnalysis);

        chrome.storage.local.set({ "analyzedFens": this.analysisArray });
        chrome.storage.local.set({ "analysisData": this.gameAnalysis });



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
        //continue
    }
    async updateData(fenMoves, moveArray, gameId) {
        if (this.currentGameId != gameId) {
            await restartStockfishOrchestrator();
            this.currentGameId = gameId;
        }
        this.analyzeGame(fenMoves, moveArray);

    }
    async restartStockfishOrchestrator() {
        if (this.stockfishOrchestrator) {
            this.stockfishOrchestrator.deleteWorker();
        }

        await this.stopAnalysis();

        this.stockfishOrchestrator = await createStockfishOrchestrator(false);

        this.stockfishOrchestrator.analysisOrchestrator = this;

        this.stockfishOrchestrator.setCallback((data) => { this.sendEval(data) });
    }
    async analyzeGame(fenMoves, moveArray) {
        console.log("Propusten dalje")

        this.running = true;

        this.gameAnalysis = []
        this.moveArray = moveArray;
        this.fenArray = fenMoves;


        for (let i = 0; i < fenMoves.length; i++) {
            const fenMove = fenMoves[i];

            if (this.stopped) {
                console.log("nasilno stopiram")
                break;
            }
            if (i == 0) {
                await this.stockfishOrchestrator.waitForRun(fenMove, "", i);
            } else {
                await this.stockfishOrchestrator.waitForRun(fenMove, moveArray[i - 1], i);
            }
            //console.log(fenMove);
        }
        console.log("gotov")
        this.stopped = false;
        this.running = false;
    }

}
