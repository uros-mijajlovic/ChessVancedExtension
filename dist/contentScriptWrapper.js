const WEBSITE_URL = "https://chessvanced.com/analysis"
//const WEBSITE_URL = "http://localhost:8000"


class Scraper {
    getPlayerSide() {
        try {
            var playerSide="white";
            if (window.location.href.includes("chess.com")) {
                var oppositePlayerBar = document.getElementById("board-layout-player-top")

                var clockItem = oppositePlayerBar.getElementsByClassName("clock-component")[0]

                if (clockItem.className.includes("white")) {
                    playerSide="black"
                } else {
                    playerSide="white"
                }
            }
            return playerSide;
        } catch (e) {
            console.log(e);
            return "white"
        }
    }
    getPlayersElo() {
        //console.log("gettinplayersinfo")
        try {
            var elos = []
            var ratings;
            if (window.location.href.includes("chess.com")) {
                ratings = document.getElementsByClassName("rating-score-rating")
            }else if(window.location.href.includes("lichess")){
                ratings=document.getElementsByTagName("rating");
            }
            for (const rating of ratings) {
                elos.push(parseInt(rating.textContent));
            }
            return elos
        } catch (e) {
            return [-1, -1];
        }
    }
    gameReviewButtonClickHandler() {
        this.sendCurrentGameState();

        window.open(WEBSITE_URL, "_blank");
    }
    tryToCreateButton() {
        if ((window.location.href).includes("https://www.chess.com/game")) {

            const existingButton = document.getElementById("chessvanced-floating");
            if (!existingButton) {
                const button = this.createCoolButton("chessvanced-floating");
                button.style.position = "fixed";
                button.style.bottom = "20px";
                button.style.right = "20px";
                button.style.zIndex = "9999";
                button.addEventListener("click", () => { this.gameReviewButtonClickHandler() });

                document.body.appendChild(button);
            }
        } else if ((window.location.href).includes("lichess.org")) {
            const existingButton = document.getElementById("chessvanced-floating");
            if (!existingButton) {
                const button = this.createCoolButton("chessvanced-floating");
                button.style.position = "fixed";
                button.style.bottom = "20px";
                button.style.right = "20px";
                button.style.zIndex = "9999";
                button.addEventListener("click", () => { this.gameReviewButtonClickHandler() });

                document.body.appendChild(button);
            }
        }
    }

    isInGame() {
        if (window.location.href.includes("lichess.org")) {
            return document.querySelectorAll("cg-board").length == 0
        } else {
            //...
        }
    }


