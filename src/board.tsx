import React from 'react';

import { doSomethingHere } from './AI';
import { Square } from './square';
import { Piece } from './piece';

interface BoardProps {
    playerTurn: boolean,
    onPiecePickup: Function,
    onPiecePlace: Function,
}

interface BoardStates {
    board: Array<Array<Piece>>,
    remainingPieces: {
        [key: string]: Array<Piece>
    }
}

export class Board extends React.Component<BoardProps, BoardStates> {
    constructor(props: BoardProps) {
        super(props);

        const arrayPiece = Array<Piece>(8).fill({
            name: "",
            color: "",
            position: {
                x: 0,
                y: 0
            },
            hasMoved: false,
            isAttacked: false
        });
        this.state = {
            board: Array<Array<Piece>>(8).fill([]).map(() => arrayPiece.slice()
                .map(
                    () => {
                        return {
                            name: "",
                            color: "",
                            position: {
                                x: 0,
                                y: 0
                            },
                            hasMoved: false,
                            isAttacked: false
                        };
                    }
                )),
            remainingPieces: {
                "W": Array<Piece>(16).fill({
                    name: "",
                    color: "",
                    position: {
                        x: 0,
                        y: 0
                    },
                    hasMoved: false,
                    isAttacked: false
                }),
                "B": Array<Piece>(16).fill({
                    name: "",
                    color: "",
                    position: {
                        x: 0,
                        y: 0
                    },
                    hasMoved: false,
                    isAttacked: false
                }),
            }
        };

        const board = this.state.board.slice();
        const remainingPieces = this.state.remainingPieces;

        // The general layout of chess pieces
        const layout = [
            ["Rook", "Knight", "Bishop", "Queen", "King", "Bishop", "Knight", "Rook"],
            ["Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn"]];

        // Indices for remaining pieces
        let whiteCount = 0;
        let blackCount = 0;
        // Iterate through the layout and intialize both side of the board
        layout.forEach((row, rowIndex) => {
            row.forEach((pieceName, columnIndex) => {
                board[0 + rowIndex][columnIndex].name = pieceName;
                board[0 + rowIndex][columnIndex].color = "B";
                board[0 + rowIndex][columnIndex].position = { x: columnIndex, y: 0 + rowIndex };
                board[0 + rowIndex][columnIndex].hasMoved = false;

                remainingPieces["B"][blackCount] = board[0 + rowIndex][columnIndex];
                blackCount++;

                board[7 - rowIndex][columnIndex].name = pieceName;
                board[7 - rowIndex][columnIndex].color = "W";
                board[7 - rowIndex][columnIndex].position = { x: columnIndex, y: 7 - rowIndex };
                board[7 - rowIndex][columnIndex].hasMoved = false;

                remainingPieces["W"][whiteCount] = board[7 - rowIndex][columnIndex];
                whiteCount++;
            })
        });

        this.setState({ board: board });
    }

    shouldComponentUpdate(nextProps: BoardProps) {
        return true;
    }

    renderSquare(i: number, j: number) {
        return React.createElement(
            Square,
            {
                value: this.state.board[i][j],
                onClick: () => {
                    if (this.state.board[i][j].name !== "")
                        this.setState({ board: this.props.onPiecePickup(this.state.board, i, j) })
                    else
                        this.setState({ board: this.props.onPiecePlace(this.state.board, this.state.remainingPieces, i, j) })
                }
            },
            null
        );
    }

    render() {
        let rows: Array<JSX.Element> = [];

        for (let i = 0; i < 8; i++) {
            let elements = [];

            if (i === 0) {
                for (let j = 0; j < 8; j++) {
                    if (j === 0) {
                        elements.push(React.createElement(
                            'td',
                            {
                                className: "board-empty"
                            }
                        ));
                    }

                    elements.push(React.createElement(
                        'td',
                        {
                            className: "board-edge-top"
                        },
                        String.fromCharCode('a'.charCodeAt(0) + j)));

                    if (j === 7) {
                        elements.push(React.createElement(
                            'td'
                        ));
                    }
                }

                rows.push(React.createElement('tr', { className: "board-row" }, elements));
                elements = [];
            }

            for (let j = 0; j < 8; j++) {
                if (j === 0) {
                    elements.push(React.createElement(
                        'td',
                        {
                            className: "board-edge-left"
                        },
                        8 - i
                    ));
                }

                elements.push(this.renderSquare(i, j));

                if (j === 7) {
                    elements.push(React.createElement(
                        'td',
                        {
                            className: "board-edge-right"
                        },
                        8 - i
                    ));
                }

            }

            rows.push(React.createElement('tr', { className: "board-row" }, elements));

            if (i === 7) {
                elements = [];
                for (let j = 0; j < 8; j++) {
                    if (j === 0) {
                        elements.push(React.createElement(
                            'td',
                            {
                                className: "board-empty"
                            }
                        ));
                    }

                    elements.push(React.createElement(
                        'td',
                        {
                            className: "board-edge-bottom"
                        },
                        String.fromCharCode('a'.charCodeAt(0) + j)));

                    if (j === 7) {
                        elements.push(React.createElement(
                            'td'
                        ));
                    }
                }

                rows.push(React.createElement('tr', { className: "board-row" }, elements));

            }
        }

        return React.createElement('div',
            null,
            React.createElement('table',
                { className: "board" },
                rows));
    }
}