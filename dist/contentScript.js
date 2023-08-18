async function loadPlayerController() {
    while (window.playerControllerInst == undefined) {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2000ms
    }
    return window.playerControllerInst;
}

function getInjectedData() {
    var injectedDataDiv = document.getElementById("injectedData");
    var analysisData = JSON.parse(injectedDataDiv.getAttribute("analysisData"));
    var moveArray = JSON.parse(injectedDataDiv.getAttribute("movearray"));
    var fenArray = JSON.parse(injectedDataDiv.getAttribute("fenarray"));
    var analyzedFens = JSON.parse(injectedDataDiv.getAttribute("analyzedFens"));
    return { analysisData, moveArray, fenArray, analyzedFens};
}


async function injectAnalysis() {


    var { analysisData, moveArray, fenArray, analyzedFens } = getInjectedData();
    console.log("this is the injectedData i got", analysisData, moveArray, fenArray, analyzedFens)

    var playerController = await loadPlayerController();
    while(playerController.setGameFromExtension(fenArray, moveArray, analysisData, analyzedFens) == false){
        await new Promise((resolve) => setTimeout(resolve, 500)); 
        console.log("playerController.setGameFromExtension() unsuccessfull")

    }
    console.log(playerController);


}
injectAnalysis();




//chrome.runtime.sendMessage({"type":"SO", "message":"uci"})
