import React from "react";
import { Piece, Position } from "./piece";
// A file which how the AI should interact with the game

// This function should return a 2D array
export function doSomethingHere(board: Array<Array<Piece>>, remainingPieces: { [key: string]: Array<Piece> }): Array<Array<Piece>> {

    // To test if the "AI" works, a random piece will be chosen
    let max = remainingPieces["B"].length;
    let movePiece = new Piece();

    do {
        let pieceIndex = Math.floor(Math.random() * max);

        movePiece.fromData(remainingPieces['B'][pieceIndex]);

    } while (movePiece.moves.length === 0);

    // We'll choose a random move to do
    max = movePiece.moves.length;

    let movePositionIndex = Math.floor(Math.random() * max);

    let movePosition = movePiece.moves[movePositionIndex];

    // Now we move this piece
    board[movePosition.y][movePosition.x].fromData(movePiece);
    board[movePiece.position.y][movePiece.position.x] = new Piece();

    // Set the movePiece's position to the new position
    board[movePosition.y][movePosition.x].position.fromData(movePosition);

    // if (board[0][5].uid !== -1) {
    //     board[4][1].fromData(board[0][5]);

    //     board[4][1].position = new Position(1, 4);

    //     board[0][5] = new Piece();
    // }

    return board;
}