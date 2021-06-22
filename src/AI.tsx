import React from "react";
import { Piece, Position } from "./piece";
// A file which how the AI should interact with the game

var uniqueID = (function () {
    var id = 1;
    return function () { return id++; };  // Return and increment
})();

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

    // let value = uniqueID();

    // if (value === 1) {
    //     board[6][3].fromData(board[0][0]);
    //     board[6][3].position = new Position(3, 6);
    //     board[0][0] = new Piece();

    //     board[3][0].fromData(board[1][0]);
    //     board[3][0].position = new Position(0, 3);
    //     board[1][0] = new Piece();

    //     board[2][2].fromData(board[1][2]);
    //     board[2][2].position = new Position(2, 2);
    //     board[1][2] = new Piece();

    //     board[2][1].fromData(board[1][1]);
    //     board[2][1].position = new Position(1, 2);
    //     board[1][1] = new Piece();

    //     board[2][0].fromData(board[0][3]);
    //     board[2][0].position = new Position(0, 2);
    //     board[0][3] = new Piece();
    // }
    // if (value === 2) {
    //     board[0][0].fromData(board[6][3]);
    //     board[0][0].position = new Position(0, 0);
    //     board[6][3] = new Piece();

    //     board[1][2].fromData(board[0][1]);
    //     board[1][2].position = new Position(2, 1);
    //     board[0][1] = new Piece();

    //     board[1][0].fromData(board[0][2]);
    //     board[1][0].position = new Position(0, 1);
    //     board[0][2] = new Piece();
    // }
    // if (value === 3) {
    //     board[4][0].fromData(board[1][3]);
    //     board[4][0].position = new Position(0, 4);
    //     board[1][3] = new Piece();

    //     board[0][2].fromData(board[0][4]);
    //     board[0][2].position = new Position(2, 0);
    //     board[0][4] = new Piece();

    // }
    // if (value >= 4) {
    //     console.log("AI King's Moves: ");
    //     console.log(board[0][2].moves);
    // }

    return board;
}