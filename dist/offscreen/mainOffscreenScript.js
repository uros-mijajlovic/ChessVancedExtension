
import { createStockfishOrchestrator } from "./stockfishOrchestator.js";
import { AnalysisOrchestrator } from "./AnalysisOrchestrator.js";
import {MemorySender} from "./MemorySender.js"
var memorySender;

function setup(){
    memorySender=new MemorySender();
}

async function localStorageTest(){
    await memorySender.setData("kurac", "urosmijajlovic");

    await memorySender.setData("palac", "fsfdsfsd");

    await memorySender.setData("cmarac", "kurac");
    memorySender.printData("kurac");
    memorySender.printData("palac");
    memorySender.printData("cmarac");
    memorySender.printData("AAAAAA");
}

setup();
var stockfishOrchestratorInst=await createStockfishOrchestrator(false);
new AnalysisOrchestrator(stockfishOrchestratorInst);