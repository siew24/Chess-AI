import { promotePawn } from "./board events/chess-pawn-promotion";
import { Piece } from "./piece";
// A file which how the AI should interact with the game

// var uniqueID = (function () {
//     var id = 1;
//     return function () { return id++; };  // Return and increment
// })();

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

    console.log(`Chosen Piece: ${movePiece.name} @ ${String.fromCharCode("A".charCodeAt(0) + movePiece.position.x)}${8 - movePiece.position.y} -> ${String.fromCharCode("A".charCodeAt(0) + movePosition.x)}${8 - movePosition.y}`)

    // Now we move this piece
    board[movePosition.y][movePosition.x].fromData(movePiece);
    board[movePiece.position.y][movePiece.position.x] = new Piece();

    // Set the movePiece's position to the new position
    board[movePosition.y][movePosition.x].position.fromData(movePosition);

    // If the moved piece is a pawn
    if (board[movePosition.y][movePosition.x].name === "Pawn" && board[movePosition.y][movePosition.x].position.y === 7) {
        // Get a random name for promotion
        max = ["Bishop", "Knight", "Rook", "Queen"].length;
        let name = ["Bishop", "Knight", "Rook", "Queen"][Math.floor(Math.random() * max)];
        const [newBoard,] = promotePawn(name, movePosition, board, remainingPieces)

        return newBoard;
    }

    // let value = uniqueID();

    // if (value === 1) {
    //     board[2][3].fromData(board[1][3]);
    //     board[2][3].position = new Position(3, 2);
    //     board[1][3] = new Piece();
    // }

    return board;
}