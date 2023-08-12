import { Chess } from './dependencies/chess.js';

export function moveStringArrayToFenArray(moveStringArray) {

    const chess = new Chess();
    const fenArray = [];
    fenArray.push(chess.fen());
    for (const move of moveStringArray) {
        chess.move(move);
        fenArray.push(chess.fen());
    }
    return fenArray;
}


export function PgnToFenArr(pgnString) {
    const chessjs = Chess();
    chessjs.load_pgn(pgnString);
    const moves = chessjs.history();
    var fenMoves = [];
    const newChessjs = Chess();
    fenMoves.push(newChessjs.fen());
    moves.forEach((move, index) => {
        newChessjs.move(move);
        fenMoves.push(newChessjs.fen());
    });
    return fenMoves;
}
export function PgnToMoveArr(pgnString) {
    const chessjs = Chess();
    chessjs.load_pgn(pgnString);
    const moves = chessjs.history({ verbose: true });
    moves.forEach((move, index) => {
        move.fromto = move.from + move.to;
    });
    return moves;
}
const pieceValues = {
    q: 9,
    r: 5,
    b: 3,
    n: 3,
    p: 1,
    k: 0,
};
function intToSquare(square) {
    const file = String.fromCharCode(97 + (square % 8)); // 'a' + column index (0 to 7)
    const rank = 8 - Math.floor(square / 8); // 8 - row index (0 to 7)
    return file + rank;
}
function makeCapture(board, uciMoveString) {
    board.move({ from: uciMoveString.substring(0, 2), to: uciMoveString.substring(2, 4) });
}
function undoCapture(board) {
    board.undo();
}
function other(side) {
    return side === 'w' ? 'b' : 'w';
}
function getAttackers(board, side, tile) {
    const moves = board.moves({ verbose: true });
    var attackers = [];
    for (const move of moves) {
        if (move.to == tile) {
            attackers.push(move.from);
        }
    }
    return attackers;
}
function getSmallestAttackerForSquare(board, tile, side) {
    const piece = board.get(tile);
    if (piece && piece.color === side) {
        return [-1, -1];
    }
    const attackers = getAttackers(board, side, tile);
    let smallestPiece = null;
    let smallestPieceSquare = -1;
    for (const a of attackers) {
        const attackingPiece = board.get(a).type;
        if (smallestPiece === null || (valueOfPiece(attackingPiece) < valueOfPiece(smallestPiece))) {
            smallestPiece = attackingPiece;
            smallestPieceSquare = a;
        }
    }
    return [smallestPiece, smallestPieceSquare];
}
function see(board, square, side) {
    if (side != board.turn()) {
        const swappedFen = swapFenSide(board.fen());
        board = Chess(swappedFen);
    }
    let value = 0;
    const pieceOnTheSquare = board.get(square);
    if (pieceOnTheSquare == null) {
        return 0;
    }
    if (pieceOnTheSquare.color == side) {
        return 0;
    }
    const [piece, squareFrom] = getSmallestAttackerForSquare(board, square, side);
    const pieceJustCaptured = pieceOnTheSquare.type;
    if (piece && pieceJustCaptured) {
        const uciMoveString = `${squareFrom}${square}`;
        makeCapture(board, uciMoveString);
        value = Math.max(0, valueOfPiece(pieceJustCaptured) - see(board, square, other(side)));
        undoCapture(board);
    }
    return value;
}
function valueOfPiece(piece) {
    const pieceStr = piece.toLowerCase();
    return pieceValues[pieceStr];
}
function swapFenSide(fen) {
    var splittedString = fen.split(" ");
    if (splittedString[1] == "w") {
        splittedString[1] = "b";
    }
    else {
        splittedString[1] = "w";
    }
    fen = splittedString.join(" ");
    return fen;
}
function getSideFromFen(fen) {
    return fen.split(" ")[1];
}
function findMaxMaterialLoss(fen, turn) {
    let maxMaterialLoss = 0;
    if (getSideFromFen(fen) != turn) {
        fen = swapFenSide(fen);
    }
    for (let i = 0; i < 64; i++) {
        maxMaterialLoss = Math.max(maxMaterialLoss, findMaterialLossForSquare(fen, intToSquare(i), turn));
    }
    return maxMaterialLoss;
}
function findMaterialLossForSquare(fen, square, turn) {
    const board = Chess(fen);
    return see(board, square, turn);
}
function calculateSidesMaterial(fen, side) {
    const chess = Chess();
    chess.load(fen);
    let sideMaterial = 0;
    for (let square = 0; square < 64; square++) {
        const squareString = intToSquare(square);
        const piece = chess.get(squareString);
        if (piece !== null && piece.color === side) {
            const pieceType = piece.type;
            const pieceValue = valueOfPiece(pieceType);
            sideMaterial += pieceValue;
        }
    }
    return sideMaterial;
}
function isForced(fenString) {
    const board = Chess(fenString);
    if (board.in_check()) {
        if (board.moves.length == 1) {
            return true;
        }
    }
    return false;
}
export function didSacrificeIncrease(fenAfterLast, fenBetween, fenAfter, lastMove) {
    if (isForced(fenBetween)) {
        return false;
    }
    const turn = getSideFromFen(fenAfterLast);
    const materialWon = calculateSidesMaterial(fenAfterLast, turn) - calculateSidesMaterial(fenAfter, turn);
    const materialLossAfter = findMaxMaterialLoss(fenAfter, turn);
    const materialLossBefore = findMaxMaterialLoss(fenAfterLast, turn);
    const materialLossOriginSquare = findMaterialLossForSquare(fenBetween, lastMove.substring(0, 2), turn);
    const materialLossTargetSquare = findMaterialLossForSquare(fenAfter, lastMove.substring(2, 4), turn);
    //console.log("moveSpecificMaterialLoss ", materialLossOriginSquare, materialLossTargetSquare);
    //console.log(materialWon)
    //console.log(materialLossAfter, materialLossBefore)
    if (materialLossOriginSquare + 1 + materialWon < materialLossTargetSquare) {
        return true;
    }
    if (materialWon) {
        return 0 < materialLossAfter - materialLossBefore - materialWon;
    }
    else {
        return 1 < materialLossAfter - materialLossBefore - materialWon;
    }
}
