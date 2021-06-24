import React from "react";
import { Game } from "./game";
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

// Check behind the piece
function doublePawnChecking(board: Array<Array<Piece>>, remainingPieces: {[key: string]: Array<Piece>}, color:string):number {
    let count:number = 0;

    //Check the piece behind the pawn
    switch(color) {
        case "W":
            remainingPieces["W"].forEach((piece) => {
                if (piece.name.includes("Pawn") && piece.position.y > 1) {
                    if (board[(piece.position.y)-1][piece.position.x].name.includes("Pawn") && board[(piece.position.y)-1][piece.position.x].color === color) {
                        count++;
                    }
                }
            })
            break;
        
        case "B":
            remainingPieces["B"].forEach((piece) => {
                if (piece.name.includes("Pawn") && piece.position.y < 7) {
                    if (board[(piece.position.y)+1][piece.position.y].name.includes("Pawn") && board[(piece.position.y)+1][piece.position.x].color === color) {
                        count++;
                    }
                }
            })
            break;
    }

    return count;
}

// Center Distance Calculation
function centerDistance(piecePosition: Position): Array<number> {
    let center: Array<Array<number>> = [[4,4],[4,5],[5,4],[5,5]];
    let distanceArray: Array<number> = [0,0,0,0];

    for (let i = 0; i<4; i++) {
        distanceArray[i] = Math.sqrt(Math.pow(((piecePosition.x+1)-center[i][0]),2) + Math.pow(((piecePosition.y+1)-center[i][1]),2));
    }

    return distanceArray;
}

// Piece Value Comparison (Attacks)
function pieceComparison(board: Array<Array<Piece>>, attackingPiece: Piece): number {
    let value: number = 0;

    switch(attackingPiece.name) {
        case "Pawn":
            value = 1;
            break;
            
        case "Knight":
            value = 3;
            break;

        case "Bishop":
            value = 3;
            break;

        case "Rook":
            value = 5;
            break;

        case "Queen":
            value = 9;
            break;
    }

    attackingPiece.attacks.forEach((attackMove) => {
        switch(board[attackMove.y][attackMove.x].name) {
            case "Pawn":
                value += 1;
                break;
                
            case "Knight":
                value += 3;
                break;

            case "Bishop":
                value += 3;
                break;

            case "Rook":
                value += 5;
                break;

            case "Queen":
                value += 9;
                break;
        }
    })

    return value;
}

