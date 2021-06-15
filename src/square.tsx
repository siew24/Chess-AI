import React from 'react';

import { ChessPiece, Piece } from './piece';

interface SquareProps {
    value: Piece,
    onClick: Function
}

export function Square(props: SquareProps) {
    return React.createElement(
        'td',
        {
            className: "square",
            onClick: props.onClick
        },
        (props.value.name !== "") ?
            React.createElement('img',
                {
                    src: ChessPiece(props.value),
                    className: (props.value.name.search("Queen") === -1 ? "piece" : "queen-piece")
                })
            :
            null
    );
}