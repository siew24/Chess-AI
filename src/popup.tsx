import React from "react";

interface PopupProps {
    onClick: Function
};

export function Popup(props: PopupProps) {

    // Create the buttons
    let possiblePieces = ["Bishop", "Knight", "Rook", "Queen"];

    let buttonElements = possiblePieces.map((name, index) => React.createElement(
        "button",
        {
            style: {
                "grid-area": "item" + (index + 1),
                "justify-self": "center"
            },
            onClick: () => props.onClick(name)
        }, name));

    return React.createElement(
        "div",
        {
            style: {
                position: "fixed",
                width: "100%",
                height: "100%",
                top: "0",
                left: "0",
                right: "0",
                bottom: "0",
                margin: "auto",
                "background-color": "rgba(0, 0, 0, 0.5)"
            }
        },
        React.createElement(
            "div",
            { className: "popup_inner" },
            [React.createElement(
                "h1",
                {
                    style: {
                        // position: "inherit",
                        // "text-align": "center",
                        // width: "100%",
                        // margin: "auto"
                        "grid-area": "header",
                        "justify-self": "center"
                        // "grid-column-end": 5,
                    }
                },
                "Pawn Promotion"
            ),
            ...buttonElements
            ]
        )
    );
}