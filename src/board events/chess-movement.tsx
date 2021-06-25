import { syncBoardwithRemainingPieces, syncRemainingPieceswithBoard } from "../helper functions/sync";
import { Piece, Position } from "../piece";

export function handleChessMovement(movingPiece: Piece, targetPosition: Position, board: Array<Array<Piece>>, remainingPieces: { [key: string]: Array<Piece> })
    : [Array<Array<Piece>>, { [key: string]: Array<Piece> }] {

    let playerColor = movingPiece.color;
    let opponentColor = playerColor === "B" ? "W" : "B";

    // Get a copy of the movingPiece
    let currentPiece = new Piece();
    currentPiece.fromData(movingPiece);

    // Before continuing, we check if the old position hasn't been lifted up
    if (board[currentPiece.position.y][currentPiece.position.x].uid === currentPiece.uid) {
        // Lift up the piece
        board[currentPiece.position.y][currentPiece.position.x] = new Piece();
    }

    // Check if the placement is an attack move
    // We have checked that it's either a move or an attack move
    // on the above
    if (board[targetPosition.y][targetPosition.x].name !== "") {
        // remove the unique piece from remainingPieces
        remainingPieces[opponentColor] = remainingPieces[opponentColor].filter(piece => board[targetPosition.y][targetPosition.x].uid !== piece.uid);
    }

    /*console.log("In handleChessMovement: ");
    console.log(`Black Pieces: ${remainingPieces["B"].length}`);
    console.log(`White Pieces: ${remainingPieces["W"].length}`);*/

    // Before placing down the piece, check if it's a King and it's a castling move
    if (currentPiece.name === "King" && Math.abs(currentPiece.position.x - targetPosition.x) === 2) {
        // Move the rook as well
        if (targetPosition.x < 4) {
            board[targetPosition.y][targetPosition.x + 1].fromData(board[targetPosition.y][0]);
            board[targetPosition.y][targetPosition.x + 1].position = new Position(targetPosition.x + 1, targetPosition.y);
            board[targetPosition.y][0] = new Piece();
        }
        else if (targetPosition.x > 4) {
            board[targetPosition.y][targetPosition.x - 1].fromData(board[targetPosition.y][7]);
            board[targetPosition.y][targetPosition.x - 1].position = new Position(targetPosition.x - 1, targetPosition.y);
            board[targetPosition.y][7] = new Piece();
        }
    }

    // Place down the piece
    currentPiece.position = new Position(targetPosition.x, targetPosition.y);
    currentPiece.setMoved();

    // Fill the current square with data of currentPiece
    board[targetPosition.y][targetPosition.x].fromData(currentPiece);

    // Calculate availableMoves for each piece on the board
    // the King Pieces have to be the last to be calculated
    let pieceList: Array<Piece> = [];
    board.forEach(row => {
        row.forEach(piece => {
            if (piece.uid !== -1) {
                if (piece.name === "King")
                    pieceList.push(piece);
                else
                    piece.availableMoves(board);
            }
        })
    });

    // Because board and remainingPieces are mutually exclusive, we have to
    // iterate through both remainingPieces and board and recalculate availableMoves
    syncRemainingPieceswithBoard(board, remainingPieces);

    // If a King Piece has been eaten
    if (pieceList.length === 1) {
        pieceList[0].availableMoves(board, remainingPieces[playerColor]);
    }
    else if (pieceList[0].color === opponentColor) {
        pieceList[0].availableMoves(board, remainingPieces[playerColor]);
        pieceList[1].availableMoves(board, remainingPieces[opponentColor]);
    }
    else {
        pieceList[1].availableMoves(board, remainingPieces[playerColor]);
        pieceList[0].availableMoves(board, remainingPieces[opponentColor]);
    }

    // Because board and remainingPieces are mutually exclusive, we have to
    // sync both variables
    syncRemainingPieceswithBoard(board, remainingPieces);
    Piece.restrictMovement(board, remainingPieces);
    syncBoardwithRemainingPieces(board, remainingPieces);

    return [board, remainingPieces];
}