// Evaluation function
function boardEvaluation(board: Array<Array<Piece>>, remainingPieces: {[key: string]: Array<Piece>}):number {
    let finalEvaluation:number = 0, remainingPieceEvaluation:number = 0, pawnCenterControlEvaluation:number = 0, attackingPieceEvaluation:number = 0;
    
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

    remainingPieceEvaluation = (blackRemaining-doublePawnChecking(board, remainingPieces, "B")) - (whiteRemaining-doublePawnChecking(board, remainingPieces, "W"));

    // Calculate Pawn Center Control
    let blackCenterControl:number = 0, whiteCenterControl:number = 0;

    remainingPieces["W"].forEach((piece) => {
        switch(piece.name) {
            case "Pawn":
                let pawnControl: Array<number> = centerDistance(piece.position);

                for (let i = 0; i < 4; i++) {
                    whiteCenterControl += pawnControl[i];
                }

                whiteCenterControl = 40 - whiteCenterControl;

                break;
            
            case "Knight": //Knight
                let knightControl: Array<number> = centerDistance(piece.position);

                for (let i = 0; i < 4; i++) {
                    whiteCenterControl += knightControl[i];
                }

                whiteCenterControl = 50 - whiteCenterControl;

                break;

            case "Bishop": //Bishop
                let bishopControl: Array<number> = centerDistance(piece.position);

                for (let i = 0; i < 4; i++) {
                    whiteCenterControl += bishopControl[i];
                }

                whiteCenterControl = 30 - whiteCenterControl;

                break;

            case "Rook": //Rook
                let rookControl: Array<number> = centerDistance(piece.position);

                for (let i = 0; i < 4; i++) {
                    whiteCenterControl += rookControl[i];
                }

                whiteCenterControl = 37 - whiteCenterControl;
                
                break;

            case "Queen": //Queen
                let queenControl: Array<number> = centerDistance(piece.position);

                for (let i = 0; i < 4; i++) {
                    whiteCenterControl += queenControl[i];
                }

                whiteCenterControl = 39 - whiteCenterControl;

                break;
        }
    })

    remainingPieces["B"].forEach((piece) => {
        switch(piece.name) {
            case "Pawn":
                let pawnControl: Array<number> = centerDistance(piece.position);

                for (let i = 0; i < 4; i++) {
                    blackCenterControl += pawnControl[i];
                }

                blackCenterControl = 40 - blackCenterControl;

                break;
            
            case "Knight": //Knight
                let knightControl: Array<number> = centerDistance(piece.position);

                for (let i = 0; i < 4; i++) {
                    blackCenterControl += knightControl[i];
                }

                blackCenterControl = 50 - blackCenterControl;

                break;

            case "Bishop": //Bishop
                let bishopControl: Array<number> = centerDistance(piece.position);

                for (let i = 0; i < 4; i++) {
                    blackCenterControl += bishopControl[i];
                }

                blackCenterControl = 30 - blackCenterControl;

                break;

            case "Rook": //Rook
                let rookControl: Array<number> = centerDistance(piece.position);

                for (let i = 0; i < 4; i++) {
                    blackCenterControl += rookControl[i];
                }

                blackCenterControl = 37 - blackCenterControl;
                
                break;

            case "Queen": //Queen
                let queenControl: Array<number> = centerDistance(piece.position);

                for (let i = 0; i < 4; i++) {
                    blackCenterControl += queenControl[i];
                }

                blackCenterControl = 39 - blackCenterControl;

                break;
        }
    })

    pawnCenterControlEvaluation = blackCenterControl - whiteCenterControl;

    // Calculate Attacking Piece
    let whiteAttackingValue: number = 0, blackAttackingValue: number = 0;

    remainingPieces["W"].forEach((piece) => {
        whiteAttackingValue += pieceComparison(board, piece);
    })

    remainingPieces["B"].forEach((piece) => {
        blackAttackingValue += pieceComparison(board, piece);
    })

    attackingPieceEvaluation = blackAttackingValue - whiteAttackingValue;

    finalEvaluation = remainingPieceEvaluation + pawnCenterControlEvaluation + attackingPieceEvaluation;

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

// Holding the bestBoardState
let bestBoard = Array<Array<Piece>>(8).fill([]).map(() => Array<Piece>(8).fill(new Piece()).map(() => new Piece()));

// Best Move Function
function bestMove(board: Array<Array<Piece>>, remainingPieces: {[key: string]: Array<Piece>}, depthLimit:number, depth:number, alpha:number, beta:number, state:number): boardWithEvaluation {
    if (depth === 0) {
        let evaluation: number = boardEvaluation(board, remainingPieces);

        return {
            "board": board,
            "evaluation": evaluation
        };
    }

    if (state === 1) {
        remainingPieces['B'].forEach((piece) => {
            let moveList: Array<Position> = piece.moves;

            for(let move of moveList){

                // Add newBoard here
                let newBoard = copyBoard(board);

                // Castling Move
                if (Math.abs(piece.position.x-move.x)===2 && piece.name === "King") {
                    if(move.x === 2) {
                        let rookPiece = newBoard[piece.position.y][0];
                        newBoard[piece.position.y][0] = new Piece();

                        rookPiece.position = new Position(move.y, 3);
                        
                        newBoard[move.y][3] = new Piece();
                        newBoard[move.y][3].fromData(rookPiece);
                    } else {
                        let rookPiece = newBoard[piece.position.y][7];
                        newBoard[piece.position.y][7] = new Piece();

                        rookPiece.position = new Position(move.y, 5);
                        
                        newBoard[move.y][5] = new Piece();
                        newBoard[move.y][5].fromData(rookPiece);
                    }
                }

                newBoard[move.y][move.x].fromData(piece);
                newBoard[piece.position.y][piece.position.x] = new Piece();
                newBoard[move.y][move.x].position.fromData(move);

                Game.syncRemainingPieceswithBoard(board, remainingPieces);
                Piece.restrictMovement(board, remainingPieces);
                Game.syncBoardwithRemainingPieces(board, remainingPieces);

                /*newBoard[piece.position.y][piece.position.x] = new Piece();

                piece.position = new Position(move.y, move.x);

                newBoard[move.y][move.x] = new Piece();
                newBoard[move.y][move.x].fromData(piece);*/

                let evaluation: boardWithEvaluation = bestMove(newBoard, remainingPieces, depthLimit, depth-1, alpha, beta, 0);
                let alphaHolder: number = alpha;

                alphaHolder = Math.max(alphaHolder, evaluation.evaluation);

                if (beta <= alphaHolder) {
                    break;
                }

                alpha = alphaHolder;
                bestBoard = copyBoard(newBoard);
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
                if (Math.abs(piece.position.x-move.x)===2 && piece.name === "King") {
                    if(move.x === 2) {
                        let rookPiece = newBoard[piece.position.y][0];
                        newBoard[piece.position.y][0] = new Piece();

                        rookPiece.position = new Position(move.y, 3);
                        
                        newBoard[move.y][3] = new Piece();
                        newBoard[move.y][3].fromData(rookPiece);
                    } else {
                        let rookPiece = newBoard[piece.position.y][7];
                        newBoard[piece.position.y][7] = new Piece();

                        rookPiece.position = new Position(move.y, 5);
                        
                        newBoard[move.y][5] = new Piece();
                        newBoard[move.y][5].fromData(rookPiece);
                    }
                }

                newBoard[move.y][move.x].fromData(piece);
                newBoard[piece.position.y][piece.position.x] = new Piece();
                newBoard[move.y][move.x].position.fromData(move);

                Game.syncRemainingPieceswithBoard(board, remainingPieces);
                Piece.restrictMovement(board, remainingPieces);
                Game.syncBoardwithRemainingPieces(board, remainingPieces);

                /*newBoard[piece.position.y][piece.position.x] = new Piece();

                piece.position = new Position(move.y, move.x);
                
                newBoard[move.y][move.x] = new Piece();
                newBoard[move.y][move.x].fromData(piece);*/

                let evaluation: boardWithEvaluation = bestMove(newBoard, remainingPieces, depthLimit, depth-1, alpha, beta, 1);
                let betaHolder: number = beta;

                betaHolder = Math.min(betaHolder, evaluation.evaluation);

                if (betaHolder <= alpha) {
                    break;
                }

                beta = betaHolder;
                bestBoard = copyBoard(newBoard);
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
    /*let max = remainingPieces["B"].length;
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
    board[movePosition.y][movePosition.x].position.fromData(movePosition); */

    // let value = uniqueID();

    // if (value === 1) {
    //     board[4][7].fromData(board[0][4]);
    //     board[4][7].position = new Position(7, 4);
    //     board[0][4] = new Piece();
    // }

    let botMove: boardWithEvaluation = bestMove(board, remainingPieces, 1, 1, -99999, 99999, 1)
    return botMove.board;

    //return board;
}