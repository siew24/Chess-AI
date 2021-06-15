import React from 'react';

import { doSomethingHere } from './AI';
import { Square } from './square';

interface BoardProps {
    playerTurn: boolean,
    triggerAI: Function,
    onClick: Function
}

interface BoardStates {
    board: Array<Array<string>>
}

export class Board extends React.Component<BoardProps, BoardStates> {
    constructor(props: BoardProps) {
        super(props);

        this.state = {
            board: Array<Array<string>>(8).fill([]).map(() => Array<string>(8).fill(""))
        };

        const board = this.state.board.slice();

        // The general layout of chess pieces
        const layout = [
            ["Rook", "Knight", "Bishop", "Queen", "King", "Bishop", "Knight", "Rook"],
            ["Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn"]];

        // Iterate through the layout and intialize both side of the board
        layout.forEach((row, rowIndex) => {
            row.forEach((pieceName, columnIndex) => {
                board[0 + rowIndex][columnIndex] = pieceName + " B";
                board[7 - rowIndex][columnIndex] = pieceName + " W";
            })
        });

        this.setState({ board: board });
    }

    componentDidUpdate(prevProps: BoardProps) {
        // If previously was the player's turn and now it's the AI's turn
        if (prevProps.playerTurn !== this.props.playerTurn && !this.props.playerTurn) {

            let board = this.state.board.slice();

            // Use the prop function
            let newBoard = this.props.triggerAI(board);

            this.setState({ board: newBoard });

        }
    }

    renderSquare(i: number, j: number) {
        return React.createElement(
            Square,
            {
                value: { name: this.state.board[i][j] },
                onClick: () => {
                    if (this.props.playerTurn)
                        this.props.onClick(i, j)
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