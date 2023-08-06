import { Scraper } from "./Scraper";
import { AnalysisOrchestrator } from "./AnalysisOrchestrator";
//pass html element that holds all moves as argument, returns array of string moves


const scraper=new Scraper();
const analysisOrchestrator=new AnalysisOrchestrator();
scraper.startScraping();
