import React from "react";

interface PopupProps {
    onClick: Function
};

function popupWrapper(props: PopupProps, elements: Array<JSX.Element>) {

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
                backgroundColor: "rgba(0, 0, 0, 0.5)"
            }
        },
        React.createElement(
            "div",
            {
                className: "popup_inner"
                // style: {
                //     position: "absolute",
                //     left: "25%",
                //     right: "25%",
                //     top: "25%",
                //     bottom: "25%",
                //     margin: "auto",
                //     background: "white",
                //     display: "grid",
                //     gridTemplateColumns: "[first] 25% [line2] auto[line3] 25% [end]",
                //     gridTemplateRows: "[row1] 25% [row2] 10% [row3] 10% [row4] 10% [row5] 10% [end]",
                //     gridTemplateAreas: `". header ."
                //                         ". item1 ."
                //                         ". item2 ."
                //                         ". item3 ."
                //                         ". item4 ."`

                // }
            },
            elements
        )
    );
}

export function promotionPopup(props: PopupProps) {
    // Create the buttons
    let possiblePieces = ["Bishop", "Knight", "Rook", "Queen"];

    let buttonElements = possiblePieces.map((name, index) => React.createElement(
        "button",
        {
            style: {
                gridArea: "item" + (index + 1),
                justifySelf: "center"
            },
            onClick: () => props.onClick(name)
        }, name));

    return popupWrapper(props,
        [React.createElement(
            "h1",
            {
                style: {
                    // position: "inherit",
                    // "text-align": "center",
                    // width: "100%",
                    // margin: "auto"
                    gridArea: "header",
                    justifySelf: "center"
                    // "grid-column-end": 5,
                }
            },
            "Pawn Promotion"
        ),
        ...buttonElements]);
}

interface endGamePopupProps extends PopupProps {
    message: string
}

export function endGamePopup(props: endGamePopupProps) {
    return popupWrapper(props,
        [React.createElement(
            "h1",
            {
                style: {
                    // position: "inherit",
                    // "text-align": "center",
                    // width: "100%",
                    // margin: "auto"
                    gridArea: "header",
                    justifySelf: "center"
                    // "grid-column-end": 5,
                }
            },
            props.message
        ),
        React.createElement(
            "button",
            {
                style: {
                    gridArea: "item1",
                    justifySelf: "center"
                },
                onClick: () => props.onClick()
            }, "Nice!")]);
}