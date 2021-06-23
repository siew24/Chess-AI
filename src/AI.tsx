import React from "react";
import { Piece, Position } from "./piece";
// A file which how the AI should interact with the game

var uniqueID = (function () {
    var id = 1;
    return function () { return id++; };  // Return and increment
})();

// Type for return both board and evaluation
type boardWithEvaluation = {
    board: Array<Array<Piece>>,
    evaluation: number
}

//Check behind the piece
function doublePawnChecking(board: Array<Array<Piece>>, remainingPieces: {[key: string]: Array<Piece>}, color:string):number {
    let count:number = 0;

    //Check the piece behind the pawn
    switch(color) {
        case "W":
            remainingPieces["W"].forEach((piece) => {
                if (piece.name.includes("Pawn") && piece.position.y > 1) {
                    if (board[piece.position.x][(piece.position.y)-1].name.includes("Pawn") && board[piece.position.x][(piece.position.y)-1].color == color) {
                        count++;
                    }
                }
            })
            break;
        
        case "B":
            remainingPieces["B"].forEach((piece) => {
                if (piece.name.includes("Pawn") && piece.position.y < 7) {
                    if (board[piece.position.x][(piece.position.y)+1].name.includes("Pawn") && board[piece.position.x][(piece.position.y)+1].color == color) {
                        count++;
                    }
                }
            })
            break;
    }

    return count;
}

//Evaluation function
function boardEvaluation(board: Array<Array<Piece>>, remainingPieces: {[key: string]: Array<Piece>}):number {
    let finalEvaluation:number = 0, remainingPieceEvaluation:number = 0;
    
    //Calculating remaining piece evaluation
    let blackRemaining:number = 0, whiteRemaining:number = 0;

    remainingPieces["W"].forEach((piece) => {
        switch(piece.name) {
            case "Pawn":
                whiteRemaining += 1;
                break;
            
            case "Knight": //Knight
                whiteRemaining += 3;
                break;

            case "Bishop": //Bishop
                whiteRemaining += 3;
                break;

            case "Rook": //Rook
                whiteRemaining += 5;
                break;

            case "Queen": //Queen
                whiteRemaining += 9;
                break;
        }
    })

    remainingPieces["B"].forEach((piece) => {
        switch(piece.name) {
            case "Pawn":
                blackRemaining += 1;
                break;
            
            case "Knight": //Knight
                blackRemaining += 3;
                break;

            case "Bishop": //Bishop
                blackRemaining += 3;
                break;

            case "Rook": //Rook
                blackRemaining += 5;
                break;

            case "Queen": //Queen
                blackRemaining += 9;
                break;
        }
    })

    remainingPieceEvaluation = (whiteRemaining-doublePawnChecking(board, remainingPieces, "W")) - (blackRemaining-doublePawnChecking(board, remainingPieces, "B"));

    finalEvaluation = remainingPieceEvaluation;

    return finalEvaluation;
}

// Copy Board Function
function copyBoard(board: Array<Array<Piece>>): Array<Array<Piece>> {

    let copiedBoard = board.map((row) => {
        let newRow = row.map((piece) => {
            let newPiece = new Piece();
            newPiece.fromData(piece);

            return newPiece;
        })

        return newRow;
    })

    return copiedBoard;
};

// Best Move Function
function bestMove(board: Array<Array<Piece>>, remainingPieces: {[key: string]: Array<Piece>}, depth:number, alpha:number, beta:number, state:number): boardWithEvaluation {
    if (depth = 0) {
        let evaluation: number = boardEvaluation(board, remainingPieces);

        return {
            "board": board,
            "evaluation": evaluation
        };
    }

    let bestBoard = Array<Array<Piece>>(8).fill([]).map(() => Array<Piece>(8).fill(new Piece()).map(() => new Piece()));

    if (state == 1) {
        remainingPieces['B'].forEach((piece) => {
            let moveList: Array<Position> = piece.moves;

            for(let move of moveList){

                // Add newBoard here
                let newBoard = copyBoard(board);

                // Castling Move
                if (Math.abs(piece.position.x-move.x)==2 && piece.name == "King") {
                    if(move.x == 3) {
                        let rookPiece = newBoard[1][piece.position.y];
                        newBoard[1][piece.position.y] = new Piece();

                        rookPiece.position = new Position(4, move.y);
                        
                        newBoard[4][move.y] = new Piece();
                        newBoard[4][move.y].fromData(rookPiece);
                    } else {
                        let rookPiece = newBoard[8][piece.position.y];
                        newBoard[8][piece.position.y] = new Piece();

                        rookPiece.position = new Position(6, move.y);
                        
                        newBoard[6][move.y] = new Piece();
                        newBoard[6][move.y].fromData(rookPiece);
                    }
                }

                newBoard[piece.position.x][piece.position.y] = new Piece();

                piece.position = new Position(move.x, move.y);

                newBoard[move.x][move.y] = new Piece();
                newBoard[move.x][move.y].fromData(piece);

                let evaluation: boardWithEvaluation = bestMove(newBoard, remainingPieces, depth-1, alpha, beta, 0);
                let alphaHolder: number = alpha;

                alphaHolder = Math.max(alphaHolder, evaluation.evaluation);

                if (beta <= alphaHolder) {
                    break;
                }

                alpha = alphaHolder;
            }
        })

        return {
            "board": bestBoard,
            "evaluation": alpha
        }
    } 
    else {
        remainingPieces['W'].forEach((piece) => {
            let moveList: Array<Position> = piece.moves;

            for(let move of moveList){

                // Add newBoard here
                let newBoard = copyBoard(board);

                // Castling Move
                if (Math.abs(piece.position.x-move.x)==2 && piece.name == "King") {
                    if(move.x == 3) {
                        let rookPiece = newBoard[1][piece.position.y];
                        newBoard[1][piece.position.y] = new Piece();

                        rookPiece.position = new Position(4, move.y);
                        
                        newBoard[4][move.y] = new Piece();
                        newBoard[4][move.y].fromData(rookPiece);
                    } else {
                        let rookPiece = newBoard[8][piece.position.y];
                        newBoard[8][piece.position.y] = new Piece();

                        rookPiece.position = new Position(6, move.y);
                        
                        newBoard[6][move.y] = new Piece();
                        newBoard[6][move.y].fromData(rookPiece);
                    }
                }

                newBoard[piece.position.x][piece.position.y] = new Piece();

                piece.position = new Position(move.x, move.y);
                
                newBoard[move.x][move.y] = new Piece();
                newBoard[move.x][move.y].fromData(piece);

                let evaluation: boardWithEvaluation = bestMove(newBoard, remainingPieces, depth-1, alpha, beta, 1);
                let betaHolder: number = beta;

                betaHolder = Math.min(betaHolder, evaluation.evaluation);

                if (betaHolder <= alpha) {
                    break;
                }

                beta = betaHolder;
            }
        })

        return {
            "board": bestBoard,
            "evaluation": beta
        }
    }
}

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

    //let botMove: boardWithEvaluation = bestMove(board, remainingPieces, 5, -99999, 99999, 1)
    //return botMove.board;

    return board;
}