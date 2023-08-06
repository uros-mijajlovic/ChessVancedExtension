import { AnalysisOrchestrator } from "./AnalysisOrchestrator";
import { StockfishParser } from "./StockfishParser";
import { Config } from "./config/config";
import {Stockfish} from "./dependencies/stockfish"

export async function createStockfishOrchestrator(sendEvalAfterEveryMove) {
  var stockfish;
  await Stockfish().then(sf => {
    stockfish = sf;
  });

  const stockfishOrchestratorInst = new stockfishOrchestrator(stockfish, sendEvalAfterEveryMove);

  stockfish.addMessageListener(message => {
    stockfishOrchestratorInst.handleMainMessage({ from: 'stockfish', message: message })
  });

  return stockfishOrchestratorInst;
}
class stockfishOrchestrator {
  private stockfishWorker: Worker;
  private isCurrentlyWorking: boolean;
  private currentFEN: string;
  public analysisOrchestrator: AnalysisOrchestrator;
  private whiteMove: boolean;
  private stockfishParser: StockfishParser;
  private moveTimeLengthMs: number;
  private currentRegularMove: string;
  private moveIndex: number;
  private callbackFunction;
  private sendEvalAfterEveryMove:boolean;



  constructor(stockfishWorkerArg, sendEvalAfterEveryMove) {
    this.sendEvalAfterEveryMove=sendEvalAfterEveryMove;
    this.stockfishWorker = stockfishWorkerArg;
    this.stockfishParser = new StockfishParser();
    
    if(sendEvalAfterEveryMove){
      this.moveTimeLengthMs=100000;
    }else{
      this.moveTimeLengthMs = Config.STOCKFISH_MOVETIME;
    }
    


    this.isCurrentlyWorking = null;

    this.currentFEN = null;

    this.analysisOrchestrator = null;

    this.whiteMove = true;

    this.stockfishWorker.postMessage(`setoption name Hash value 512`);
    this.stockfishWorker.postMessage(`setoption name Threads value 4`);
    this.stockfishWorker.postMessage(`setoption name MultiPV value 2`);

    self.onmessage = this.handleMainMessage.bind(this);
    //setoption name Use NNUE value true



    //this.stockfishWorker.postMessage(`bench`);
  }

  public deleteWorker(){
    this.stockfishWorker.terminate(); 
  }
  public clearData(){
    this.stockfishWorker.postMessage(`stop`)
    this.stockfishParser.clearData();
    this.whiteMove=true;
    this.isCurrentlyWorking=false;
  }

  setCallback(callbackFunction){
    this.callbackFunction=callbackFunction;
  }

  async getAnalsysForFenPosition(fenPosition, regularMove, moveIndex) {
    
    this.currentFEN = fenPosition;
    this.currentRegularMove = regularMove;
    this.moveIndex = moveIndex;
    //console.log(`position fen ${fenPosition}`);

    this.stockfishWorker.postMessage(`position fen ${fenPosition}`)

    this.stockfishWorker.postMessage(`go movetime ${this.moveTimeLengthMs}`)
  }

  async waitForRun(fenPosition, regularMove, moveIndex) {
    while (this.isCurrentlyWorking) {
      await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for 100ms
    }
    this.isCurrentlyWorking=true;
    await this.getAnalsysForFenPosition(fenPosition, regularMove, moveIndex);
  }

  async stopAndStartNewAnalysis(fenPosition){
    this.stockfishWorker.postMessage(`stop`);
    this.getAnalsysForFenPosition(fenPosition, "", 0);

  }
  handleMainMessage(message) {

    const from = message.from;
    const text = message.message;
    //console.log(text);

    if (text.startsWith('bestmove')) {
      this.whiteMove = !this.whiteMove;
      const currentEval = this.stockfishParser.getAllData();
      //console.log(currentEval);
      var dataFromStockfish={};
      dataFromStockfish["positionEvaluation"] = currentEval;
      dataFromStockfish["FENstring"] = this.currentFEN;
      dataFromStockfish["regularMove"] = this.currentRegularMove;
      dataFromStockfish["moveIndex"] = this.moveIndex;
      
      this.stockfishParser.clearData();
      if(!this.sendEvalAfterEveryMove){
        this.callbackFunction(dataFromStockfish);
      }

      
      this.isCurrentlyWorking = false;
    } else {
      
      this.stockfishParser.sendMessage(text, this.currentFEN);
      
      const currentEval = this.stockfishParser.getAllData();

      if(this.sendEvalAfterEveryMove){
        this.callbackFunction( currentEval );
      }

    }
  }
}


export { stockfishOrchestrator };