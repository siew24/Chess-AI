import React from 'react';

import { Piece } from './piece';
import { Square } from './square';

interface BoardStates {
    squares: Array<Array<string>>,
    mousePosition: Array<number>
}

export class Board extends React.Component<{}, BoardStates> {
    constructor(props: {}) {
        super(props);

        this.state = {
            squares: Array<Array<string>>(8).fill([]).map(() => Array<string>(8).fill("")),
            mousePosition: [0, 0]
        };

        const squares = this.state.squares.slice();

        // The general layout of chess pieces
        const layout = [
            ["Rook", "Knight", "Bishop", "Queen", "King", "Bishop", "Knight", "Rook"],
            ["Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn"]];

        // Iterate through the layout and intialize both side of the board
        layout.forEach((row, rowIndex) => {
            row.forEach((pieceName, columnIndex) => {
                squares[0 + rowIndex][columnIndex] = pieceName + " B";
                squares[7 - rowIndex][columnIndex] = pieceName + " W";
            })
        });

        this.setState({ squares: squares });
    }

    renderSquare(i: number, j: number) {
        return React.createElement(
            Square,
            {
                value: { name: this.state.squares[i][j] },
                onClick: () => console.log(`Tile Position: ${i}, ${j}`)
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