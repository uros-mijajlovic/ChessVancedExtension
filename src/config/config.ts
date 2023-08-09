export namespace Config{
    export const STOCKFISH_MOVETIME=500;
    export enum MOVE_TYPE {
        MOVE_REGULAR,
        MOVE_CAPTURE,
        MOVE_CHECK,
        MOVE_MATE,
        MOVE_NONE,
    };
    export enum TILE_COLORS {
        ACTIVE,
        INACTIVE
    };
    export enum ANALYSIS_FOR{
        WHITE,
        BLACK, 
        BOTH
    }
    export const Colors = {
        "brilliant":"rgba(15, 255, 243, 1)",
        "great":"rgba(107, 111, 229, 1)",
        "best" : "gray",
        "good" :"gray",
        "gray" : "gray",
        "mistake" : "red",
    }
    export const CssDictForTiles={
        "brilliant":"brilliant_tile",
        "great":"great_tile",
        "best" : "yellow_tile",
        "good" : "yellow_tile",
        "gray" : "yellow_tile",
        

        "mistake" : "mistake_tile",
    }
    export const pointSizes={
        "brilliant":3,
        "great":3,
        "best" : 1,
        "good" : 1,
        "gray" : 1,
        "mistake" : 1,
    }
    
    export enum PROMOTION {
        QUEEN,
        ROOK,
        BISHOP,
        KNIGHT,
    };
    export const PROMOTION_TO_CHAR : { [key: number]: string } = {
        0:"q",
        1:"r",
        2:"n",
        3:"b"
    };
    export const PROMOTION_CHAR_TO_IMAGE_URL = {
        "q":"/img/chesspieces/wikipedia/bQ.png",
        "r":"/img/chesspieces/wikipedia/bR.png",
        "n":"/img/chesspieces/wikipedia/bN.png",
        "b":"/img/chesspieces/wikipedia/bB.png",
    };
    
    
}