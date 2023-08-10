
import { createStockfishOrchestrator } from "./stockfishOrchestator.js";
import { AnalysisOrchestrator } from "./AnalysisOrchestrator.js";
//incijalizuj stockfishOrchestrator

var stockfishOrchestratorInst=await createStockfishOrchestrator(false);
new AnalysisOrchestrator(stockfishOrchestratorInst);