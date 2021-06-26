import { syncBoardwithRemainingPieces, syncRemainingPieceswithBoard } from "../helper functions/sync";
import { Piece, Position } from "../piece";

export function handleChessMovement(movingPiece: Piece, targetPosition: Position, board: Array<Array<Piece>>, remainingPieces: { [key: string]: Array<Piece> }, isRecursive: boolean = false)
    : [Array<Array<Piece>>, { [key: string]: Array<Piece> }] {

    // Get copies of given parameters
    let copyBoard = board.map(row => row.map(piece => {
        let newPiece = new Piece();
        newPiece.fromData(piece);

        return newPiece;
    }))
    let copyRemaining = {
        "W": remainingPieces["W"].map(piece => {
            let newPiece = new Piece();
            newPiece.fromData(piece);

            return newPiece;
        }),
        "B": remainingPieces["B"].map(piece => {
            let newPiece = new Piece();
            newPiece.fromData(piece);

            return newPiece;
        })
    };

    let playerColor = movingPiece.color;
    let opponentColor = playerColor === "B" ? "W" : "B";

    // Get a copy of the movingPiece
    let currentPiece = new Piece();
    currentPiece.fromData(movingPiece);

    // Before continuing, we check if the old position hasn't been lifted up
    if (copyBoard[currentPiece.position.y][currentPiece.position.x].uid === currentPiece.uid) {
        // Lift up the piece
        copyBoard[currentPiece.position.y][currentPiece.position.x] = new Piece();
    }

    // Check if the placement is an attack move
    // We have checked that it's either a move or an attack move
    // on the above
    if (copyBoard[targetPosition.y][targetPosition.x].name !== "") {
        // remove the unique piece from remainingPieces
        copyRemaining[(opponentColor as "W" | "B")] = copyRemaining[(opponentColor as "W" | "B")].filter(piece => copyBoard[targetPosition.y][targetPosition.x].uid !== piece.uid);
    }

    console.log("In handleChessMovement: ");
    console.log(`Black Pieces: ${remainingPieces["B"].length}`);
    console.log(`White Pieces: ${remainingPieces["W"].length}`);

    // Before placing down the piece, check if it's a King and it's a castling move
    if (currentPiece.name === "King" && Math.abs(currentPiece.position.x - targetPosition.x) === 2) {
        // Move the rook as well
        if (targetPosition.x < 4) {
            copyBoard[targetPosition.y][targetPosition.x + 1].fromData(copyBoard[targetPosition.y][0]);
            copyBoard[targetPosition.y][targetPosition.x + 1].position = new Position(targetPosition.x + 1, targetPosition.y);
            copyBoard[targetPosition.y][0] = new Piece();
        }
        else if (targetPosition.x > 4) {
            copyBoard[targetPosition.y][targetPosition.x - 1].fromData(copyBoard[targetPosition.y][7]);
            copyBoard[targetPosition.y][targetPosition.x - 1].position = new Position(targetPosition.x - 1, targetPosition.y);
            copyBoard[targetPosition.y][7] = new Piece();
        }
    }

    // Place down the piece
    currentPiece.position = new Position(targetPosition.x, targetPosition.y);
    currentPiece.setMoved();

    // Fill the current square with data of currentPiece
    copyBoard[targetPosition.y][targetPosition.x].fromData(currentPiece);

    // Calculate availableMoves for each piece on the board
    // the King Pieces have to be the last to be calculated
    let pieceList: Array<Piece> = [];
    copyBoard.forEach(row => {
        row.forEach(piece => {
            if (piece.uid !== -1) {
                if (piece.name === "King")
                    pieceList.push(piece);
                else
                    piece.availableMoves(copyBoard);
            }
        })
    });

    // Because board and remainingPieces are mutually exclusive, we have to
    // iterate through both remainingPieces and board and recalculate availableMoves
    syncRemainingPieceswithBoard(copyBoard, copyRemaining);

    // If a King Piece has been eaten
    if (pieceList.length === 1) {
        pieceList[0].availableMoves(copyBoard, copyRemaining[(playerColor as "W" | "B")]);
    }
    else if (pieceList[0].color === opponentColor) {
        pieceList[0].availableMoves(copyBoard, copyRemaining[(playerColor as "W" | "B")]);
        pieceList[1].availableMoves(copyBoard, copyRemaining[(opponentColor as "W" | "B")]);
    }
    else {
        pieceList[1].availableMoves(copyBoard, copyRemaining[(playerColor as "W" | "B")]);
        pieceList[0].availableMoves(copyBoard, copyRemaining[(opponentColor as "W" | "B")]);
    }

    // Because board and remainingPieces are mutually exclusive, we have to
    // sync both variables
    syncRemainingPieceswithBoard(copyBoard, copyRemaining);
    let newRemaining = Piece.restrictMovement(copyBoard, copyRemaining, isRecursive);
    syncBoardwithRemainingPieces(copyBoard, newRemaining);

    return [copyBoard, newRemaining];
}
