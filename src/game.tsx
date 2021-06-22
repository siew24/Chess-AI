import React from 'react';

import { Board } from './board';
import { Position, Piece } from './piece';
import { doSomethingHere } from './AI';
import { Popup } from './popup';
import './index.css';

// Game should handle player states

interface GameStates {
    playerTurn: boolean,
    holdingPiece: Piece,
    isHolding: boolean,
    board: Array<Array<Piece>>,
    boardHighlight: Array<Array<boolean>>,
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
            boardHighlight: Array<Array<boolean>>(8).fill([]).map(
                () => Array<boolean>(8).fill(false).map(() => false)),
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
    }

    /** Throws in current board and remainingPieces state to the AI */
    _handleAI(board: Array<Array<Piece>>, remainingPieces: { [key: string]: Array<Piece> }): Array<Array<Piece>> {
        // After some calculation, a best board state from the AI will be given here
        return doSomethingHere(board, remainingPieces);
    }

    /** 
     * Checks (Win, Draw) states
     * @returns {number} -1, if Player won, 0, if it's a draw, 1, if the AI won, and any other number if there's no valid end state
     */
    _checkEndState(board: Array<Array<Piece>>, remainingPieces: { [key: string]: Array<Piece> }): number {
        return 2;
    }

    /** Updates remainingPieces with the newer info from the Board */
    syncRemainingPieceswithBoard(board: Array<Array<Piece>>, remainingPieces: { [key: string]: Array<Piece> }): void {
        remainingPieces["W"].forEach(piece => {
            for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
                for (let columnIndex = 0; columnIndex < board[rowIndex].length; columnIndex++) {
                    if (board[rowIndex][columnIndex].uid === piece.uid) {
                        // Fetch updated data from Board piece
                        piece.fromData(board[rowIndex][columnIndex]);
                    }
                }
            }
        }
        );
        remainingPieces["B"].forEach(piece => {
            for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
                for (let columnIndex = 0; columnIndex < board[rowIndex].length; columnIndex++) {
                    if (board[rowIndex][columnIndex].uid === piece.uid) {
                        // Fetch updated data from Board piece
                        piece.fromData(board[rowIndex][columnIndex]);
                    }
                }
            }
        }
        );
    }

    /** Updates the Board with the newer info from remainingPieces */
    syncBoardwithRemainingPieces(board: Array<Array<Piece>>, remainingPieces: { [key: string]: Array<Piece> }): void {
        remainingPieces["W"].forEach(piece => {
            for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
                for (let columnIndex = 0; columnIndex < board[rowIndex].length; columnIndex++) {
                    if (board[rowIndex][columnIndex].uid === piece.uid) {
                        // Update positions
                        if (board[piece.position.y][piece.position.x].uid !== -1) {
                            // An opposite piece has been eaten
                            remainingPieces["B"] = remainingPieces["B"].filter(oppositePiece => {
                                return oppositePiece.uid !== board[piece.position.y][piece.position.x].uid;
                            });
                        }

                        board[piece.position.y][piece.position.x].fromData(piece);

                    }
                }
            }
        }

        );
        remainingPieces["B"].forEach(piece => {
            for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
                for (let columnIndex = 0; columnIndex < board[rowIndex].length; columnIndex++) {
                    if (board[rowIndex][columnIndex].uid === piece.uid) {
                        // Update positions
                        if (board[piece.position.y][piece.position.x].uid !== -1) {
                            // An opposite piece has been eaten
                            remainingPieces["W"] = remainingPieces["W"].filter(oppositePiece => {
                                return oppositePiece.uid !== board[piece.position.y][piece.position.x].uid;
                            });
                        }

                        piece.position.fromData(board[rowIndex][columnIndex].position);
                    }
                }
            }
        });
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

            // Fetch a copy of boardHighlight
            let boardHighlight = this.state.boardHighlight.map(row => {
                return row.map(square => square);
            })

            // Set all available moves to be highlighted
            holdingPiece.moves.forEach(move => {
                boardHighlight[move.y][move.x] = true;
            });

            // Set the state
            this.setState({
                boardHighlight: boardHighlight.map(row => {
                    return row.map(square => square);
                })
            });

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

            // If the clicked area is the original position of the piece
            if (currentPiece.position.x === j && currentPiece.position.y === i) {
                board[i][j].fromData(currentPiece);
                this.setState({ holdingPiece: new Piece() });
                this.setState({ isHolding: false });

                // Remove move highlights
                let boardHighlight = this.state.boardHighlight.map(row => {
                    return row.map(square => square);
                });

                currentPiece.moves.forEach(move => boardHighlight[move.y][move.x] = false);

                this.setState({
                    boardHighlight: boardHighlight.map(row => {
                        return row.map(square => square);
                    })
                });

                // Hacky way to modify state
                this.state.board.forEach((row, rowIndex) => {
                    row.forEach((piece, columnIndex) => {
                        piece.fromData(board[rowIndex][columnIndex]);
                    })
                });

                return;
            }
            // If the clicked area is an opposite color piece but not a valid attack move
            else if (board[i][j].name !== "" && board[i][j].color !== currentPiece.color &&
                !currentPiece.attacks.find(value => value.x === j && value.y === i)) {
                console.log("Not a valid attack move")
                return;
            }
            // If the clicked area is not a valid move
            else if (!currentPiece.moves.find(value => value.x === j && value.y === i))
                return;

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

        // Remove move highlights
        let boardHighlight = this.state.boardHighlight.map(row => {
            return row.map(square => square);
        });

        currentPiece.moves.forEach(move => boardHighlight[move.y][move.x] = false);

        this.setState({
            boardHighlight: boardHighlight.map(row => {
                return row.map(square => square);
            })
        });

        // Check if the placement is an attack move
        // We have checked that it's either a move or an attack move
        // on the above
        if (board[i][j].name !== "") {
            // remove the unique piece from remainingPieces
            remainingPieces["B"] = remainingPieces["B"].filter(piece => board[i][j].uid !== piece.uid);
        }

        // Before placing down the piece, check if it's a King and it's a castling move
        if (currentPiece.name === "King" && Math.abs(currentPiece.position.x - j) === 2) {
            // Move the rook as well
            if (j < 4) {
                board[i][j + 1].fromData(board[i][0]);
                board[i][j + 1].position = new Position(j + 1, i);
                board[i][0] = new Piece();
            }
            else if (j > 4) {
                board[i][j - 1].fromData(board[i][7]);
                board[i][j - 1].position = new Position(j - 1, i);
                board[i][7] = new Piece();
            }
        }

        // Place down the piece
        currentPiece.position = new Position(j, i);
        currentPiece.setMoved();

        // Fill the current square with data of currentPiece
        board[i][j].fromData(currentPiece);

        // Calculate availableMoves for each piece on the board
        board.forEach(row => {
            row.forEach(piece => {
                if (piece.uid !== -1) {
                    if (piece.name === "King")
                        piece.availableMoves(board, remainingPieces[piece.color === "B" ? "W" : "B"]);
                    else
                        piece.availableMoves(board);
                }
            })
        });

        // Because board and remainingPieces are mutually exclusive, we have to
        // sync both variables
        this.syncRemainingPieceswithBoard(board, remainingPieces);
        Piece.restrictMovement(board, remainingPieces);
        this.syncBoardwithRemainingPieces(board, remainingPieces);

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

        // Using remainingPieces, we can determine which piece has been moved/eaten
        // Update remainingPiece according to the moved piece and the possibly eaten piece
        for (let pieceIndex = 0; pieceIndex < remainingPieces["B"].length; pieceIndex++) {

            // Get a reference of the current piece
            let piece = remainingPieces["B"][pieceIndex];

            // If the piece's position is not on the newBoard
            if (newBoard[piece.position.y][piece.position.x].uid !== piece.uid) {
                // We found the moved piece
                // First remove the piece from board
                board[piece.position.y][piece.position.x] = new Piece();

                // We now find the same piece from the newBoard
                let isFound = false;
                for (let rowIndex = 0; rowIndex < newBoard.length; rowIndex++) {
                    for (let columnIndex = 0; columnIndex < newBoard[rowIndex].length; columnIndex++) {
                        if (newBoard[rowIndex][columnIndex].uid === piece.uid) {
                            // We found the corresponding piece from newBoard
                            // assign this position to piece
                            piece.position.fromData(newBoard[rowIndex][columnIndex].position);
                            isFound = true;
                            break;
                        }
                    }

                    if (isFound)
                        break;
                }

                // Check if the new position is occupied by an opposite piece
                if (board[piece.position.y][piece.position.x].uid !== -1 &&
                    board[piece.position.y][piece.position.x].color !== piece.color) {

                    // We first remove this piece from remainingPiece
                    remainingPieces["W"] = remainingPieces["W"].filter(element => element.uid !== board[piece.position.y][piece.position.x].uid);
                }

                // We now can add the moved piece back to the board
                board[piece.position.y][piece.position.x].fromData(piece);

                break;
            }
        }
        // End of AI's turn
        console.log(`Back in game.tsx and flipping back to player's turn!`);

        // Calculate availableMoves for each piece on the board
        board.forEach(row => {
            row.forEach(piece => {
                if (piece.uid !== -1) {
                    if (piece.name === "King")
                        piece.availableMoves(board, remainingPieces[piece.color === "B" ? "W" : "B"]);
                    else
                        piece.availableMoves(board);
                }
            })
        });

        // Because board and remainingPieces are mutually exclusive, we have to
        // iterate through both remainingPieces and board and recalculate availableMoves
        this.syncRemainingPieceswithBoard(board, remainingPieces);
        Piece.restrictMovement(board, remainingPieces);
        this.syncBoardwithRemainingPieces(board, remainingPieces);

        // Log each side's piece count
        console.log(`Black Piece Count: ${remainingPieces["B"].length}`)
        console.log(`White Piece Count: ${remainingPieces["W"].length}`)

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
                    boardHighlight: this.state.boardHighlight,
                    remainingPieces: this.state.remainingPieces
                }
            )
        )
        return (
            <div className="game">
                {boardElement}
                <div className="game-info">
                    {/* {React.createElement(
                        Popup,
                        {
                            onClick: (name: string) => alert(`FUCK YEAH ${name}`)
                        }
                    )} */}
                </div>
            </div>
        );
    }
}