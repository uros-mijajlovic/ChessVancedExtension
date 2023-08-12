import { Chess } from "./dependencies/chess.js";
import { moveStringArrayToFenArray } from "./offscreen/sacrifice.js";



export class Scraper {

    extractStringFromNode(node){
        var prefix = ""
        if (node.children.length == 1) {
            prefix = node.firstChild.getAttribute('data-figurine')
        }
        var moveString = prefix + node.textContent;
        return moveString
    
    }
    
    HTMLmovesToSEN(HTMLMoves) {
        var moveArray= [];

        const whiteMoves = HTMLMoves.getElementsByClassName("white node");
        const blackMoves = HTMLMoves.getElementsByClassName("black node");
        for (let i = 0; i < Math.max(whiteMoves.length, blackMoves.length); i++) {
            if (i < whiteMoves.length) {
                moveArray.push(this.extractStringFromNode(whiteMoves[i]));
            }
            if (i < blackMoves.length) {
                moveArray.push(this.extractStringFromNode(blackMoves[i]));
            }
        }
        const fenArray=moveStringArrayToFenArray(moveArray);
        console.log(fenArray);

    }
    async startScraping() {
        while (true) {
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 100ms
            try {
                var moveContainer = document.querySelectorAll("vertical-move-list")[0]
                console.log("TST")
                if (moveContainer) {
                    this.HTMLmovesToSEN(moveContainer);
                }
            } catch (error) {
                console.log("some error", error)
            }
        }
    }


}