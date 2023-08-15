class Scraper {

    extractStringFromNode(node){
        var result = ""
        // if (node.children.length == 1) {
        //     console.log(node.firstChild);
        //     prefix = node.querySelector("span").getAttribute('data-figurine')
        // }
        // var moveString = prefix + node.textContent;

        for (const child of node.childNodes) {
            if (child.nodeType === Node.TEXT_NODE) {
              // If the child is a text node, concatenate its content
              result += child.textContent;
            } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName === 'SPAN') {
              // If the child is a <span> element, concatenate its color attribute
              const piece = child.getAttribute('data-figurine');
              result += piece;
            }
        
            // If the child is neither text nor <span>, skip it
          }
        return result
    
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
        console.log(moveArray);

    }
    async startScraping() {
        while (true) {
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2000ms
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
//import { Scraper } from "./Scraper.js";
console.log("Content script here");
scraper= new Scraper();
scraper.startScraping();

//chrome.runtime.sendMessage({"type":"SO", "message":"uci"})
