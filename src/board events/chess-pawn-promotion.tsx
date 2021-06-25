import { Piece, Position } from "../piece";
import { handleChessMovement } from "./chess-movement";

/**
 * Promotes the Pawn by returning a new board and remainingPieces
 * @param {string} name The name of the promoted piece
 * @param {Position} position The position of the promoting piece on the board
 * @param {Array<Array<Piece>>} board The chess board
 * @param {{ [key: string]: Array<Piece> }} remainingPieces The remaining chess pieces on the board
 * @returns {[Array<Array<Piece>>, { [key: string]: Array<Piece> }]} The resulting board and remainingPieces
 */
export function promotePawn(name: string, position: Position, board: Array<Array<Piece>>, remainingPieces: { [key: string]: Array<Piece> })
    : [Array<Array<Piece>>, { [key: string]: Array<Piece> }] {


    // Set the name for this pawn to the given choice
    // Get the piece from remainingPieces
    let copyRemainingPieces = {
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

    let copyBoard = board.map(row => {
        return row.map(piece => {
            let newPiece = new Piece();
            newPiece.fromData(piece);

            return newPiece;
        });
    })

    let targetedPosition = new Position();
    targetedPosition.fromData(position);

    let targetedPiece = new Piece();

    // Find the piece
    let isFound = false;
    for (let rowIndex of [0, 7]) {
        for (let columnIndex = 0; columnIndex < 8; columnIndex++) {
            if (Position.isEqual(targetedPosition, new Position(columnIndex, rowIndex))) {
                targetedPiece.fromData(copyBoard[rowIndex][columnIndex]);

                // Change the name here
                copyBoard[rowIndex][columnIndex].promote(name);
                isFound = true;
                break;
            }
        }
        if (isFound)
            break;
    }

    let found = false;
    // Find the piece from remainingPiece too
    remainingPieces[targetedPiece.color].forEach(piece => {
        if (!found && piece.uid === targetedPiece.uid) {
            piece.promote(name);
            found = true;
        }
    });

    targetedPiece.promote(name);

    // To handle recalculation of moves and such, we'll use handleChessMovement
    const [newBoard, newRemainingPieces] = handleChessMovement(targetedPiece, targetedPosition, copyBoard, copyRemainingPieces);

    return [newBoard, newRemainingPieces];
}