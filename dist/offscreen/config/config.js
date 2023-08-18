export var Config;
(function (Config) {
    Config.STOCKFISH_MOVETIME = 5000;
    let MOVE_TYPE;
    (function (MOVE_TYPE) {
        MOVE_TYPE[MOVE_TYPE["MOVE_REGULAR"] = 0] = "MOVE_REGULAR";
        MOVE_TYPE[MOVE_TYPE["MOVE_CAPTURE"] = 1] = "MOVE_CAPTURE";
        MOVE_TYPE[MOVE_TYPE["MOVE_CHECK"] = 2] = "MOVE_CHECK";
        MOVE_TYPE[MOVE_TYPE["MOVE_MATE"] = 3] = "MOVE_MATE";
        MOVE_TYPE[MOVE_TYPE["MOVE_NONE"] = 4] = "MOVE_NONE";
    })(MOVE_TYPE = Config.MOVE_TYPE || (Config.MOVE_TYPE = {}));
    ;
    let TILE_COLORS;
    (function (TILE_COLORS) {
        TILE_COLORS[TILE_COLORS["ACTIVE"] = 0] = "ACTIVE";
        TILE_COLORS[TILE_COLORS["INACTIVE"] = 1] = "INACTIVE";
    })(TILE_COLORS = Config.TILE_COLORS || (Config.TILE_COLORS = {}));
    ;
    let ANALYSIS_FOR;
    (function (ANALYSIS_FOR) {
        ANALYSIS_FOR[ANALYSIS_FOR["WHITE"] = 0] = "WHITE";
        ANALYSIS_FOR[ANALYSIS_FOR["BLACK"] = 1] = "BLACK";
        ANALYSIS_FOR[ANALYSIS_FOR["BOTH"] = 2] = "BOTH";
    })(ANALYSIS_FOR = Config.ANALYSIS_FOR || (Config.ANALYSIS_FOR = {}));
    Config.Colors = {
        "brilliant": "rgba(15, 255, 243, 1)",
        "great": "rgba(107, 111, 229, 1)",
        "best": "gray",
        "good": "gray",
        "gray": "gray",
        "mistake": "red",
    };
    Config.CssDictForTiles = {
        "brilliant": "brilliant_tile",
        "great": "great_tile",
        "best": "yellow_tile",
        "good": "yellow_tile",
        "gray": "yellow_tile",
        "mistake": "mistake_tile",
    };
    Config.pointSizes = {
        "brilliant": 3,
        "great": 3,
        "best": 1,
        "good": 1,
        "gray": 1,
        "mistake": 1,
    };
    let PROMOTION;
    (function (PROMOTION) {
        PROMOTION[PROMOTION["QUEEN"] = 0] = "QUEEN";
        PROMOTION[PROMOTION["ROOK"] = 1] = "ROOK";
        PROMOTION[PROMOTION["BISHOP"] = 2] = "BISHOP";
        PROMOTION[PROMOTION["KNIGHT"] = 3] = "KNIGHT";
    })(PROMOTION = Config.PROMOTION || (Config.PROMOTION = {}));
    ;
    Config.PROMOTION_TO_CHAR = {
        0: "q",
        1: "r",
        2: "n",
        3: "b"
    };
    Config.PROMOTION_CHAR_TO_IMAGE_URL = {
        "q": "/img/chesspieces/wikipedia/bQ.png",
        "r": "/img/chesspieces/wikipedia/bR.png",
        "n": "/img/chesspieces/wikipedia/bN.png",
        "b": "/img/chesspieces/wikipedia/bB.png",
    };
})(Config || (Config = {}));
