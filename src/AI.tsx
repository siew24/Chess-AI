import { handleChessMovement } from "./board events/chess-movement";
import { promotePawn } from "./board events/chess-pawn-promotion";
import { Piece, Position } from "./piece";

// A file which how the AI should interact with the game

// Control the depth of the algorithm
let depthLimit = 3;

// Custom type to return board, evaluation, alpha and beta value for each state
type boardWithEvaluation = {
    board: Array<Array<Piece>>,
    evaluation: number,
    alpha: number,
    beta: number
}

// Evaluation function
function boardEvaluation(remainingPieces: { [key: string]: Array<Piece> }): number {

    let finalEvaluation: number = 0,
        remainingPieceEvaluation: number = 0, whiteRemaining: number = 0, blackRemaining: number = 0,
        placementEvaluation: number = 0, whitePlacement: number = 0, blackPlacement: number = 0;

    // Remaining Piece and Piece Placement Evaluation
    remainingPieces["W"].forEach((piece) => {  //ForEach loop to loop through whole remainingPieces["W"] array
        switch (piece.name) {
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
        switch (piece.name) {
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

// Attacking Move Evaluation
function attackEvaluation(board: Array<Array<Piece>>, piece: Piece, move: Position): number {

    let attackValue = 0;

    switch (piece.name) {
        case "Pawn":
            attackValue += 1;
            break;

        case "Knight":
            attackValue += 3;
            break;

        case "Bishop":
            attackValue += 3;
            break;

        case "Rook":
            attackValue += 5;
            break;

        case "Queen":
            attackValue += 9;
            break;

        case "King":
            attackValue += 900;
            break;
    }

    switch (board[move.y][move.x].name) {
        case "Pawn":
            attackValue += 1;
            break;

        case "Knight":
            attackValue += 3;
            break;

        case "Bishop":
            attackValue += 3;
            break;

        case "Rook":
            attackValue += 5;
            break;

        case "Queen":
            attackValue += 9;
            break;

        case "King":
            attackValue += 900;
            break;
    }

    return attackValue;
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

// Copy Remaining Pieces Function
function cloneRemainingPieces(remainingPieces: { [key: string]: Array<Piece> }): { [key: string]: Array<Piece> } {

    return {
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

}

// To hold the best board state
let bestBoard = Array<Array<Piece>>(8).fill([]).map(() => Array<Piece>(8).fill(new Piece()).map(() => new Piece()));

// Best Move Function (Alpha Beta Pruning Implementation)
function bestMove(board: Array<Array<Piece>>, remainingPieces: { [key: string]: Array<Piece> }, depth: number, alpha: number, beta: number, attackValue: number, state: number): boardWithEvaluation {

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

            for (let move of moveList) {

                let copyRemainingPieces = cloneRemainingPieces(remainingPieces);

                if (board[move.y][move.x].name !== "") {
                    attackValue += attackEvaluation(board, piece, move);
                }

                const [newBoard, newRemainingPieces] = handleChessMovement(piece, move, copyBoard(board), copyRemainingPieces);

                let returnBoard = copyBoard(newBoard), returnRemainingPieces = cloneRemainingPieces(newRemainingPieces);

                if (newBoard[move.y][move.x].name === "Pawn" && move.y === 7) {

                    let evaluationHold = -Infinity;

                    ["Bishop", "Knight", "Rook", "Queen"].forEach((promotion) => {
                        const [promotionBoard, promotionRemainingPieces] = promotePawn(promotion, move, newBoard, newRemainingPieces);

                        let promotionEvaluation = boardEvaluation(promotionRemainingPieces);

                        if (evaluationHold < promotionEvaluation) {
                            evaluationHold = promotionEvaluation;
                            returnBoard = promotionBoard;
                            returnRemainingPieces = promotionRemainingPieces;
                        }
                    })
                }

                let evaluation: boardWithEvaluation = bestMove(returnBoard, returnRemainingPieces, depth - 1, alpha, beta, attackValue, 0);

                let alphaHolder: number = alpha;

                alphaHolder = Math.max(alphaHolder, evaluation.evaluation + attackValue);

                if (beta <= alphaHolder) {
                    break;
                }

                alpha = alphaHolder;
                
                if (depth === depthLimit) {
                    bestBoard = copyBoard(returnBoard);
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

            for (let move of moveList) {

                let copyRemainingPieces = cloneRemainingPieces(remainingPieces);

                if (board[move.y][move.x].name !== "") {
                    attackValue -= attackEvaluation(board, piece, move);
                }

                const [newBoard, newRemainingPieces] = handleChessMovement(piece, move, copyBoard(board), copyRemainingPieces);

                let returnBoard = copyBoard(newBoard), returnRemainingPieces = cloneRemainingPieces(newRemainingPieces);

                if (newBoard[move.y][move.x].name === "Pawn" && move.y === 0) {

                    let evaluationHold = Infinity;

                    ["Bishop", "Knight", "Rook", "Queen"].forEach((promotion) => {
                        const [promotionBoard, promotionRemainingPieces] = promotePawn(promotion, move, newBoard, newRemainingPieces);

                        let promotionEvaluation = boardEvaluation(promotionRemainingPieces);

                        if (evaluationHold < promotionEvaluation) {
                            evaluationHold = promotionEvaluation;
                            returnBoard = promotionBoard;
                            returnRemainingPieces = promotionRemainingPieces;
                        }
                    })
                }

                let evaluation: boardWithEvaluation = bestMove(returnBoard, returnRemainingPieces, depth - 1, alpha, beta, attackValue, 1);

                let betaHolder: number = beta;

                betaHolder = Math.min(betaHolder, evaluation.evaluation - attackValue);

                if (betaHolder <= alpha) {
                    break;
                }

                beta = betaHolder;

                if (depth === depthLimit) {
                    bestBoard = copyBoard(returnBoard);
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

    let botMove: boardWithEvaluation = bestMove(board, remainingPieces, depthLimit, -Infinity, Infinity, 0, 1);
    return botMove.board;

    //return board;
}