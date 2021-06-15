import React from 'react';

import { Board } from './board';
import { doSomethingHere } from './AI';
import './index.css';

// Game should handle player states

interface GameStates {
    playerTurn: boolean
}

export class Game extends React.Component<{}, GameStates> {
    constructor(props: {}) {
        super(props);

        this.state = {
            playerTurn: true
        };
    }

    _handleAI(board: Array<Array<string>>): Array<Array<string>> {
        // After some calculation, a best board state from the AI will be given here
        return doSomethingHere(board);
    }

    handleClick(i: number, j: number) {
        // Here we'll handle how the player interacts with the game

        // After a succesful move, it'll become the AI's turn
        this.setState({ playerTurn: !this.state.playerTurn });

        console.log(`Tile Position: ${i}, ${j}`);
    }

    render() {

        let boardElement = React.createElement(
            'div',
            {
                className: "game-board",
                onMouseEnter: () => console.log("Mouse entered Chess Board"),
                onMouseLeave: () => console.log("Mouse left Chess Board"),
            },
            React.createElement(
                Board,
                {
                    playerTurn: this.state.playerTurn,
                    triggerAI: (board: Array<Array<string>>) => this._handleAI(board),
                    onClick: (i: number, j: number) => this.handleClick(i, j)
                }
            )
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