import React from 'react';

import { Piece } from './piece';
import { Square } from './square';

interface BoardStates {
    squares: Array<Array<string>>,
    xIsNext: boolean
}

export class Board extends React.Component<{}, BoardStates> {
    constructor(props: {}) {
        super(props);

        this.state = {
            squares: Array<Array<string>>(8).fill([]).map(() => Array<string>(8).fill("")),
            xIsNext: true,
        };

        const squares = this.state.squares.slice();

        squares[0][0] = "assets/Rook B.png";
        squares[0][7] = "assets/Rook B.png";
        squares[0][1] = "assets/Knight B.png";
        squares[0][6] = "assets/Knight B.png";
        squares[0][2] = "assets/Bishop B.png";
        squares[0][5] = "assets/Bishop B.png";
        squares[0][3] = "assets/Queen B.png";
        squares[0][4] = "assets/King B.png";

        this.setState({ squares: squares });
        console.log(this.state.squares);
    }

    renderSquare(i: number, j: number) {
        return React.createElement(
            Square,
            {
                value: { imageSource: this.state.squares[i][j] },
                onClick: () => alert(`${i} + ${j}`)
            },
            null
        );
    }

    render() {
        let rows: Array<JSX.Element> = [];

        for (let i = 0; i < 8; i++) {
            let elements = [];

            for (let j = 0; j < 8; j++)
                elements.push(this.renderSquare(i, j));

            rows.push(React.createElement('tr', { className: "board-row" }, elements));
        }

        return React.createElement('div',
            null,
            React.createElement('table',
                { className: "board" },
                rows));
    }
}