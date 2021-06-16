import React from 'react';

import { Board } from './board';
import { availableMoves, Piece } from './piece';
import { doSomethingHere } from './AI';
import './index.css';

// Game should handle player states

interface GameStates {
    playerTurn: boolean,
    holdingPiece: Piece
}

export class Game extends React.Component<{}, GameStates> {
    constructor(props: {}) {
        super(props);

        this.state = {
            playerTurn: true,
            holdingPiece: {
                name: "",
                color: "",
                position: { x: 0, y: 0 },
                hasMoved: false,
                isAttacked: false
            }
        };
    }

    _handleAI(board: Array<Array<Piece>>, remainingPieces: { [key: string]: Array<Piece> }): Array<Array<Piece>> {
        // After some calculation, a best board state from the AI will be given here
        return doSomethingHere(board, remainingPieces);
    }

    onPiecePickup(board: Array<Array<Piece>>, i: number, j: number) {

        console.log(`Trying to enter onPiecePickup with player turn ${this.state.playerTurn}`)

        if (this.state.playerTurn && board[i][j].name !== "" && board[i][j].color === "W") {
            console.log(`Picked up ${board[i][j].name}`)

            const holdingPiece = this.state.holdingPiece;
            holdingPiece.name = board[i][j].name.slice();
            holdingPiece.color = "W";
            holdingPiece.position.x = board[i][j].position.x;
            holdingPiece.position.y = board[i][j].position.y;
            holdingPiece.hasMoved = !board[i][j].hasMoved;
            holdingPiece.isAttacked = board[i][j].isAttacked;

            this.setState({ holdingPiece: holdingPiece });

            board[i][j].name = "";  // Clear the cell

            console.log(`Holding: ${this.state.holdingPiece.name}`)
        }
        return board;
    }

    onPiecePlace(board: Array<Array<Piece>>, remainingPieces: { [key: string]: Array<Piece> }, i: number, j: number) {
        // Here we'll handle how the player interacts with the game

        // If the player is holding a piece
        if (this.state.playerTurn && this.state.holdingPiece.name !== "") {

            console.log(`Trying to place it down...`);

            // First fetch the available moves
            const moves = availableMoves(board, this.state.holdingPiece);

            // // If the clicked area is not a valid move
            // if (!moves.includes([i, j]))
            //     return board;

            console.log(`Valid placement!`);

            board[i][j] = this.state.holdingPiece;

            // After a succesful move, it'll become the AI's turn
            this.setState({
                holdingPiece: {
                    name: "",
                    color: "",
                    position: { x: 0, y: 0 },
                    hasMoved: false,
                    isAttacked: false
                }
            });

            console.log(`AI is currently calculating the best move...`);
            const newBoard = this._handleAI(board, remainingPieces);

            console.log(`Back in game.tsx and flipping back to player's turn!`);

            console.log(`PlayerTurn: ${this.state.playerTurn}`);

            return newBoard;
        }

        return board;
    }

    render() {

        let boardElement = React.createElement(
            'div',
            {
                className: "game-board",
                onMouseEnter: () => console.log("Mouse entered Chess Board"),
                onMouseLeave: () => console.log("Mouse left Chess Board"),
            },
            React.createElement(
                Board,
                {
                    playerTurn: this.state.playerTurn,
                    onPiecePickup: (board: Array<Array<Piece>>, i: number, j: number) => this.onPiecePickup(board, i, j),
                    onPiecePlace: (board: Array<Array<Piece>>, remainingPieces: { [key: string]: Array<Piece> }, i: number, j: number) => this.onPiecePlace(board, remainingPieces, i, j)
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