import React from 'react';

import { Piece } from './piece';

interface SquareProps {
    toHighlight: boolean,
    value: Piece,
    onClick: Function
}

export function Square(props: SquareProps) {
    return React.createElement(
        'td',
        {
            className: "square",
            onClick: props.onClick,
            style: {
                background: props.toHighlight ? (props.value.uid !== -1 ? "#ff0000" : "#00ff00") : "#fff",
                border: "1px solid #999",
                float: "left",
                fontSize: "24px",
                fontWeight: "bold",
                lineHeight: "34px",
                height: "55px",
                marginRight: "-1px",
                marginTop: "-1px",
                padding: "0",
                textAlign: "center",
                width: "55px"
            }
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