    createCoolButton(buttonId) {
        const buttonElement = document.createElement('button');
        buttonElement.classList.add('purple-button');
        buttonElement.id = buttonId

        buttonElement.style = `
        grid-row: 2;
        grid-column: 1/span2;
        height: 50px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background-color: purple;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        `

        // Create the text span element

        const starSpan = document.createElement('span');
        starSpan.classList.add('star');
        starSpan.textContent = '★';
        starSpan.style = `font-size: 18px;`
        buttonElement.appendChild(starSpan);

        const textSpan = document.createElement('span');
        textSpan.classList.add('button-text');
        textSpan.textContent = 'Free Game Review';
        textSpan.style = `font-weight: bold;
        margin-right: 5px;`
        buttonElement.appendChild(textSpan);

        return buttonElement;
    }
    extractStringFromNode(node) {
        var result = ""

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

        var moveArray = [];

        const whiteMoves = HTMLMoves.getElementsByClassName("white node");
        const blackMoves = HTMLMoves.getElementsByClassName("black node");
        console.log(whiteMoves);
        for (let i = 0; i < Math.max(whiteMoves.length, blackMoves.length); i++) {
            if (i < whiteMoves.length) {
                moveArray.push(this.extractStringFromNode(whiteMoves[i]));
            }
            if (i < blackMoves.length) {
                moveArray.push(this.extractStringFromNode(blackMoves[i]));
            }
        }
        return moveArray;

    }
    moveContainerToSENLichess(moveContainer) {
        var moveArray = [];
        const moves = moveContainer.querySelectorAll("kwdb");
        for (const move of moves) {
            moveArray.push(move.textContent);
        }
        return moveArray
    }
    isLiveGame() {
        if (window.location.href.includes("lichess.org")) {
            return document.getElementsByClassName("game__meta")[0].children.length == 1;
        } else {
            const newGameButtonsDontExist = document.getElementsByClassName("new-game-buttons-component").length == 0
            const quickAnalysisButtonsDontExist = document.getElementsByClassName("quick-analysis-results-tally").length == 0
            const gameReviewButtonsDontExist = document.getElementsByClassName("game-review-buttons-component").length == 0
            return newGameButtonsDontExist && quickAnalysisButtonsDontExist && gameReviewButtonsDontExist;
        }
    }
    returnArrayOfMoves() {

        const playerElos = this.getPlayersElo();
        const currentGameId = window.location.href;
        var moveContainer;
        var playerSide =this.getPlayerSide();;
        if (currentGameId.includes("chess.com")) {
            moveContainer = document.getElementsByClassName("vertical-move-list")[0]
            console.log(moveContainer, "moveContainer")
            if (moveContainer) {
                const moveArray = this.HTMLmovesToSEN(moveContainer);
                console.log(moveArray);
                return { moves: moveArray, gameId: currentGameId, playerSide: playerSide, playerElos:playerElos};
            } else {
                return { moves: null, gameId: null, playerSide: playerSide, playerElos:playerElos};
            }

        } else if (currentGameId.includes("lichess.org")) {
            moveContainer = document.querySelector("l4x")
            if (moveContainer) {
                const moveArray = this.moveContainerToSENLichess(moveContainer);
                return { moves: moveArray, gameId: currentGameId, playerSide: playerSide, playerElos:playerElos };
            } else {
                return { moves: null, gameId: null, playerSide: playerSide, playerElos:playerElos };
            }
        }


        
    }
    sendCurrentGameState() {
        const message = this.returnArrayOfMoves();
        if (message.moves) {
            chrome.runtime.sendMessage({
                type: "analyzeMoves",
                message: message
            })
        } else {
            console.log("bad message", message);
        }
    }
    tryToDeleteButton(buttonId) {
        const element = document.getElementById(buttonId);

        if (element) {
            // Check if the element exists
            element.parentNode.removeChild(element);
        }
    }
    async startScraping() {
        while (true) {

            await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2000ms


            if (!this.isLiveGame()) {
                this.tryToCreateButton();
                continue
            } else {
                this.tryToDeleteButton("chessvanced-floating")
                try {
                    this.sendCurrentGameState();
                } catch (error) {
                    console.log("some error", error)
                }
            }

        }
    }
}

async function loadInjector() {

    await loadAnalysisData();
    var scriptDoc = document.createElement('script');
    scriptDoc.src = chrome.runtime.getURL('contentScript.js');

    // see also "Dynamic values in the injected code" section in this answer
    (document.head || document.documentElement).appendChild(scriptDoc);
}

async function retrieveDataFromMemory(key) {
    const searchData = [key];
    const result = (await chrome.storage.local.get(searchData))[key];
    return result;
}



async function loadAnalysisData() {

    var analysisDoc = document.createElement('div');
    analysisDoc.id = "injectedData"

    const analysisData = await retrieveDataFromMemory("analysisData");
    analysisDoc.setAttribute("analysisData", JSON.stringify(analysisData));

    const moveArray = await retrieveDataFromMemory("moveArray");
    analysisDoc.setAttribute("moveArray", JSON.stringify(moveArray));

    const fenArray = await retrieveDataFromMemory("fenArray");
    analysisDoc.setAttribute("fenArray", JSON.stringify(fenArray));

    const analyzedFens = await retrieveDataFromMemory("analyzedFens");
    analysisDoc.setAttribute("analyzedFens", JSON.stringify(analyzedFens));

    const playerSide = await retrieveDataFromMemory("playerSide");
    analysisDoc.setAttribute("playerSide", JSON.stringify(playerSide));

    const playerElos = await retrieveDataFromMemory("playerElos");
    analysisDoc.setAttribute("playerElos", JSON.stringify(playerElos));


    (document.head || document.documentElement).appendChild(analysisDoc);
    console.log("set shits", analysisDoc);


}
console.log(window.location.href, WEBSITE_URL)
const currentUrl = window.location.href
if (currentUrl.includes(WEBSITE_URL)) {
    loadInjector();

} else if (currentUrl.includes("chess.com") || currentUrl.includes("lichess.org")) {
    scraper = new Scraper();
    scraper.startScraping();
}
