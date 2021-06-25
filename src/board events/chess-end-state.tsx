import { Piece, Position } from "../piece";

/**
 * Checks (Win, Draw) states
 * @param {string} color The current player
 * @returns {number} -1, if Player won, 0, if it's a draw, 1, if the AI won, and any other number if there's no valid end state
 */
export function checkEndState(color: string, remainingPieces: { [key: string]: Array<Piece> }): number {

    /* 
        To check for dead position, either side must have only:
         - king against king;
         - king against king and bishop;
         - king against king and knight;
         - king and bishop against king and bishop, 
           with both bishops on squares of the same color.

        For simplicity reasons, we'll only check these cases
    */

    // First we check the obvious
    // King is either eaten, checkmated or in a stalemate
    let index = remainingPieces[color].findIndex(piece => piece.name === "King");

    // If we can't find the King - the opposite color wins
    if (index === -1)
        return color === "W" ? 1 : -1;


    // Because we're checking the board state, we only get a copy of the King piece
    let kingPiece = new Piece();
    kingPiece.fromData(remainingPieces[color][index]);

    // We're assuming movement calculation has been done
    // check if this piece has no moves and it's been checked
    if (kingPiece.moves.length === 0) {
        if (kingPiece.isAttacked)
            return color === "B" ? -1 : 1;

        // There are two cases when King has no moves:
        //  1) There are two or more pieces left of that color
        //      - This is not a valid end state
        //  2) There is only one piece - the King piece
        //      - This is the case of stalemate

        if (remainingPieces[color].length === 1)
            return 0;

        // There are two or more pieces left - check if all other pieces has no moves
        if (!remainingPieces[color].some(piece => piece.moves.length !== 0))
            return 0;

        return 2;
    }

    let whiteCount = remainingPieces["W"].length;
    let blackCount = remainingPieces["B"].length;

    // If we reached here, we have to check for dead position
    // It's only possible if both sides have less than or equal to 2 pieces
    if (whiteCount > 2 || blackCount > 2)
        return 2;

    // If both sides only have King piece - dead position
    if (whiteCount === 1 && blackCount === 1) {
        if (remainingPieces["W"][0].name === "King" && remainingPieces["B"][0].name === "King")
            return 0;
    }

    // If both sides have 2 pieces
    if (whiteCount === 2 && blackCount === 2) {
        let whiteIndex = remainingPieces["W"].findIndex(piece => piece.name === "Bishop");
        let blackIndex = remainingPieces["B"].findIndex(piece => piece.name === "Bishop");

        // If either side don't have a bishop - not a valid end state
        if (whiteIndex === -1 || blackIndex === -1)
            return 2;

        let whitePosition = new Position();
        let blackPosition = new Position();

        whitePosition.fromData(remainingPieces["W"][whiteIndex].position);
        blackPosition.fromData(remainingPieces["B"][whiteIndex].position);

        // If both sides have Bishops on the same colored squares: Dead Position
        // else: Not a valid end state
        if ((Math.abs(whitePosition.x - blackPosition.x) + Math.abs(whitePosition.y - blackPosition.y)) % 2 === 0)
            return 0;
        return 2;
    }

    // If we reached here, there's another dead position case: 1 King and 2 Opposite Pieces
    let largerCountColor = whiteCount > blackCount ? "W" : "B";

    // Find the piece other than King piece
    let otherPiece: string = "";

    // It's safe to use forEach since we know that there's only 2 pieces
    remainingPieces[largerCountColor].forEach(piece => {
        if (piece.name !== "King")
            otherPiece = piece.name;
    })

    if (["Bishop", "Knight"].includes(otherPiece)) {
        // This is a dead position
        return 0;
    }

    // We took care of all end states, all other states are not valid end states
    return 2;
}