import React from 'react';

import { Piece } from './piece';

interface SquareProps {
    toHighlight: boolean,
    value: Piece,
    onClick: Function
}

export function Square(props: SquareProps) {

    let color: string = "";

    if (props.value.uid !== -1 && props.value.name === "King" && props.value.color === "W") {
        if (props.value.isAttacked)
            color = "#ff0000";  // red
        else
            color = "#fff"; // white
    }
    else if (props.toHighlight) {
        if (props.value.uid !== -1)
            color = "#ff0000"; // red
        else
            color = "#00ff00"; // green
    }
    else
        color = "#fff" // white

    return React.createElement(
        'td',
        {
            className: "square",
            onClick: props.onClick,
            style: {
                background: color,
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