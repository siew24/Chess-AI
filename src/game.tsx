import React from 'react';

import { Board } from './board';
import { Position, Piece } from './piece';
import { doSomethingHere } from './AI';
import './index.css';

// Game should handle player states

interface GameStates {
    playerTurn: boolean,
    holdingPiece: Piece,
    isHolding: boolean
}

export class Game extends React.Component<{}, GameStates> {
    constructor(props: {}) {
        super(props);

        this.state = {
            playerTurn: true,
            holdingPiece: new Piece(),
            isHolding: false
        };
    }

    _handleAI(board: Array<Array<Piece>>, remainingPieces: { [key: string]: Array<Piece> }): Array<Array<Piece>> {
        // After some calculation, a best board state from the AI will be given here
        return doSomethingHere(board, remainingPieces);
    }

    onPiecePickup(board: Array<Array<Piece>>, i: number, j: number) {

        if (this.state.holdingPiece.name === "" && board[i][j].name !== "" && board[i][j].color === "W") {
            console.log(`Picked up ${board[i][j].name}`)
            // console.log(`Position: ${board[i][j].position}`)

            this.setState({ isHolding: true });

            const holdingPiece = board[i][j];

            this.setState({ holdingPiece: holdingPiece });

            board[i][j] = new Piece();  // Clear the cell

            console.log(`Holding: ${holdingPiece.name}`)
            console.log(`${holdingPiece.name}'s moves:`)

            console.dir(holdingPiece.moves);
        }
        return board;
    }

    onPiecePlace(board: Array<Array<Piece>>, remainingPieces: { [key: string]: Array<Piece> }, i: number, j: number) {
        // Here we'll handle how the player interacts with the game

        // If the player is holding a piece
        if (this.state.holdingPiece.name !== "") {

            console.log(`Trying to place it down...`);

            let currentPiece = this.state.holdingPiece;

            // If the clicked area is not a valid move
            if (!currentPiece.moves.find(value => value.x === j && value.y === i))
                return board;

            // If the clicked area is an opposite color piece but not a valid attack move
            else if (board[i][j].name !== "" && board[i][j].color !== currentPiece.color &&
                !currentPiece.attacks.find(value => value.x === j && value.y === i)) {
                console.log("Not a valid attack move")
                return board;
            }

            console.log(`Valid placement!`);
            this.setState({ isHolding: false });

            // Before placing down the piece, check if it's a castling move
            if (currentPiece.name === "King" && Math.abs(currentPiece.position.x - j) == 2) {
                // Move the rook as well
                if (j < 4) {
                    board[i][j + 1] = board[i][0];
                    board[i][0] = new Piece();
                }
                else if (j > 4) {
                    board[i][j - 1] = board[i][7];
                    board[i][7] = new Piece();
                }
            }

            // Place down the piece
            currentPiece.position = new Position(j, i);
            currentPiece.setMoved();

            // Get the current square to reference remainingPieces
            board[i][j] = currentPiece;

            // Because board references from remainingPieces, we can directly
            // Iterate through remainingPieces and recalculate availableMoves
            remainingPieces["W"].forEach(piece => piece.name === "King" ? piece.availableMoves(board, remainingPieces["B"]) : piece.availableMoves(board));
            remainingPieces["B"].forEach(piece => piece.name === "King" ? piece.availableMoves(board, remainingPieces["W"]) : piece.availableMoves(board))

            // After a succesful move, it'll become the AI's turn
            this.setState({
                holdingPiece: new Piece()
            });

            console.log(`AI is currently calculating the best move...`);

            // We'll pass by value into _handleAI
            // Right now deep cloning everything to new variables
            let remainingCopy = {
                "W": remainingPieces["W"].map(value => {
                    let newPiece = new Piece();
                    newPiece.fromData(value);
                    return value;
                }),
                "B": remainingPieces["B"].map(value => {
                    let newPiece = new Piece();
                    newPiece.fromData(value);
                    return value;
                })
            };

            let boardCopy: Array<Array<Piece>> = [];

            board.forEach((row, columnIndex) => {
                boardCopy.push([]);
                row.forEach((piece, rowIndex) => {
                    boardCopy[columnIndex].push(new Piece());
                    boardCopy[columnIndex][rowIndex].fromData(piece);
                });
            });

            const newBoard = this._handleAI(boardCopy, remainingCopy);

            // From the newBoard, we can determine which piece has been moved/eaten
            // Update remainingPiece according to the moved piece and the possibly eaten piece
            // Do the logic here

            console.log(`Back in game.tsx and flipping back to player's turn!`);
        }

        return board;
    }

    render() {

        let boardElement = React.createElement(
            'div',
            {
                className: "game-board",
                // onMouseEnter: () => console.log("Mouse entered Chess Board"),
                // onMouseLeave: () => console.log("Mouse left Chess Board"),
            },
            React.createElement(
                Board,
                {
                    playerTurn: this.state.playerTurn,
                    onPiecePickup: (board: Array<Array<Piece>>, i: number, j: number) => this.onPiecePickup(board, i, j),
                    onPiecePlace: (board: Array<Array<Piece>>, remainingPieces: { [key: string]: Array<Piece> }, i: number, j: number) => this.onPiecePlace(board, remainingPieces, i, j),
                    isHolding: this.state.isHolding
                }
            )
        )
        return (
            <div className="game">
                {boardElement}
                <div className="game-info">
                    <div>{/* status */}</div>
                    <div>{/* TODO */}</div>
                </div>
            </div>
        );
    }
}