import React from 'react';

import { Board } from './board';
import { handleChessMovement } from './board events/chess-movement';
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
    _handleAI(board: Array<Array<Piece>>): void {

        // Get a copy of board state
        let boardCopy = board.map(row => {
            return row.map(piece => {
                let newPiece = new Piece();
                newPiece.fromData(piece);

                return newPiece;
            });
        });

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

        // After some calculation, a best board state from the AI will be given here
        const AIBoard = doSomethingHere(boardCopy, remainingPieces);

        // After AI evaluation, remainingPieces might be overwritten
        // Recopy remainingPieces back
        remainingPieces = {
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

        // By comparing AIBoard with Board, we can know which piece had been moved
        // and because it's AI's turn, we know that the black piece is the moved piece

        // Initialization
        let currentPiece: Piece = new Piece();
        let movePosition: Position = new Position();
        let encounteredBlacks: Array<Piece> = [];
        let isFound: boolean = false;

        for (let rowIndex = 0; rowIndex < 8; rowIndex++) {
            for (let columnIndex = 0; columnIndex < 8; columnIndex++) {
                let oldSquare = board[rowIndex][columnIndex];
                let newSquare = AIBoard[rowIndex][columnIndex];

                // If they're empty or they're the same piece
                if (oldSquare.uid === newSquare.uid)
                    continue;

                // They have different uid's
                // Check if it's a black piece
                if (newSquare.color === "B") {
                    // This is the moved piece
                    let index = -1;
                    let start = false;
                    let oldFound = false;
                    for (rowIndex = 0; rowIndex < 8; rowIndex++) {
                        for (columnIndex = 0; columnIndex < 8; columnIndex++) {
                            if (board[rowIndex][columnIndex].uid !== -1 &&
                                board[rowIndex][columnIndex].color === "B") {

                                encounteredBlacks.push(new Piece());
                                index++;
                                encounteredBlacks[index].fromData(board[rowIndex][columnIndex]);

                                if (encounteredBlacks[index].uid === newSquare.uid) {
                                    oldFound = true;
                                    break;
                                }
                            }
                        }
                        if (oldFound)
                            break;
                    }


                    // Pass Piece data to currentPiece...
                    currentPiece.fromData(encounteredBlacks[index]);

                    // Clear the array
                    encounteredBlacks = [];
                    // ...and also the move position
                    movePosition.fromData(newSquare.position);

                    isFound = true;
                    break;
                }
            }
            if (isFound)
                break;
        }

        // Get a copy of remainingPieces state
        let copyRemainingPieces = {
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

        // IF for some reason we didn't found any change
        if (currentPiece.uid === -1) {
            return;
        }

        const [newBoard, newRemainingPieces] = handleChessMovement(currentPiece, movePosition, board, copyRemainingPieces);

        // Set board state
        this.setState({
            board: newBoard.map((row) => {
                return row.map((piece) => {
                    let newPiece = new Piece();
                    newPiece.fromData(piece);

                    return newPiece;
                })
            })
        });

        // Set remainingPieces state
        this.setState({
            remainingPieces: {
                "W": newRemainingPieces["W"].map(piece => {
                    let newPiece = new Piece();
                    newPiece.fromData(piece);

                    return newPiece;
                }),

                "B": newRemainingPieces["B"].map(piece => {
                    let newPiece = new Piece();
                    newPiece.fromData(piece);

                    return newPiece;
                })
            }
        });
    }

    /** 
     * Checks (Win, Draw) states
     * @returns {number} -1, if Player won, 0, if it's a draw, 1, if the AI won, and any other number if there's no valid end state
     */
    _checkEndState(board: Array<Array<Piece>>, remainingPieces: { [key: string]: Array<Piece> }): number {

        // First we check the obvious
        // King is checkmated
        for (let color of ["W", "B"]) {
            let oppositeColor = color === "W" ? "B" : "W";

            let index = remainingPieces[color].findIndex(piece => piece.name === "King");

            // Because we're checking the board state, we only get a copy of the King piece
            let kingPiece = new Piece();
            kingPiece.fromData(remainingPieces[color][index]);
        }

        return 2;
    }

    onPiecePickup(i: number, j: number) {

        let board = this.state.board.map(row => {
            return row.map(piece => {
                let newPiece = new Piece();
                newPiece.fromData(piece);

                return newPiece;
            });
        });

        //console.log("Trying to pick up...");
        if (this.state.holdingPiece.name === "" && board[i][j].name !== "" && board[i][j].color === "W") {
            //console.log(`Picked up ${board[i][j].name}`)
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

            //console.log(`Holding: ${holdingPiece.name}`)
            //console.log(`${holdingPiece.name}'s moves (id: ${holdingPiece.uid}):`)

            //console.dir(holdingPiece.moves);
        }

        this.setState({ board: board });
    }

    onPiecePlace(i: number, j: number) {
        // Here we'll handle how the player interacts with the game

        // Copy the board
        let board = this.state.board.map(row => {
            return row.map(piece => {
                let newPiece = new Piece();
                newPiece.fromData(piece);

                return newPiece;
            });
        });

        // If the player is holding a piece
        if (this.state.holdingPiece.name !== "") {

            //console.log(`Trying to place it down...`);

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

                // Modify board state
                this.setState({
                    board: board.map((row) => {
                        return row.map((piece) => {
                            let newPiece = new Piece();
                            newPiece.fromData(piece);

                            return newPiece;
                        })
                    })
                });

                return;
            }
            // If the clicked area is an opposite color piece but not a valid attack move
            else if (board[i][j].name !== "" && board[i][j].color !== currentPiece.color &&
                !currentPiece.attacks.find(value => value.x === j && value.y === i)) {
                //console.log("Not a valid attack move")
                return;
            }
            // If the clicked area is not a valid move
            else if (!currentPiece.moves.find(value => value.x === j && value.y === i))
                return;

            //console.log(`Valid placement!`);
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

            // Get a copy of remainingPieces state
            let copyRemainingPieces = {
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

            const [newBoard, remainingPieces] = handleChessMovement(currentPiece, new Position(j, i), board, copyRemainingPieces);

            this.setState({ holdingPiece: new Piece() });

            // Set board state
            this.setState({
                board: newBoard.map((row) => {
                    return row.map((piece) => {
                        let newPiece = new Piece();
                        newPiece.fromData(piece);

                        return newPiece;
                    })
                })
            });

            // Set remainingPieces state
            this.setState({
                remainingPieces: {
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
                }
            });

            // To prevent player from doing anything until AI is done
            this.setState({ playerTurn: false });
        }
    }

    componentDidUpdate(_: {}, prevState: GameStates) {
        // Check if it's AI's turn
        if (!this.state.isHolding) {
            if (!this.state.playerTurn) {

                let boardStateChanged = false;

                for (let rowIndex = 0; rowIndex < prevState.board.length; rowIndex++) {
                    for (let columnIndex = 0; columnIndex < prevState.board[rowIndex].length; columnIndex++) {
                        // We now check one by one if they're the same
                        let oldPiece = new Piece();
                        let newPiece = new Piece();

                        oldPiece.fromData(prevState.board[rowIndex][columnIndex]);
                        newPiece.fromData(this.state.board[rowIndex][columnIndex]);

                        // If they're not equal
                        if (!Piece.isEqual(oldPiece, newPiece)) {
                            boardStateChanged = true;
                            break;
                        }

                    }

                    if (boardStateChanged)
                        break;
                }

                if (!boardStateChanged)
                    return;

                //console.log("Detected player turn changed to false!");
                //console.log(`Black Pieces: ${this.state.remainingPieces["B"].length}`);
                //console.log(`White Pieces: ${this.state.remainingPieces["W"].length}`);

                // We now execute AI's logic
                this._handleAI(this.state.board);
                this.setState({ playerTurn: true });

                return;
            }

            //console.log("Detected player turn changed to true!");
            //console.log(`Black Pieces: ${this.state.remainingPieces["B"].length}`);
            //console.log(`White Pieces: ${this.state.remainingPieces["W"].length}`);
        }

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