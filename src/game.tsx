import React from 'react';

import { Board } from './board';
import './index.css';

export class Game extends React.Component {
    render() {

        let boardElement = React.createElement(
            'div',
            {
                className: "game-board",
                onMouseEnter: () => console.log("Mouse entered Chess Board"),
                onMouseLeave: () => console.log("Mouse left Chess Board"),
            },
            React.createElement(Board)
        )
        return (
            <div className="game">
                {boardElement}
                <div className="game-info">
                    <div>{/* status */}</div>
                    <div>{/* TODO */}</div>
                </div>
            </div>
        );
    }
}