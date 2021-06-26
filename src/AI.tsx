import { handleChessMovement } from "./board events/chess-movement";
import { Piece, Position } from "./piece";

// A file which how the AI should interact with the game


// Custom type to return board, evaluation, alpha and beta value for each state
type boardWithEvaluation = {
    board: Array<Array<Piece>>,
    evaluation: number,
    alpha: number,
    beta: number
}

// Piece-Square Table
const pst: {[key: string]: Array<Array<number>>} = {
            'Pawn': [[ 0,  0,  0,  0,  0,  0,  0,  0],
                     [50, 50, 50, 50, 50, 50, 50, 50],
                     [10, 10, 20, 30, 30, 20, 10, 10],
                     [ 5,  5, 10, 25, 25, 10,  5,  5],  // PST for Pawn Piece
                     [ 0,  0,  0, 20, 20,  0,  0,  0],
                     [ 5, -5,-10,  0,  0,-10, -5,  5],
                     [ 5, 10, 10,-20,-20, 10, 10,  5],
                     [ 0,  0,  0,  0,  0,  0,  0,  0]],
                    
            'Knight': [[-50, -40, -30, -30, -30, -30, -40, -50],
                       [-40, -20,   0,   0,   0,   0, -20, -40],
                       [-30,   0,  10,  15,  15,  10,   0, -30],
                       [-30,   5,  15,  20,  20,  15,   5, -30],    // PST for Knight Piece
                       [-30,   0,  15,  20,  20,  15,   0, -30],
                       [-30,   5,  10,  15,  15,  10,   5, -30],
                       [-40, -20,   0,   5,   5,   0, -20, -40],
                       [-50, -40, -30, -30, -30, -30, -40, -50]],
                    
            'Bishop': [[-20, -10, -10, -10, -10, -10, -10, -20],
                       [-10,   0,   0,   0,   0,   0,   0, -10],
                       [-10,   0,   0,   0,   0,   0,   0, -10],
                       [-10,   5,   5,  10,  10,   5,   5, -10],    // PST for Bishop Piece
                       [-10,   0,  10,  10,  10,  10,   0, -10],
                       [-10,  10,  10,  10,  10,  10,  10, -10],
                       [-10,   5,   0,   0,   0,   0,   5, -10],
                       [-20, -10, -10, -10, -10, -10, -10, -20]],
                    
            'Rook': [[ 0,  0,  0,  0,  0,  0,  0,  0],
                     [ 5, 10, 10, 10, 10, 10, 10,  5],
                     [-5,  0,  0,  0,  0,  0,  0, -5],
                     [-5,  0,  0,  0,  0,  0,  5, -5],  // PST for Rook Piece
                     [-5,  0,  0,  0,  0,  0,  0, -5],
                     [-5,  0,  0,  0,  0,  0,  0, -5],
                     [-5,  0,  0,  0,  0,  0,  0, -5],
                     [ 0,  0,  0,  5,  5,  0,  0,  0]],
                    
            'Queen': [[-20, -10, -10, -5, -5, -10, -10, -20],
                      [-10,   0,   0,  0,  0,   0,   0, -10],
                      [-10,   0,   5,  5,  5,   5,   0, -10],
                      [ -5,   0,   5,  5,  5,   5,   0,  -5],   // PST for Queen Piece
                      [  0,   0,   5,  5,  5,   5,   0,  -5],
                      [-10,   5,   5,  5,  5,   5,   0,  -5],
                      [-10,   0,   5,  0,  0,   0,   0, -10],
                      [-20, -10, -10, -5, -5, -10, -10, -20]],
                    
            'King': [[-30, -40, -40, -50, -50, -40, -40, -30],
                     [-30, -40, -40, -50, -50, -40, -40, -30],
                     [-30, -40, -40, -50, -50, -40, -40, -30],
                     [-30, -40, -40, -50, -50, -40, -40, -30],  // PST for King Piece
                     [-20, -30, -30, -40, -40, -30, -30, -20],
                     [-10, -20, -20, -20, -20, -20, -20, -10],
                     [ 20,  20,   0,   0,   0,   0,  20,  20],
                     [ 20,  30,  10,   0,   0,  10,  30,  20]]
};

// To modify the Piece Value 
export function modifyPieceValue(piece: Piece) {

    let color = piece.color;

    // Check if the piece is a white piece or a black piece
    if (color === 'W') { // White Piece (Normal setting the piece value)
        
        piece.setValue(pst[piece.name][piece.position.y][piece.position.x]);
    
    } else { //Black Piece (The whole PST will be flipped upside down due to the black perspective, so 7-piece.position.y is used here to flip the y level)

        piece.setValue(pst[piece.name][7-piece.position.y][piece.position.x]);
    }
}

