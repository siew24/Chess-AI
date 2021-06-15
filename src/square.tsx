import React from 'react';

import { ChessPiece, Piece } from './piece';

interface SquareProps {
    value: Piece,
    onClick: Function
}

export function Square(props: SquareProps) {
    if (props.value.name !== "")
        return React.createElement(
            'td',
            {
                className: "square",
                onClick: props.onClick
            },
            React.createElement('img',
                {
                    src: ChessPiece(props.value),
                    className: (props.value.name.search("Queen") === -1 ? "piece" : "queen-piece")
                })
        );
    else
        return React.createElement(
            'td',
            {
                className: "square",
                onClick: props.onClick
            }
        );
}