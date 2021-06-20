import React from 'react';

import { Board } from './board';
import { Position, Piece } from './piece';
import { doSomethingHere } from './AI';
import './index.css';

// Game should handle player states

interface GameStates {
    playerTurn: boolean,
    holdingPiece: Piece,
    isHolding: boolean,
    board: Array<Array<Piece>>,
    remainingPieces: {
        [key: string]: Array<Piece>
    }
}

export class Game extends React.Component<{}, GameStates> {
    constructor(props: {}) {
        super(props);

        const arrayPiece = Array<Piece>(8).fill(new Piece());

        this.state = {
            playerTurn: true,
            holdingPiece: new Piece(),
            isHolding: false,
            board: Array<Array<Piece>>(8).fill([]).map(() => arrayPiece.slice()
                .map(() => new Piece())),
            remainingPieces: {
                "W": Array<Piece>(16).fill(new Piece()).map(() => new Piece()),
                "B": Array<Piece>(16).fill(new Piece()).map(() => new Piece()),
            }
        };

        // Get copies
        let board = this.state.board.map(row => {
            return row.map(piece => {
                let newPiece = new Piece();
                newPiece.fromData(piece);

                return newPiece;
            })
        })
        let remainingPieces = this.state.remainingPieces;

        // The general layout of chess pieces
        const layout = [
            ["Rook", "Knight", "Bishop", "Queen", "King", "Bishop", "Knight", "Rook"],
            ["Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn"]];


        // Iterate through the layout and intialize remainingPieces
        layout.forEach((row, rowIndex) => {
            row.forEach((pieceName, columnIndex) => {
                remainingPieces["B"][(row.length * rowIndex) + columnIndex] = new Piece(pieceName, "B", new Position(columnIndex, rowIndex), false);
                remainingPieces["W"][(row.length * rowIndex) + columnIndex] = new Piece(pieceName, "W", new Position(columnIndex, 7 - rowIndex), false);
            })
        });

        // Iterate through the layout to initialize the layout
        layout.forEach((row, rowIndex) => {
            row.forEach((pieceName, columnIndex) => {
                board[0 + rowIndex][columnIndex].fromData(remainingPieces["B"][(row.length * rowIndex) + columnIndex]);

                board[7 - rowIndex][columnIndex].fromData(remainingPieces["W"][(row.length * rowIndex) + columnIndex]);
            })
        });

        // We can just iterate through remainingPieces and update their availableMoves
        remainingPieces["W"].forEach(piece => {
            let isFound = false;
            for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
                for (let columnIndex = 0; columnIndex < board[rowIndex].length; columnIndex++) {
                    if (board[rowIndex][columnIndex].uid === piece.uid) {

                        if (piece.name === "King") {
                            piece.availableMoves(board, remainingPieces["B"]);
                            board[rowIndex][columnIndex].availableMoves(board, remainingPieces["B"]);
                        }
                        else {
                            piece.availableMoves(board);
                            board[rowIndex][columnIndex].availableMoves(board);
                        }
                        isFound = true;
                        break;
                    }
                }

                if (isFound)
                    break;
            }

        });
        remainingPieces["B"].forEach(piece => {
            let isFound = false;
            for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
                for (let columnIndex = 0; columnIndex < board[rowIndex].length; columnIndex++) {
                    if (board[rowIndex][columnIndex].uid === piece.uid) {

                        if (piece.name === "King") {
                            piece.availableMoves(board, remainingPieces["W"]);
                            board[rowIndex][columnIndex].availableMoves(board, remainingPieces["W"]);
                        }
                        else {
                            piece.availableMoves(board);
                            board[rowIndex][columnIndex].availableMoves(board);
                        }
                        isFound = true;
                        break;
                    }
                }

                if (isFound)
                    break;
            }
        });

        // Hacky way to modify state
        this.state.board.forEach((row, rowIndex) => {
            row.forEach((piece, columnIndex) => {
                piece.fromData(board[rowIndex][columnIndex]);
            })
        });

        console.log(this.state.board);
    }

    _handleAI(board: Array<Array<Piece>>, remainingPieces: { [key: string]: Array<Piece> }): Array<Array<Piece>> {
        // After some calculation, a best board state from the AI will be given here
        return doSomethingHere(board, remainingPieces);
    }

    onPiecePickup(i: number, j: number) {

        let board = this.state.board.map(row => {
            return row.map(piece => {
                let newPiece = new Piece();
                newPiece.fromData(piece);

                return newPiece;
            });
        });

        if (this.state.holdingPiece.name === "" && board[i][j].name !== "" && board[i][j].color === "W") {
            console.log(`Picked up ${board[i][j].name}`)
            // console.log(`Position: ${board[i][j].position}`)

            this.setState({ isHolding: true });

            const holdingPiece = new Piece();
            holdingPiece.fromData(board[i][j]);

            this.setState({ holdingPiece: holdingPiece });

            board[i][j] = new Piece();  // Clear the cell

            console.log(`Holding: ${holdingPiece.name}`)
            console.log(`${holdingPiece.name}'s moves (id: ${holdingPiece.uid}):`)

            console.dir(holdingPiece.moves);
        }

        this.setState({ board: board });
    }

    onPiecePlace(i: number, j: number) {
        // Here we'll handle how the player interacts with the game

        let board = this.state.board.map(row => {
            return row.map(piece => {
                let newPiece = new Piece();
                newPiece.fromData(piece);

                return newPiece;
            });
        });

        // If the player is holding a piece
        if (this.state.holdingPiece.name !== "") {

            console.log(`Trying to place it down...`);

            let currentPiece = new Piece();
            currentPiece.fromData(this.state.holdingPiece);

            // If the clicked area is not a valid move
            if (!currentPiece.moves.find(value => value.x === j && value.y === i))
                return;

            // If the clicked area is an opposite color piece but not a valid attack move
            else if (board[i][j].name !== "" && board[i][j].color !== currentPiece.color &&
                !currentPiece.attacks.find(value => value.x === j && value.y === i)) {
                console.log("Not a valid attack move")
                return;
            }

            console.log(`Valid placement!`);
            this.setState({ isHolding: false });

            const [newBoard, remainingPieces] = this.handleChessMovement(board, i, j);

            // Hacky way to modify state
            this.state.board.forEach((row, rowIndex) => {
                row.forEach((piece, columnIndex) => {
                    piece.fromData(newBoard[rowIndex][columnIndex]);
                })
            });

            remainingPieces["W"].forEach((piece, index) => this.state.remainingPieces["W"][index].fromData(piece))
            let toDeleteAmount = this.state.remainingPieces["W"].length - remainingPieces["W"].length;

            while (toDeleteAmount > 0) {
                this.state.remainingPieces["W"].pop();
                toDeleteAmount--;
            }


            remainingPieces["B"].forEach((piece, index) => this.state.remainingPieces["B"][index].fromData(piece))
            toDeleteAmount = this.state.remainingPieces["B"].length - remainingPieces["B"].length;

            while (toDeleteAmount > 0) {
                this.state.remainingPieces["B"].pop();
                toDeleteAmount--;
            }
        }
    }

    handleChessMovement(board: Array<Array<Piece>>, i: number, j: number)
        : [Array<Array<Piece>>, { [key: string]: Array<Piece> }] {

        // Get a copy of remainingPieces state
        let remainingPieces = {
            "W": this.state.remainingPieces["W"].map(value => {
                let newPiece = new Piece();
                newPiece.fromData(value);
                return value;
            }),
            "B": this.state.remainingPieces["B"].map(value => {
                let newPiece = new Piece();
                newPiece.fromData(value);
                return value;
            })
        };

        // Get a copy of holdingPiece
        let currentPiece = new Piece();
        currentPiece.fromData(this.state.holdingPiece);

        // Check if the placement is an attack move
        // We have checked that it's either a move or an attack move
        // on the above
        if (board[i][j].name !== "") {

            // Find the unique piece from remainingPieces
            let eatenPieceIndex = remainingPieces["B"].findIndex(piece => board[i][j].uid === piece.uid);

            remainingPieces["B"].splice(eatenPieceIndex, 1);
        }

        console.log(`Black Piece Count: ${remainingPieces["B"].length}`)

        // Before placing down the piece, check if it's a King and it's a castling move
        if (currentPiece.name === "King" && Math.abs(currentPiece.position.x - j) === 2) {
            // Move the rook as well
            if (j < 4) {
                board[i][j + 1].fromData(board[i][0]);
                board[i][0] = new Piece();
            }
            else if (j > 4) {
                board[i][j - 1].fromData(board[i][7]);
                board[i][7] = new Piece();
            }
        }

        // 

        // Place down the piece
        currentPiece.position = new Position(j, i);
        currentPiece.setMoved();

        // Fill the current square with data of currentPiece
        board[i][j].fromData(currentPiece);

        // Because board and remainingPieces are mutually exclusive, we have to
        // iterate through both remainingPieces and board and recalculate availableMoves
        remainingPieces["W"].forEach(piece => {
            for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
                for (let columnIndex = 0; columnIndex < board[rowIndex].length; columnIndex++) {
                    if (board[rowIndex][columnIndex].uid === piece.uid) {

                        if (piece.name === "King") {
                            piece.availableMoves(board, remainingPieces["B"]);
                            board[rowIndex][columnIndex].availableMoves(board, remainingPieces["B"]);
                        }
                        else {
                            piece.availableMoves(board);
                            board[rowIndex][columnIndex].availableMoves(board);
                        }
                    }
                }
            }

        });
        remainingPieces["B"].forEach(piece => {
            for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
                for (let columnIndex = 0; columnIndex < board[rowIndex].length; columnIndex++) {
                    if (board[rowIndex][columnIndex].uid === piece.uid) {

                        if (piece.name === "King") {
                            piece.availableMoves(board, remainingPieces["W"]);
                            board[rowIndex][columnIndex].availableMoves(board, remainingPieces["W"]);
                        }
                        else {
                            piece.availableMoves(board);
                            board[rowIndex][columnIndex].availableMoves(board);
                        }
                    }
                }
            }
        });

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

        return [board, remainingPieces];
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
                    onPiecePickup: (i: number, j: number) => this.onPiecePickup(i, j),
                    onPiecePlace: (i: number, j: number) => this.onPiecePlace(i, j),
                    isHolding: this.state.isHolding,
                    board: this.state.board,
                    remainingPieces: this.state.remainingPieces
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