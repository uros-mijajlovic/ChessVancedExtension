function createCoolButton() {
    const buttonElement = document.createElement('button');
    buttonElement.classList.add('purple-button');

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

    // Create the star span element


    return buttonElement;
}
class Scraper {
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
    async startScraping() {
        while (true) {
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2000ms
            try {
                var moveContainer = document.querySelectorAll("vertical-move-list")[0]

                if (moveContainer) {
                    const moveArray = this.HTMLmovesToSEN(moveContainer);   
                    
                    chrome.runtime.sendMessage({
                        type: "analyzeMoves",
                        message: {
                            moves: moveArray,
                            gameId: window.location.href,
                        }
                    })
                }
                var buttonContainer = document.getElementsByClassName("game-review-buttons-component")[0]

                if (buttonContainer) {
                    if (buttonContainer.children.length == 2) {
                        const buttonElement = createCoolButton();
                        buttonContainer.appendChild(buttonElement);
                    }
                }

            } catch (error) {
                console.log("some error", error)
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


async function loadAnalysisData() {

    var analysisDoc = document.createElement('div');
    analysisDoc.id = "injectedData"


    console.log("BB");
    var key = "analysisData"
    var searchData = [key];
    const analysisData = (await chrome.storage.local.get(searchData))[key];
    analysisDoc.setAttribute("analysisData", JSON.stringify(analysisData));
    //analysisDoc.setAttribute("analysisData", analysisData)


    key = "moveArray"
    searchData = [key];
    const moveArray = (await chrome.storage.local.get(searchData))[key];
    analysisDoc.setAttribute("moveArray", JSON.stringify(moveArray));



    key = "fenArray"
    searchData = [key];

    const fenArray = (await chrome.storage.local.get(searchData))[key];
    analysisDoc.setAttribute("fenArray", JSON.stringify(fenArray));



    key = "analyzedFens"
    searchData = [key];

    const analyzedFens = (await chrome.storage.local.get(searchData))[key];
    analysisDoc.setAttribute("analyzedFens", JSON.stringify(analyzedFens));


    (document.head || document.documentElement).appendChild(analysisDoc);


}
if (window.location.href == "http://localhost:8000/") {

    loadInjector();


} else {
    console.log("start scrapin");
    scraper = new Scraper();
    scraper.startScraping();
}