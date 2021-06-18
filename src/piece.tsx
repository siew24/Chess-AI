import React from 'react';

export type Position = {
    x: number,
    y: number
}

export class Piece {
    private _name: string;
    private _color: string;
    private _position: Position;
    private _hasMoved: boolean;
    private _isAttacked: boolean;

    constructor(name: string = "", color: string = "", position: Position = { x: 0, y: 0 }) {
        this._name = name;
        this._color = color;
        this._position = {
            x: position.x,
            y: position.y
        };
        this._hasMoved = false;
        this._isAttacked = false;
    }

    get name(): string { return this._name; }
    get imageSource(): string { return "assets/" + this.name + " " + this.color + ".png"; }
    get color(): string { return this._color; }
    get position(): Position { return this._position; }
    get hasMoved(): boolean { return this._hasMoved; }
    get isAttacked(): boolean { return this._isAttacked; }

    clearName() { this._name = ""; }

    fromData(pieceObject: Piece): void {
        this._name = pieceObject.name;
        this._color = pieceObject.color;
        this._position = {
            x: pieceObject.position.x,
            y: pieceObject.position.y
        };
        this._hasMoved = pieceObject.hasMoved;
        this._isAttacked = pieceObject.isAttacked;
    }
}

// A placeholder
export function availableMoves(board: Array<Array<Piece>>, chessPiece: Piece) {
    let possibleMoves: Array<Array<number>> = [];

    // This is a Pawn
    if (chessPiece.name.includes("Pawn")) {

        if (chessPiece.color === "B") {
            // Check diagonally left
            if (chessPiece.position.x !== 0) {
                let tiles = board[chessPiece.position.y + 1][chessPiece.position.x - 1];

                if (tiles.name !== "" && tiles.color === "W")
                    possibleMoves.push([chessPiece.position.y + 1, chessPiece.position.x - 1]);
            }
            // Check diagonally right
            if (chessPiece.position.x !== 7) {
                let tiles = board[chessPiece.position.y + 1][chessPiece.position.x + 1];

                if (tiles.name !== "" && tiles.color === "W")
                    possibleMoves.push([chessPiece.position.y + 1, chessPiece.position.x + 1]);
            }

            // Check infront
            if (board[chessPiece.position.y + 1][chessPiece.position.x].name === "")
                possibleMoves.push([chessPiece.position.y + 1, chessPiece.position.x]);

            // If itself did not move and no other piece are on that tile
            if (chessPiece.position.y === 1 && board[chessPiece.position.y + 2][chessPiece.position.x].name === "")
                possibleMoves.push([chessPiece.position.y + 2, chessPiece.position.x]);
        }
        if (chessPiece.color === "W") {
            // Check diagonally left
            if (chessPiece.position.x !== 0) {
                let tiles = board[chessPiece.position.y - 1][chessPiece.position.x - 1];

                if (tiles.name !== "" && tiles.color === "B")
                    possibleMoves.push([chessPiece.position.y - 1, chessPiece.position.x - 1]);
            }
            // Check diagonally right
            if (chessPiece.position.x !== 7) {
                let tiles = board[chessPiece.position.y - 1][chessPiece.position.x + 1];

                if (tiles.name !== "" && tiles.color === "B")
                    possibleMoves.push([chessPiece.position.y - 1, chessPiece.position.x + 1]);
            }

            // Check infront
            if (board[chessPiece.position.y - 1][chessPiece.position.x].name === "")
                possibleMoves.push([chessPiece.position.y - 1, chessPiece.position.x]);

            // If itself did not move
            if (chessPiece.position.y === 6 && board[chessPiece.position.y - 2][chessPiece.position.x].name === "")
                possibleMoves.push([chessPiece.position.y - 2, chessPiece.position.x]);
        }
    }
    // This is a Rook
    else if (chessPiece.name.includes("Rook")) {

        // Go Vertically
        let verticalMaxDistance = Math.max(chessPiece.position.y, 8 - chessPiece.position.y - 1);
        let upBlocked = false;
        let downBlocked = false;
        for (let verticalOffset = 1; verticalOffset <= verticalMaxDistance; verticalOffset++) {
            if (chessPiece.position.y - verticalOffset >= 0 && !upBlocked) {
                // We found a piece blocker
                if (board[chessPiece.position.y - verticalOffset][chessPiece.position.x].name !== "") {

                    // The only exception is that it's an opposite piece
                    // - That's a valid move
                    if (board[chessPiece.position.y - verticalOffset][chessPiece.position.x].color !== chessPiece.color)
                        possibleMoves.push([chessPiece.position.y - verticalOffset, chessPiece.position.x]);

                    upBlocked = true;
                }
                else
                    possibleMoves.push([chessPiece.position.y - verticalOffset, chessPiece.position.x]);

            }
            if (chessPiece.position.y + verticalOffset < 8 && !downBlocked) {
                // We found a piece blocker
                if (board[chessPiece.position.y + verticalOffset][chessPiece.position.x].name !== "") {

                    // The only exception is that it's an opposite piece
                    // - That's a valid move
                    if (board[chessPiece.position.y + verticalOffset][chessPiece.position.x].color !== chessPiece.color)
                        possibleMoves.push([chessPiece.position.y + verticalOffset, chessPiece.position.x]);

                    downBlocked = true;
                }
                else
                    possibleMoves.push([chessPiece.position.y + verticalOffset, chessPiece.position.x]);
            }
        }

        // Go Horizontally
        let horizontalMaxDistance = Math.max(chessPiece.position.x, 8 - chessPiece.position.x - 1);
        let leftBlocked = false;
        let rightBlocked = false;
        for (let horizontalOffset = 1; horizontalOffset <= horizontalMaxDistance; horizontalOffset++) {
            if (chessPiece.position.x - horizontalOffset >= 0 && !leftBlocked) {
                // We found a piece blocker
                if (board[chessPiece.position.y][chessPiece.position.x - horizontalOffset].name !== "") {

                    // The only exception is that it's an opposite piece
                    // - That's a valid move
                    if (board[chessPiece.position.y][chessPiece.position.x - horizontalOffset].color !== chessPiece.color)
                        possibleMoves.push([chessPiece.position.y, chessPiece.position.x - horizontalOffset]);

                    leftBlocked = true;
                }
                else
                    possibleMoves.push([chessPiece.position.y, chessPiece.position.x - horizontalOffset]);

            }
            if (chessPiece.position.x + horizontalOffset < 8 && !rightBlocked) {
                // We found a piece blocker
                if (board[chessPiece.position.y][chessPiece.position.x + horizontalOffset].name !== "") {

                    // The only exception is that it's an opposite piece
                    // - That's a valid move
                    if (board[chessPiece.position.y][chessPiece.position.x + horizontalOffset].color !== chessPiece.color)
                        possibleMoves.push([chessPiece.position.y, chessPiece.position.x + horizontalOffset]);

                    rightBlocked = true;
                }
                else
                    possibleMoves.push([chessPiece.position.y, chessPiece.position.x + horizontalOffset]);
            }
        }

    }
    // This is a Bishop
    else if (chessPiece.name.includes("Bishop")) {

        // Go Diagonally
        let diagonalMaxDistance = Math.max(chessPiece.position.x, 8 - chessPiece.position.x - 1);
        let leftUpBlocked = false;
        let leftDownBlocked = false;
        let rightUpBlocked = false;
        let rightDownBlocked = false;
        for (let diagonalOffset = 1; diagonalOffset <= diagonalMaxDistance; diagonalOffset++) {
            if (chessPiece.position.y - diagonalOffset >= 0 && chessPiece.position.x - diagonalOffset >= 0 && !leftUpBlocked) {
                // We found a piece blocker
                if (board[chessPiece.position.y - diagonalOffset][chessPiece.position.x - diagonalOffset].name !== "") {

                    // The only exception is that it's an opposite piece
                    // - That's a valid move
                    if (board[chessPiece.position.y - diagonalOffset][chessPiece.position.x - diagonalOffset].color !== chessPiece.color)
                        possibleMoves.push([chessPiece.position.y - diagonalOffset, chessPiece.position.x - diagonalOffset]);

                    leftUpBlocked = true;
                }
                else
                    possibleMoves.push([chessPiece.position.y - diagonalOffset, chessPiece.position.x - diagonalOffset]);
            }
            if (chessPiece.position.y + diagonalOffset < 8 && chessPiece.position.x - diagonalOffset >= 0 && !leftDownBlocked) {
                // We found a piece blocker
                if (board[chessPiece.position.y + diagonalOffset][chessPiece.position.x - diagonalOffset].name !== "") {

                    // The only exception is that it's an opposite piece
                    // - That's a valid move
                    if (board[chessPiece.position.y + diagonalOffset][chessPiece.position.x - diagonalOffset].color !== chessPiece.color)
                        possibleMoves.push([chessPiece.position.y + diagonalOffset, chessPiece.position.x - diagonalOffset]);

                    leftDownBlocked = true;
                }
                else
                    possibleMoves.push([chessPiece.position.y + diagonalOffset, chessPiece.position.x - diagonalOffset]);
            }
            if (chessPiece.position.y - diagonalOffset >= 0 && chessPiece.position.x + diagonalOffset < 8 && !rightUpBlocked) {
                // We found a piece blocker
                if (board[chessPiece.position.y - diagonalOffset][chessPiece.position.x + diagonalOffset].name !== "") {

                    // The only exception is that it's an opposite piece
                    // - That's a valid move
                    if (board[chessPiece.position.y - diagonalOffset][chessPiece.position.x + diagonalOffset].color !== chessPiece.color)
                        possibleMoves.push([chessPiece.position.y - diagonalOffset, chessPiece.position.x + diagonalOffset]);

                    rightUpBlocked = true;
                }
                else
                    possibleMoves.push([chessPiece.position.y - diagonalOffset, chessPiece.position.x + diagonalOffset]);
            }
            if (chessPiece.position.y + diagonalOffset < 8 && chessPiece.position.x + diagonalOffset < 8 && !rightDownBlocked) {
                // We found a piece blocker
                if (board[chessPiece.position.y + diagonalOffset][chessPiece.position.x + diagonalOffset].name !== "") {

                    // The only exception is that it's an opposite piece
                    // - That's a valid move
                    if (board[chessPiece.position.y + diagonalOffset][chessPiece.position.x + diagonalOffset].color !== chessPiece.color)
                        possibleMoves.push([chessPiece.position.y + diagonalOffset, chessPiece.position.x + diagonalOffset]);

                    rightDownBlocked = true;
                }
                else
                    possibleMoves.push([chessPiece.position.y + diagonalOffset, chessPiece.position.x + diagonalOffset]);
            }
        }

    }
    // This is a Queen
    else if (chessPiece.name.includes("Queen")) {

        // Go Vertically
        let verticalMaxDistance = Math.max(chessPiece.position.y, 8 - chessPiece.position.y - 1);
        let upBlocked = false;
        let downBlocked = false;
        for (let verticalOffset = 1; verticalOffset <= verticalMaxDistance; verticalOffset++) {
            if (chessPiece.position.y - verticalOffset >= 0 && !upBlocked) {
                // We found a piece blocker
                if (board[chessPiece.position.y - verticalOffset][chessPiece.position.x].name !== "") {

                    // The only exception is that it's an opposite piece
                    // - That's a valid move
                    if (board[chessPiece.position.y - verticalOffset][chessPiece.position.x].color !== chessPiece.color)
                        possibleMoves.push([chessPiece.position.y - verticalOffset, chessPiece.position.x]);

                    upBlocked = true;
                }
                else
                    possibleMoves.push([chessPiece.position.y - verticalOffset, chessPiece.position.x]);

            }
            if (chessPiece.position.y + verticalOffset < 8 && !downBlocked) {
                // We found a piece blocker
                if (board[chessPiece.position.y + verticalOffset][chessPiece.position.x].name !== "") {

                    // The only exception is that it's an opposite piece
                    // - That's a valid move
                    if (board[chessPiece.position.y + verticalOffset][chessPiece.position.x].color !== chessPiece.color)
                        possibleMoves.push([chessPiece.position.y + verticalOffset, chessPiece.position.x]);

                    downBlocked = true;
                }
                else
                    possibleMoves.push([chessPiece.position.y + verticalOffset, chessPiece.position.x]);
            }
        }

        // Go Horizontally
        let horizontalMaxDistance = Math.max(chessPiece.position.x, 8 - chessPiece.position.x - 1);
        let leftBlocked = false;
        let rightBlocked = false;
        for (let horizontalOffset = 1; horizontalOffset <= horizontalMaxDistance; horizontalOffset++) {
            if (chessPiece.position.x - horizontalOffset >= 0 && !leftBlocked) {
                // We found a piece blocker
                if (board[chessPiece.position.y][chessPiece.position.x - horizontalOffset].name !== "") {

                    // The only exception is that it's an opposite piece
                    // - That's a valid move
                    if (board[chessPiece.position.y][chessPiece.position.x - horizontalOffset].color !== chessPiece.color)
                        possibleMoves.push([chessPiece.position.y, chessPiece.position.x - horizontalOffset]);

                    leftBlocked = true;
                }
                else
                    possibleMoves.push([chessPiece.position.y, chessPiece.position.x - horizontalOffset]);

            }
            if (chessPiece.position.x + horizontalOffset < 8 && !rightBlocked) {
                // We found a piece blocker
                if (board[chessPiece.position.y][chessPiece.position.x + horizontalOffset].name !== "") {

                    // The only exception is that it's an opposite piece
                    // - That's a valid move
                    if (board[chessPiece.position.y][chessPiece.position.x + horizontalOffset].color !== chessPiece.color)
                        possibleMoves.push([chessPiece.position.y, chessPiece.position.x + horizontalOffset]);

                    rightBlocked = true;
                }
                else
                    possibleMoves.push([chessPiece.position.y, chessPiece.position.x + horizontalOffset]);
            }
        }

        // Go Diagonally
        let diagonalMaxDistance = Math.max(chessPiece.position.x, 8 - chessPiece.position.x - 1);
        let leftUpBlocked = false;
        let leftDownBlocked = false;
        let rightUpBlocked = false;
        let rightDownBlocked = false;
        for (let diagonalOffset = 1; diagonalOffset <= diagonalMaxDistance; diagonalOffset++) {
            if (chessPiece.position.y - diagonalOffset >= 0 && chessPiece.position.x - diagonalOffset >= 0 && !leftUpBlocked) {
                // We found a piece blocker
                if (board[chessPiece.position.y - diagonalOffset][chessPiece.position.x - diagonalOffset].name !== "") {

                    // The only exception is that it's an opposite piece
                    // - That's a valid move
                    if (board[chessPiece.position.y - diagonalOffset][chessPiece.position.x - diagonalOffset].color !== chessPiece.color)
                        possibleMoves.push([chessPiece.position.y - diagonalOffset, chessPiece.position.x - diagonalOffset]);

                    leftUpBlocked = true;
                }
                else
                    possibleMoves.push([chessPiece.position.y - diagonalOffset, chessPiece.position.x - diagonalOffset]);
            }
            if (chessPiece.position.y + diagonalOffset < 8 && chessPiece.position.x - diagonalOffset >= 0 && !leftDownBlocked) {
                // We found a piece blocker
                if (board[chessPiece.position.y + diagonalOffset][chessPiece.position.x - diagonalOffset].name !== "") {

                    // The only exception is that it's an opposite piece
                    // - That's a valid move
                    if (board[chessPiece.position.y + diagonalOffset][chessPiece.position.x - diagonalOffset].color !== chessPiece.color)
                        possibleMoves.push([chessPiece.position.y + diagonalOffset, chessPiece.position.x - diagonalOffset]);

                    leftDownBlocked = true;
                }
                else
                    possibleMoves.push([chessPiece.position.y + diagonalOffset, chessPiece.position.x - diagonalOffset]);
            }
            if (chessPiece.position.y - diagonalOffset >= 0 && chessPiece.position.x + diagonalOffset < 8 && !rightUpBlocked) {
                // We found a piece blocker
                if (board[chessPiece.position.y - diagonalOffset][chessPiece.position.x + diagonalOffset].name !== "") {

                    // The only exception is that it's an opposite piece
                    // - That's a valid move
                    if (board[chessPiece.position.y - diagonalOffset][chessPiece.position.x + diagonalOffset].color !== chessPiece.color)
                        possibleMoves.push([chessPiece.position.y - diagonalOffset, chessPiece.position.x + diagonalOffset]);

                    rightUpBlocked = true;
                }
                else
                    possibleMoves.push([chessPiece.position.y - diagonalOffset, chessPiece.position.x + diagonalOffset]);
            }
            if (chessPiece.position.y + diagonalOffset < 8 && chessPiece.position.x + diagonalOffset < 8 && !rightDownBlocked) {
                // We found a piece blocker
                if (board[chessPiece.position.y + diagonalOffset][chessPiece.position.x + diagonalOffset].name !== "") {

                    // The only exception is that it's an opposite piece
                    // - That's a valid move
                    if (board[chessPiece.position.y + diagonalOffset][chessPiece.position.x + diagonalOffset].color !== chessPiece.color)
                        possibleMoves.push([chessPiece.position.y + diagonalOffset, chessPiece.position.x + diagonalOffset]);

                    rightDownBlocked = true;
                }
                else
                    possibleMoves.push([chessPiece.position.y + diagonalOffset, chessPiece.position.x + diagonalOffset]);
            }
        }

    }
    // This is a Knight
    else if (chessPiece.name.includes("Knight")) {

        // There are only 8 moves to check
        // Starting from the left
        if (chessPiece.position.x - 2 >= 0) {
            if (chessPiece.position.y + 1 < 8 &&
                (board[chessPiece.position.y + 1][chessPiece.position.x - 2].name === "" ||
                    board[chessPiece.position.y + 1][chessPiece.position.x - 2].color !== chessPiece.color))
                possibleMoves.push([chessPiece.position.y + 1, chessPiece.position.x - 2]);
            if (chessPiece.position.y - 1 >= 0 &&
                (board[chessPiece.position.y - 1][chessPiece.position.x - 2].name === "" ||
                    board[chessPiece.position.y - 1][chessPiece.position.x - 2].color !== chessPiece.color))
                possibleMoves.push([chessPiece.position.y - 1, chessPiece.position.x - 2]);
        }
        if (chessPiece.position.x - 1 >= 0) {
            if (chessPiece.position.y + 2 < 8 &&
                (board[chessPiece.position.y + 2][chessPiece.position.x - 1].name === "" ||
                    board[chessPiece.position.y + 2][chessPiece.position.x - 1].color !== chessPiece.color))
                possibleMoves.push([chessPiece.position.y + 2, chessPiece.position.x - 1]);
            if (chessPiece.position.y - 2 >= 0 &&
                (board[chessPiece.position.y - 2][chessPiece.position.x - 1].name === "" ||
                    board[chessPiece.position.y - 2][chessPiece.position.x - 1].color !== chessPiece.color))
                possibleMoves.push([chessPiece.position.y - 2, chessPiece.position.x - 1]);
        }
        // Now onto the right
        if (chessPiece.position.x + 2 < 8) {
            if (chessPiece.position.y + 1 < 8 &&
                (board[chessPiece.position.y + 1][chessPiece.position.x + 2].name === "" ||
                    board[chessPiece.position.y + 1][chessPiece.position.x + 2].color !== chessPiece.color))
                possibleMoves.push([chessPiece.position.y + 1, chessPiece.position.x + 2]);
            if (chessPiece.position.y - 1 >= 0 &&
                (board[chessPiece.position.y - 1][chessPiece.position.x + 2].name === "" ||
                    board[chessPiece.position.y - 1][chessPiece.position.x + 2].color !== chessPiece.color))
                possibleMoves.push([chessPiece.position.y - 1, chessPiece.position.x + 2]);
        }
        if (chessPiece.position.x + 1 < 8) {
            if (chessPiece.position.y + 2 < 8 &&
                (board[chessPiece.position.y + 2][chessPiece.position.x + 1].name === "" ||
                    board[chessPiece.position.y + 2][chessPiece.position.x + 1].color !== chessPiece.color))
                possibleMoves.push([chessPiece.position.y + 2, chessPiece.position.x + 1]);
            if (chessPiece.position.y - 2 >= 0 &&
                (board[chessPiece.position.y - 2][chessPiece.position.x + 1].name === "" ||
                    board[chessPiece.position.y - 2][chessPiece.position.x + 1].color !== chessPiece.color))
                possibleMoves.push([chessPiece.position.y - 2, chessPiece.position.x + 1]);
        }

    }
    // This is a King WORKING
    else if (chessPiece.name.includes("King")) {

        // Normally this only has 8 possible moves
        if (chessPiece.position.y - 1 >= 0) {
            // Check the left side
            if (chessPiece.position.x - 1 >= 0 &&
                board[chessPiece.position.y - 1][chessPiece.position.x - 1].name !== "" &&
                board[chessPiece.position.y - 1][chessPiece.position.x - 1].color !== chessPiece.color) { ; }
        }

        // The King can castle if it has not moved
        // and
        // does not get checked after castling
        if (!chessPiece.hasMoved && !chessPiece.isAttacked) {
            // Check the left Rook if it hasnt moved yet
            if (board[chessPiece.position.y][0].name === "Rook" && !board[chessPiece.position.y][0].hasMoved) {
                // Now check if the resulting move does end up this King getting checked
                ;
            }
        }

    }
    else {
        console.log("This piece does not have any logic implemented.");
    }

    return possibleMoves;
}
