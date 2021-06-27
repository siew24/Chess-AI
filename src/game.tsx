import React from 'react';

import { Board } from './board';
import { handleChessMovement } from './board events/chess-movement';
import { checkEndState } from './board events/chess-end-state';
import { Position, Piece } from './piece';
import { doSomethingHere } from './AI';
import './index.css';
import { endGamePopup, promotionPopup } from './popup';
import { promotePawn } from './board events/chess-pawn-promotion';

// Game should handle player states

interface GameStates {
    playerTurn: boolean,
    holdingPiece: Piece,
    isHolding: boolean,
    endPopup: boolean,
    isPromoting: boolean,
    pawnPromotionPopup: boolean,
    pawnPromotionChoice: string,
    targetedPawn: Position,
    endStateReached: boolean,
    endStateMessage: string,
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
            endPopup: false,
            isPromoting: false,
            targetedPawn: new Position(),
            pawnPromotionPopup: false,
            pawnPromotionChoice: "",
            endStateReached: false,
            endStateMessage: "",
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

    _toggleEndPopup() {
        this.setState({ endPopup: !this.state.endPopup });
    }
    _togglePromotionPopup() {
        this.setState({ pawnPromotionPopup: !this.state.pawnPromotionPopup });
    }

    _handlePromotion(name: string) {
        // Set the name for this pawn to the given choice
        // Get the piece from remainingPieces
        let remainingPieces = {
            "W": this.state.remainingPieces["W"].map(piece => {
                let newPiece = new Piece();
                newPiece.fromData(piece);
                return newPiece;
            }),
            "B": this.state.remainingPieces["B"].map(piece => {
                let newPiece = new Piece();
                newPiece.fromData(piece);
                return newPiece;
            })
        };

        let board = this.state.board.map(row => {
            return row.map(piece => {
                let newPiece = new Piece();
                newPiece.fromData(piece);

                return newPiece;
            });
        })

        // Use the helper function to update the board and remainingPieces
        const [newBoard, newRemainingPieces] = promotePawn(name, this.state.targetedPawn, board, remainingPieces);

        // Overwrite the states
        this.setState({
            isPromoting: false,
            pawnPromotionChoice: "",
            targetedPawn: new Position(),
            board: newBoard.map(row => row.map(piece => {
                let newPiece = new Piece();
                newPiece.fromData(piece);

                return newPiece;
            })),

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

        // After promotion is done, we untoggle the popup
        this._togglePromotionPopup();
    }

    /**
     * Validates the current state of the board
     * @returns {boolean} true if end state has been set, false otherwise
     */
    _validateEndState(color: string): boolean {
        // Get a copy of remainingPieces
        let remainingPieces = {
            "W": this.state.remainingPieces["W"].map(piece => {
                let newPiece = new Piece();
                newPiece.fromData(piece);
                return newPiece;
            }),
            "B": this.state.remainingPieces["B"].map(piece => {
                let newPiece = new Piece();
                newPiece.fromData(piece);
                return newPiece;
            })
        };

        let value = checkEndState(color, remainingPieces);

        if ([-1, 0, 1].includes(value))
            this.setState({ endStateReached: true });

        switch (value) {
            case -1: {
                // Player won
                this.setState({ endStateMessage: "Player Won!" });
                return true;
            }
            case 0: {
                // Draw
                this.setState({ endStateMessage: "It's a draw!" });
                return true;
            }
            case 1: {
                // AI won
                this.setState({ endStateMessage: "AI Won!" });
                return true;
            }
            default: {
                return false;
            }
        }
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

        // In the event of AI pawn promotion, this must be handled
        if (currentPiece.name === "Pawn" && movePosition.y === 7) {

            const [promotedBoard, promotedRemainingPieces] = promotePawn(AIBoard[movePosition.y][movePosition.x].name, movePosition, newBoard, newRemainingPieces);

            // Set board state
            this.setState({
                board: promotedBoard.map((row) => {
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
                    "W": promotedRemainingPieces["W"].map(piece => {
                        let newPiece = new Piece();
                        newPiece.fromData(piece);

                        return newPiece;
                    }),

                    "B": promotedRemainingPieces["B"].map(piece => {
                        let newPiece = new Piece();
                        newPiece.fromData(piece);

                        return newPiece;
                    })
                }
            });
            return;
        }

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

    onPiecePickup(i: number, j: number) {
        if (!this.state.endStateReached) {
            let board = this.state.board.map(row => {
                return row.map(piece => {
                    let newPiece = new Piece();
                    newPiece.fromData(piece);

                    return newPiece;
                });
            });

            console.log("Trying to pick up...");
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
    }

    onPiecePlace(i: number, j: number) {
        if (!this.state.endStateReached) {
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
                    console.log("Not a valid attack move")
                    return;
                }
                // If the clicked area is not a valid move
                else if (!currentPiece.moves.find(value => value.x === j && value.y === i))
                    return;

                console.log(`Valid placement!`);
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

                // Handle Pawn promotion
                if (currentPiece.name === "Pawn" && i === 0) {
                    this._togglePromotionPopup();
                    this.setState({
                        isPromoting: true,
                        targetedPawn: new Position(j, i),
                    });
                    console.log("We reached here");
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
    }

    componentDidUpdate() {

        // Check if end state has reached
        if (!this.state.endStateReached) {
            // Check if there's a promotion event happening
            if (!this.state.isPromoting && !this.state.pawnPromotionPopup) {
                // Check is player is holding
                if (!this.state.isHolding) {
                    if (this._validateEndState(!this.state.playerTurn ? "B" : "W")) {
                        this.setState({ endPopup: true });
                        return;
                    }

                    // Check if it's AI's turn
                    if (!this.state.playerTurn) {
                        console.log("Detected player turn changed to false!");
                        console.log(`Black Pieces: ${this.state.remainingPieces["B"].length}`);
                        console.log(`White Pieces: ${this.state.remainingPieces["W"].length}`);

                        // We now execute AI's logic
                        this._handleAI(this.state.board);
                        this.setState({ playerTurn: true });

                        return;
                    }

                    console.log("Detected player turn changed to true!");
                    console.log(`Black Pieces: ${this.state.remainingPieces["B"].length}`);
                    console.log(`White Pieces: ${this.state.remainingPieces["W"].length}`);
                }
            }
            else {
                // We do the pawn promotion logic here
                if (this.state.pawnPromotionChoice !== "") {
                    this._handlePromotion(this.state.pawnPromotionChoice);
                    this._togglePromotionPopup();
                }
            }
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
                    {this.state.endPopup ?
                        React.createElement(
                            endGamePopup,
                            {
                                message: this.state.endStateMessage,
                                onClick: () => this._toggleEndPopup()
                            }
                        )
                        :
                        this.state.pawnPromotionPopup ?
                            React.createElement(
                                promotionPopup,
                                {
                                    onClick: (name: string) => this.setState({ pawnPromotionChoice: name })
                                }
                            )
                            :
                            null}
                </div>
            </div>
        );
    }
}