import React from 'react';

import { Piece } from './piece';

interface SquareProps {
    value: Piece,
    onClick: Function
}

export function Square(props: SquareProps) {
    console.log(props.value.imageSource);
    return React.createElement(
        'td',
        {
            className: "square",
            onClick: props.onClick
        },
        React.createElement('img', { src: props.value.imageSource })
    );
}