// Evaluation function
function boardEvaluation(remainingPieces: {[key: string]: Array<Piece>}):number {

    let finalEvaluation:number = 0, 
        remainingPieceEvaluation:number = 0, whiteRemaining:number = 0, blackRemaining:number = 0,
        placementEvaluation:number = 0, whitePlacement:number = 0, blackPlacement:number = 0;
    
    // Remaining Piece and Piece Placement Evaluation
    remainingPieces["W"].forEach((piece) => {  //ForEach loop to loop through whole remainingPieces["W"] array
        switch(piece.name) {
            case "Pawn":
                whiteRemaining += 1;
                whitePlacement += piece.value;
                break;
            
            case "Knight":
                whiteRemaining += 3;
                whitePlacement += piece.value;
                break;

            case "Bishop":
                whiteRemaining += 3;
                whitePlacement += piece.value;
                break;

            case "Rook":
                whiteRemaining += 5;
                whitePlacement += piece.value;
                break;

            case "Queen":
                whiteRemaining += 9;
                whitePlacement += piece.value;
                break;
            
            case "King":
                whiteRemaining += 900;
                whitePlacement += piece.value;
                break;
        }
    })

    remainingPieces["B"].forEach((piece) => {  //ForEach loop to loop through whole remainingPieces["B"] array
        switch(piece.name) {
            case "Pawn":
                blackRemaining += 1;
                blackPlacement += piece.value;
                break;
            
            case "Knight":
                blackRemaining += 3;
                blackPlacement += piece.value;
                break;

            case "Bishop":
                blackRemaining += 3;
                blackPlacement += piece.value;
                break;

            case "Rook":
                blackRemaining += 5;
                blackPlacement += piece.value;
                break;

            case "Queen":
                blackRemaining += 9;
                blackPlacement += piece.value;
                break;

            case "King":
                blackRemaining += 900;
                blackPlacement += piece.value;
                break;
        }
    })

    remainingPieceEvaluation = blackRemaining - whiteRemaining;
    placementEvaluation = blackPlacement - whitePlacement;

    finalEvaluation = remainingPieceEvaluation + placementEvaluation;

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

// To hold the best board state
let bestBoard = Array<Array<Piece>>(8).fill([]).map(() => Array<Piece>(8).fill(new Piece()).map(() => new Piece()));

// Best Move Function (Alpha Beta Pruning Implementation)
function bestMove(board: Array<Array<Piece>>, remainingPieces: {[key: string]: Array<Piece>}, depth:number, alpha:number, beta:number, state:number): boardWithEvaluation {
    
    if (depth === 0) {

        let evaluation: number = boardEvaluation(remainingPieces);
        
        return {
            "board": board,
            "evaluation": evaluation,
            "alpha": alpha,
            "beta": beta
        };
    }

    // Bot State (Black Move)
    if (state === 1) {

        remainingPieces['B'].forEach((piece) => { // Loop through whole 
            
            let moveList: Array<Position> = piece.moves;

            for(let move of moveList){

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

                const [newBoard, newRemainingPieces] = handleChessMovement(piece, move, copyBoard(board), copyRemainingPieces);

                let evaluation: boardWithEvaluation = bestMove(newBoard, newRemainingPieces, depth-1, alpha, beta, 0);

                let alphaHolder: number = alpha;

                alphaHolder = Math.max(alphaHolder, evaluation.evaluation);

                if (beta <= alphaHolder) {
                    break;
                }

                if (evaluation.beta !== Infinity && evaluation.alpha !== -Infinity) {
                    alpha = alphaHolder;
                    beta = evaluation.beta;
                } else {
                    alpha = alphaHolder;
                }

                if (depth === 3) {
                    bestBoard = copyBoard(newBoard);
                }
            }
        })

        return {
            "board": bestBoard,
            "evaluation": alpha,
            "alpha": alpha,
            "beta": beta
        }
    } 
    else { // Human State (White Move)

        remainingPieces['W'].forEach((piece) => {
        
            let moveList: Array<Position> = piece.moves;

            for(let move of moveList){

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

                const [newBoard, newRemainingPieces] = handleChessMovement(piece, move, copyBoard(board), copyRemainingPieces);
                
                let evaluation: boardWithEvaluation = bestMove(newBoard, newRemainingPieces, depth-1, alpha, beta, 1);

                let betaHolder: number = beta;

                betaHolder = Math.min(betaHolder, evaluation.evaluation);

                if (betaHolder <= alpha) {
                    break;
                }

                if (evaluation.beta !== Infinity && evaluation.alpha !== -Infinity) {
                    alpha = evaluation.alpha;
                    beta = betaHolder;
                } else {
                    beta = betaHolder;
                }

                if (depth === 3) {
                    bestBoard = copyBoard(newBoard);
                }
            }
        })

        return {
            "board": bestBoard,
            "evaluation": beta,
            "alpha": alpha,
            "beta": beta
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
    board[movePosition.y][movePosition.x].position.fromData(movePosition);

    // let value = uniqueID();

    // if (value === 1) {
    //     board[4][7].fromData(board[0][4]);
    //     board[4][7].position = new Position(7, 4);
    //     board[0][4] = new Piece();
    // }*/

    let botMove: boardWithEvaluation = bestMove(board, remainingPieces, 3, -Infinity, Infinity, 1);
    return botMove.board;

    //return board;
}