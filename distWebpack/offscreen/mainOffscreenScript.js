(()=>{"use strict";var e,t,s,a,r={178:(e,t,s)=>{s.a(e,(async(e,t)=>{try{var a=s(870);await(0,a.e)(!1),t()}catch(e){t(e)}}),1)},870:(e,t,s)=>{s.d(t,{e:()=>i});class a{constructor(){this.data={}}cachedDataToParsed(e){const t={};for(let s=0;s<2;s++)t[s]={},t[s].FEN=e.fen,"cp"in e.pvs[s]?(t[s].CP=e.pvs[s].cp,t[s].move=e.pvs[s].moves.split(" ")[0],t[s].cpOrMate="cp"):(t[s].CP=e.pvs[s].mate,t[s].move=e.pvs[s].moves.split(" ")[0],t[s].cpOrMate="mate"),t[s].depth=e.depth;return t}getEval(){return this.data[0].CP}sendMessage(e,t){const s="w"==t.split(" ")[1];if("info depth 0 score mate 0"==e)this.data[0]={move:-1,isCheckmated:!0,CP:s?1:-1,cpOrMate:"mate",CPreal:s?3e3:-3e3},this.data[0].FEN=t,this.data[0].depth=123;else{const r=function(e){const t=e.match(/depth (\d+)/);if(t)return parseInt(t[1]);return-1}(e),i=function(e){const t=e.match(/multipv\s(\d+)/);return t?parseInt(t[1]):null}(e),o=function(e){const t=e.match(/pv\s(\w{4})/);if(t)return t[1]}(e);if(o){const n=function(e,t){const s=e.match(/score cp (-?\d+)/),a=e.match(/score mate (-?\d+)/);if(s)return{value:parseInt(s[1]),cpOrMate:"cp",isWhiteMove:t};if(a)return{value:parseInt(a[1]),cpOrMate:"mate",isWhiteMove:t}}(e,s);var a;a="mate"==n.cpOrMate?s?3e3:-3e3:n.value*(s?1:-1),this.data[i-1]={move:o,CP:n.value*(s?1:-1),cpOrMate:n.cpOrMate,CPreal:a},this.data[i-1].FEN=t,this.data[i-1].depth=r}}}getAllData(){return this.data}clearData(){this.data={}}}var r;async function i(e){var t;await Stockfish().then((e=>{t=e}));const s=new o(t,e);return t.addMessageListener((e=>{s.handleMainMessage(e)})),chrome.runtime.onMessage.addListener((e=>{"move array"==e.type&&("isready"==e.message?0==s.isCurrentlyWorking&&chrome.runtime.sendMessage({type:"stockfish",message:"readyok"}):(chrome.runtime.sendMessage({type:"stockfishBack",message:e}),s.waitForRun(e.message.fen,e.message.move,e.message.index,e.message.gameId)))})),s}!function(e){let t,s,a,r;e.STOCKFISH_MOVETIME=5e3,function(e){e[e.MOVE_REGULAR=0]="MOVE_REGULAR",e[e.MOVE_CAPTURE=1]="MOVE_CAPTURE",e[e.MOVE_CHECK=2]="MOVE_CHECK",e[e.MOVE_MATE=3]="MOVE_MATE",e[e.MOVE_NONE=4]="MOVE_NONE"}(t=e.MOVE_TYPE||(e.MOVE_TYPE={})),function(e){e[e.ACTIVE=0]="ACTIVE",e[e.INACTIVE=1]="INACTIVE"}(s=e.TILE_COLORS||(e.TILE_COLORS={})),function(e){e[e.WHITE=0]="WHITE",e[e.BLACK=1]="BLACK",e[e.BOTH=2]="BOTH"}(a=e.ANALYSIS_FOR||(e.ANALYSIS_FOR={})),e.Colors={brilliant:"rgba(15, 255, 243, 1)",great:"rgba(107, 111, 229, 1)",best:"gray",good:"gray",gray:"gray",mistake:"red"},e.CssDictForTiles={brilliant:"brilliant_tile",great:"great_tile",best:"yellow_tile",good:"yellow_tile",gray:"yellow_tile",mistake:"mistake_tile"},e.pointSizes={brilliant:3,great:3,best:1,good:1,gray:1,mistake:1},function(e){e[e.QUEEN=0]="QUEEN",e[e.ROOK=1]="ROOK",e[e.BISHOP=2]="BISHOP",e[e.KNIGHT=3]="KNIGHT"}(r=e.PROMOTION||(e.PROMOTION={})),e.PROMOTION_TO_CHAR={0:"q",1:"r",2:"n",3:"b"},e.PROMOTION_CHAR_TO_IMAGE_URL={q:"/img/chesspieces/wikipedia/bQ.png",r:"/img/chesspieces/wikipedia/bR.png",n:"/img/chesspieces/wikipedia/bN.png",b:"/img/chesspieces/wikipedia/bB.png"}}(r||(r={}));class o{constructor(e,t){this.sendEvalAfterEveryMove=t,this.stockfishWorker=e,this.stockfishParser=new a,this.moveTimeLengthMs=t?1e5:r.STOCKFISH_MOVETIME,this.isCurrentlyWorking=!1,this.currentFEN=null,this.analysisOrchestrator=null,this.whiteMove=!0,this.stockfishWorker.postMessage("setoption name Hash value 512"),this.stockfishWorker.postMessage("setoption name Threads value 4"),this.stockfishWorker.postMessage("setoption name MultiPV value 2"),self.onmessage=this.handleMainMessage.bind(this)}async getLichessData(e){try{const t=`https://lichess.org/api/cloud-eval?fen=${e}&multiPv=2`,s=await axios.get(t);return s.data.fen?s.data.pvs.length<2?[!1]:[!0,s.data]:[!1,s.data]}catch(e){return[!1]}}async checkCache(e){const t=await this.getLichessData(e);return 1==t[0]?[!0,this.stockfishParser.cachedDataToParsed(t[1])]:[!1]}deleteWorker(){this.stockfishWorker.terminate()}clearData(){this.stockfishWorker.postMessage("stop"),this.stockfishParser.clearData(),this.whiteMove=!0,this.isCurrentlyWorking=!1}setCallback(e){this.callbackFunction=e}fillRestOfDataForAnalysisOrchestrator(e){var t={};return t.positionEvaluation=e,t.FENstring=this.currentFEN,t.regularMove=this.currentRegularMove,t.moveIndex=this.moveIndex,t.gameId=this.gameId,t}async getAnalsysForFenPosition(e,t,s,a){this.currentFEN=e,this.moveIndex=s,this.currentRegularMove=t,this.gameId=a,chrome.runtime.sendMessage({type:"stockfishBack",result:e});const r=await this.checkCache(e);if(r[1]=this.fillRestOfDataForAnalysisOrchestrator(r[1]),1==r[0])return this.sendDataToAnalysisOrchestrator(r[1]),void(this.isCurrentlyWorking=!1);this.stockfishWorker.postMessage(`position fen ${e}`),this.stockfishWorker.postMessage(`go movetime ${this.moveTimeLengthMs}`)}async waitForRun(e,t,s,a){for(;this.isCurrentlyWorking;)await new Promise((e=>setTimeout(e,100)));this.isCurrentlyWorking=!0,await this.getAnalsysForFenPosition(e,t,s,a)}async stopAndStartNewAnalysis(e){this.stockfishWorker.postMessage("stop"),this.getAnalsysForFenPosition(e,"",0)}sendDataToAnalysisOrchestrator(e){chrome.runtime.sendMessage({type:"stockfishToAnalysis",message:e})}handleMainMessage(e){const t=e;if(t.startsWith("bestmove")){this.whiteMove=!this.whiteMove;const e=this.stockfishParser.getAllData();var s=this.fillRestOfDataForAnalysisOrchestrator(e);this.stockfishParser.clearData(),this.sendDataToAnalysisOrchestrator(s),this.isCurrentlyWorking=!1}else this.stockfishParser.sendMessage(t,this.currentFEN)}}}},i={};function o(e){var t=i[e];if(void 0!==t)return t.exports;var s=i[e]={exports:{}};return r[e](s,s.exports,o),s.exports}e="function"==typeof Symbol?Symbol("webpack queues"):"__webpack_queues__",t="function"==typeof Symbol?Symbol("webpack exports"):"__webpack_exports__",s="function"==typeof Symbol?Symbol("webpack error"):"__webpack_error__",a=e=>{e&&e.d<1&&(e.d=1,e.forEach((e=>e.r--)),e.forEach((e=>e.r--?e.r++:e())))},o.a=(r,i,o)=>{var n;o&&((n=[]).d=-1);var c,h,l,p=new Set,u=r.exports,d=new Promise(((e,t)=>{l=t,h=e}));d[t]=u,d[e]=e=>(n&&e(n),p.forEach(e),d.catch((e=>{}))),r.exports=d,i((r=>{var i;c=(r=>r.map((r=>{if(null!==r&&"object"==typeof r){if(r[e])return r;if(r.then){var i=[];i.d=0,r.then((e=>{o[t]=e,a(i)}),(e=>{o[s]=e,a(i)}));var o={};return o[e]=e=>e(i),o}}var n={};return n[e]=e=>{},n[t]=r,n})))(r);var o=()=>c.map((e=>{if(e[s])throw e[s];return e[t]})),h=new Promise((t=>{(i=()=>t(o)).r=0;var s=e=>e!==n&&!p.has(e)&&(p.add(e),e&&!e.d&&(i.r++,e.push(i)));c.map((t=>t[e](s)))}));return i.r?h:o()}),(e=>(e?l(d[s]=e):h(u),a(n)))),n&&n.d<0&&(n.d=0)},o.d=(e,t)=>{for(var s in t)o.o(t,s)&&!o.o(e,s)&&Object.defineProperty(e,s,{enumerable:!0,get:t[s]})},o.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t);o(178)})();