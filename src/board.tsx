import React from 'react';

import { doSomethingHere } from './AI';
import { Square } from './square';
import { Piece, Position } from './piece';

interface BoardProps {
    playerTurn: boolean,
    onPiecePickup: Function,
    onPiecePlace: Function,
    isHolding: boolean,
    remainingPieces: {
        [key: string]: Array<Piece>
    },
    board: Array<Array<Piece>>
}

export class Board extends React.Component<BoardProps> {

    shouldComponentUpdate(nextProps: BoardProps) {
        return true;
    }

    renderSquare(i: number, j: number) {
        return React.createElement(
            Square,
            {
                value: this.props.board[i][j],
                onClick: () => {
                    if (!this.props.isHolding)
                        this.props.onPiecePickup(i, j)
                    else
                        this.props.onPiecePlace(i, j)
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