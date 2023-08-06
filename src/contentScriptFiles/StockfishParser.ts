function getDepthFromString(message:string){
    const depthPattern = /depth (\d+)/;
    const depthMatch = message.match(depthPattern);

    if (depthMatch) {
      const depth = parseInt(depthMatch[1]);
      return depth
    } else {
      return -1
    }
  }

function getScorevalueFromString(message:string, isWhiteMove:boolean){
    const cpRegex = /score cp (-?\d+)/;
    const mateRegex = /score mate (-?\d+)/;

    const cpMatch = message.match(cpRegex);
    const mateMatch = message.match(mateRegex);

    if (cpMatch) {
        var cpValue = parseInt(cpMatch[1]);
        return {"value" : cpValue, "cpOrMate":"cp", "isWhiteMove":isWhiteMove}
    }
    if (mateMatch) {
        const movesToMate = parseInt(mateMatch[1]);
        return {"value" : movesToMate, "cpOrMate":"mate", "isWhiteMove":isWhiteMove}
    }
  }

function getMultiPVvalueFromString(message:string){
    const regex = /multipv\s(\d+)/;
    const match = message.match(regex);
    if (match) {
        var cpValue = parseInt(match[1]);
        //console.log("PV value:", cpValue);
        return cpValue;
    }else{
        return null;
    }
}

function getBestMoveFromString(message:string){

    
    const regex = /pv\s(\w{4})/;
    const match = message.match(regex);
    if(match){
        return match[1];
    }else{
        //console.log(`ALOALO${message}`);
    }

}

function getIsWhiteMoveFromFen(fenString:string){
    var splittedString=fenString.split(" ");
    if (splittedString[1]=="w"){
        return true
    }else{
        return false;
    }
}

  

export class StockfishParser{
    private data:Record<number, any>; 
    constructor(){
        this.data={};
    }
    getEval(){
        return this.data[0]["CP"];
    }
    sendMessage(message:string, currentFEN:string){
        //console.log(message);
        const isWhiteMove=getIsWhiteMoveFromFen(currentFEN);
        const evaulationDepth = getDepthFromString(message);
        const moveOrder=getMultiPVvalueFromString(message);
        const bestMove=getBestMoveFromString(message);

        if(bestMove){
            const score=getScorevalueFromString(message, isWhiteMove)
            this.data[moveOrder-1]={"move":bestMove, "CP":score["value"] * (isWhiteMove ? 1:-1), "cpOrMate":score["cpOrMate"]};
            this.data[moveOrder-1]["FEN"]=currentFEN;
            this.data[moveOrder-1]["depth"]=evaulationDepth;

        }

    }
    getAllData(){
        return this.data;
    }
    clearData(){
        this.data={};
    }




}