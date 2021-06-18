import React from 'react';

import { Piece } from './piece';

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
                    src: props.value.imageSource,
                    className: (props.value.name !== "Queen" ? "piece" : "queen-piece")
                })
            :
            null
    );
}