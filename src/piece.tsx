import React from 'react';

export class Position {
    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    // toString() {
    //     return (8 - this.x + 1) + String.fromCharCode("A".charCodeAt(0) + this.y + 1);
    // }

    fromData(positionObject: Position) {
        this.x = positionObject.x;
        this.y = positionObject.y;
    }
}

export class Piece {
    // These two serves as a unique identifier of this Piece
    // When searching within an array
    private static _uid: number = 0;
    private _uid: number;

    private _name: string;
    private _color: string;
    private _position: Position;
    private _hasMoved: boolean;
    private _isAttacked: boolean;
    private _moves: Array<Position>;
    private _attacks: Array<Position>;

    constructor(name: string = "", color: string = "", position: Position = new Position(), empty: boolean = true) {

        // If the piece serves as an empty piece,
        // we need to invalidate this piece by setting -1
        if (!empty)
            this._uid = Piece._uid++;
        else
            this._uid = -1;

        this._name = name;
        this._color = color;
        this._position = new Position();
        this._position.fromData(position);
        this._hasMoved = false;
        this._isAttacked = false;
        this._moves = [];
        this._attacks = [];
    }

    get uid(): number { return this._uid; }
    get name(): string { return this._name; }
    get imageSource(): string { return "assets/" + this.name + " " + this.color + ".png"; }
    get color(): string { return this._color; }
    get position(): Position { return this._position; }
    get hasMoved(): boolean { return this._hasMoved; }
    get isAttacked(): boolean { return this._isAttacked; }
    get moves(): Array<Position> {
        // To avoid mutability, we get a copy of the array and the objects as well

        let copy: Array<Position> = [];

        copy = (this._moves.map((position) => {
            let newValue = new Position();
            newValue.fromData(position);

            return newValue;
        }));

        return copy;
    }
    get attacks(): Array<Position> {
        // To avoid mutability, we get a copy of the array and the objects as well

        let copy: Array<Position> = [];

        copy = (this._attacks.map((position) => {
            let newValue = new Position();
            newValue.fromData(position);

            return newValue;
        }));

        return copy;
    }

    set position(position: Position) {
        this._position.fromData(position);
    }

    setMoved() {
        this._hasMoved = true;
    }

    clearName() { this._name = ""; }

    fromData(pieceObject: Piece): void {
        this._uid = pieceObject.uid;
        this._name = pieceObject.name.slice();
        this._color = pieceObject.color.slice();
        this._position.fromData(pieceObject.position);
        this._hasMoved = pieceObject.hasMoved;
        this._isAttacked = pieceObject.isAttacked;
        this._moves = pieceObject.moves.slice();
        this._attacks = pieceObject.attacks.slice();
    }

    availableMoves(board: Array<Array<Piece>>, remainingOppositePieces?: Array<Piece>) {
        let possibleMoves: Array<Position> = [];
        let possibleAttacks: Array<Position> = [];

        // For attacks, we don't care if the targeted position has any kind of piece in it

        // This is a Pawn
        if (this.name === "Pawn") {

            if (this.color === "B") {
                // Check diagonally left
                if (this.position.x !== 0 && this.position.y !== 7) {
                    let tiles = board[this.position.y + 1][this.position.x - 1];

                    if (tiles.name !== "" && tiles.color === "W")
                        possibleMoves.push(new Position(this.position.x - 1, this.position.y + 1));

                    possibleAttacks.push(new Position(this.position.x - 1, this.position.y + 1));
                }
                // Check diagonally right
                if (this.position.x !== 7 && this.position.y !== 7) {
                    let tiles = board[this.position.y + 1][this.position.x + 1];

                    if (tiles.name !== "" && tiles.color === "W")
                        possibleMoves.push(new Position(this.position.x + 1, this.position.y + 1));

                    possibleAttacks.push(new Position(this.position.x + 1, this.position.y + 1));
                }

                // Check infront
                if (this.position.y !== 7 && board[this.position.y + 1][this.position.x].name === "")
                    possibleMoves.push(new Position(this.position.x, this.position.y + 1));

                // If itself did not move and no other piece are on that tile
                if (this.position.y === 1 && board[this.position.y + 2][this.position.x].name === "")
                    possibleMoves.push(new Position(this.position.x, this.position.y + 2));
            }
            if (this.color === "W") {
                // Check diagonally left
                if (this.position.x !== 0 && this.position.y !== 0) {
                    let tiles = board[this.position.y - 1][this.position.x - 1];

                    if (tiles.name !== "" && tiles.color === "B")
                        possibleMoves.push(new Position(this.position.x - 1, this.position.y - 1));

                    possibleAttacks.push(new Position(this.position.x - 1, this.position.y - 1));
                }
                // Check diagonally right
                if (this.position.x !== 7 && this.position.y !== 0) {
                    let tiles = board[this.position.y - 1][this.position.x + 1];

                    if (tiles.name !== "" && tiles.color === "B")
                        possibleMoves.push(new Position(this.position.x + 1, this.position.y - 1));

                    possibleAttacks.push(new Position(this.position.x + 1, this.position.y - 1));
                }

                // Check infront
                if (this.position.y !== 0 && board[this.position.y - 1][this.position.x].name === "")
                    possibleMoves.push(new Position(this.position.x, this.position.y - 1));

                // If itself did not move
                if (this.position.y === 6 && board[this.position.y - 2][this.position.x].name === "")
                    possibleMoves.push(new Position(this.position.x, this.position.y - 2));
            }
        }
        // This is a Rook
        else if (this.name === "Rook") {

            // Go Vertically
            let verticalMaxDistance = Math.max(this.position.y, 8 - this.position.y - 1);
            let upBlocked = false;
            let downBlocked = false;
            for (let verticalOffset = 1; verticalOffset <= verticalMaxDistance; verticalOffset++) {
                if (this.position.y - verticalOffset >= 0 && !upBlocked) {
                    // We found a piece blocker
                    if (board[this.position.y - verticalOffset][this.position.x].name !== "") {

                        // The only exception is that it's an opposite piece
                        // - That's a valid move
                        if (board[this.position.y - verticalOffset][this.position.x].color !== this.color)
                            possibleMoves.push(new Position(this.position.x, this.position.y - verticalOffset));

                        upBlocked = true;
                    }
                    else
                        possibleMoves.push(new Position(this.position.x, this.position.y - verticalOffset));

                }
                if (this.position.y + verticalOffset < 8 && !downBlocked) {
                    // We found a piece blocker
                    if (board[this.position.y + verticalOffset][this.position.x].name !== "") {

                        // The only exception is that it's an opposite piece
                        // - That's a valid move
                        if (board[this.position.y + verticalOffset][this.position.x].color !== this.color)
                            possibleMoves.push(new Position(this.position.x, this.position.y + verticalOffset));

                        downBlocked = true;
                    }
                    else
                        possibleMoves.push(new Position(this.position.x, this.position.y + verticalOffset));
                }
            }

            // Go Horizontally
            let horizontalMaxDistance = Math.max(this.position.x, 8 - this.position.x - 1);
            let leftBlocked = false;
            let rightBlocked = false;
            for (let horizontalOffset = 1; horizontalOffset <= horizontalMaxDistance; horizontalOffset++) {
                if (this.position.x - horizontalOffset >= 0 && !leftBlocked) {
                    // We found a piece blocker
                    if (board[this.position.y][this.position.x - horizontalOffset].name !== "") {

                        // The only exception is that it's an opposite piece
                        // - That's a valid move
                        if (board[this.position.y][this.position.x - horizontalOffset].color !== this.color)
                            possibleMoves.push(new Position(this.position.x - horizontalOffset, this.position.y));

                        leftBlocked = true;
                    }
                    else
                        possibleMoves.push(new Position(this.position.x - horizontalOffset, this.position.y));

                }
                if (this.position.x + horizontalOffset < 8 && !rightBlocked) {
                    // We found a piece blocker
                    if (board[this.position.y][this.position.x + horizontalOffset].name !== "") {

                        // The only exception is that it's an opposite piece
                        // - That's a valid move
                        if (board[this.position.y][this.position.x + horizontalOffset].color !== this.color)
                            possibleMoves.push(new Position(this.position.x + horizontalOffset, this.position.y));

                        rightBlocked = true;
                    }
                    else
                        possibleMoves.push(new Position(this.position.x + horizontalOffset, this.position.y));
                }
            }

        }
        // This is a Bishop
        else if (this.name === "Bishop") {

            // Go Diagonally
            let diagonalMaxDistance = Math.max(this.position.x, 8 - this.position.x - 1);
            let leftUpBlocked = false;
            let leftDownBlocked = false;
            let rightUpBlocked = false;
            let rightDownBlocked = false;
            for (let diagonalOffset = 1; diagonalOffset <= diagonalMaxDistance; diagonalOffset++) {
                if (this.position.y - diagonalOffset >= 0 && this.position.x - diagonalOffset >= 0 && !leftUpBlocked) {
                    // We found a piece blocker
                    if (board[this.position.y - diagonalOffset][this.position.x - diagonalOffset].name !== "") {

                        // The only exception is that it's an opposite piece
                        // - That's a valid move
                        if (board[this.position.y - diagonalOffset][this.position.x - diagonalOffset].color !== this.color)
                            possibleMoves.push(new Position(this.position.x - diagonalOffset, this.position.y - diagonalOffset));

                        leftUpBlocked = true;
                    }
                    else
                        possibleMoves.push(new Position(this.position.x - diagonalOffset, this.position.y - diagonalOffset));
                }
                if (this.position.y + diagonalOffset < 8 && this.position.x - diagonalOffset >= 0 && !leftDownBlocked) {
                    // We found a piece blocker
                    if (board[this.position.y + diagonalOffset][this.position.x - diagonalOffset].name !== "") {

                        // The only exception is that it's an opposite piece
                        // - That's a valid move
                        if (board[this.position.y + diagonalOffset][this.position.x - diagonalOffset].color !== this.color)
                            possibleMoves.push(new Position(this.position.x - diagonalOffset, this.position.y + diagonalOffset));

                        leftDownBlocked = true;
                    }
                    else
                        possibleMoves.push(new Position(this.position.x - diagonalOffset, this.position.y + diagonalOffset));
                }
                if (this.position.y - diagonalOffset >= 0 && this.position.x + diagonalOffset < 8 && !rightUpBlocked) {
                    // We found a piece blocker
                    if (board[this.position.y - diagonalOffset][this.position.x + diagonalOffset].name !== "") {

                        // The only exception is that it's an opposite piece
                        // - That's a valid move
                        if (board[this.position.y - diagonalOffset][this.position.x + diagonalOffset].color !== this.color)
                            possibleMoves.push(new Position(this.position.x + diagonalOffset, this.position.y - diagonalOffset));

                        rightUpBlocked = true;
                    }
                    else
                        possibleMoves.push(new Position(this.position.x + diagonalOffset, this.position.y - diagonalOffset));
                }
                if (this.position.y + diagonalOffset < 8 && this.position.x + diagonalOffset < 8 && !rightDownBlocked) {
                    // We found a piece blocker
                    if (board[this.position.y + diagonalOffset][this.position.x + diagonalOffset].name !== "") {

                        // The only exception is that it's an opposite piece
                        // - That's a valid move
                        if (board[this.position.y + diagonalOffset][this.position.x + diagonalOffset].color !== this.color)
                            possibleMoves.push(new Position(this.position.x + diagonalOffset, this.position.y + diagonalOffset));

                        rightDownBlocked = true;
                    }
                    else
                        possibleMoves.push(new Position(this.position.x + diagonalOffset, this.position.y + diagonalOffset));
                }
            }

        }
        // This is a Queen
        else if (this.name === "Queen") {

            // Go Vertically
            let verticalMaxDistance = Math.max(this.position.y, 8 - this.position.y - 1);
            let upBlocked = false;
            let downBlocked = false;
            for (let verticalOffset = 1; verticalOffset <= verticalMaxDistance; verticalOffset++) {
                if (this.position.y - verticalOffset >= 0 && !upBlocked) {
                    // We found a piece blocker
                    if (board[this.position.y - verticalOffset][this.position.x].name !== "") {

                        // The only exception is that it's an opposite piece
                        // - That's a valid move
                        if (board[this.position.y - verticalOffset][this.position.x].color !== this.color)
                            possibleMoves.push(new Position(this.position.x, this.position.y - verticalOffset));

                        upBlocked = true;
                    }
                    else
                        possibleMoves.push(new Position(this.position.x, this.position.y - verticalOffset));

                }
                if (this.position.y + verticalOffset < 8 && !downBlocked) {
                    // We found a piece blocker
                    if (board[this.position.y + verticalOffset][this.position.x].name !== "") {

                        // The only exception is that it's an opposite piece
                        // - That's a valid move
                        if (board[this.position.y + verticalOffset][this.position.x].color !== this.color)
                            possibleMoves.push(new Position(this.position.x, this.position.y + verticalOffset));

                        downBlocked = true;
                    }
                    else
                        possibleMoves.push(new Position(this.position.x, this.position.y + verticalOffset));
                }
            }

            // Go Horizontally
            let horizontalMaxDistance = Math.max(this.position.x, 8 - this.position.x - 1);
            let leftBlocked = false;
            let rightBlocked = false;
            for (let horizontalOffset = 1; horizontalOffset <= horizontalMaxDistance; horizontalOffset++) {
                if (this.position.x - horizontalOffset >= 0 && !leftBlocked) {
                    // We found a piece blocker
                    if (board[this.position.y][this.position.x - horizontalOffset].name !== "") {

                        // The only exception is that it's an opposite piece
                        // - That's a valid move
                        if (board[this.position.y][this.position.x - horizontalOffset].color !== this.color)
                            possibleMoves.push(new Position(this.position.x - horizontalOffset, this.position.y));

                        leftBlocked = true;
                    }
                    else
                        possibleMoves.push(new Position(this.position.x - horizontalOffset, this.position.y));

                }
                if (this.position.x + horizontalOffset < 8 && !rightBlocked) {
                    // We found a piece blocker
                    if (board[this.position.y][this.position.x + horizontalOffset].name !== "") {

                        // The only exception is that it's an opposite piece
                        // - That's a valid move
                        if (board[this.position.y][this.position.x + horizontalOffset].color !== this.color)
                            possibleMoves.push(new Position(this.position.x + horizontalOffset, this.position.y));

                        rightBlocked = true;
                    }
                    else
                        possibleMoves.push(new Position(this.position.x + horizontalOffset, this.position.y));
                }
            }

            // Go Diagonally
            let diagonalMaxDistance = Math.max(this.position.x, 8 - this.position.x - 1);
            let leftUpBlocked = false;
            let leftDownBlocked = false;
            let rightUpBlocked = false;
            let rightDownBlocked = false;
            for (let diagonalOffset = 1; diagonalOffset <= diagonalMaxDistance; diagonalOffset++) {
                if (this.position.y - diagonalOffset >= 0 && this.position.x - diagonalOffset >= 0 && !leftUpBlocked) {
                    // We found a piece blocker
                    if (board[this.position.y - diagonalOffset][this.position.x - diagonalOffset].name !== "") {

                        // The only exception is that it's an opposite piece
                        // - That's a valid move
                        if (board[this.position.y - diagonalOffset][this.position.x - diagonalOffset].color !== this.color)
                            possibleMoves.push(new Position(this.position.x - diagonalOffset, this.position.y - diagonalOffset));

                        leftUpBlocked = true;
                    }
                    else
                        possibleMoves.push(new Position(this.position.x - diagonalOffset, this.position.y - diagonalOffset));
                }
                if (this.position.y + diagonalOffset < 8 && this.position.x - diagonalOffset >= 0 && !leftDownBlocked) {
                    // We found a piece blocker
                    if (board[this.position.y + diagonalOffset][this.position.x - diagonalOffset].name !== "") {

                        // The only exception is that it's an opposite piece
                        // - That's a valid move
                        if (board[this.position.y + diagonalOffset][this.position.x - diagonalOffset].color !== this.color)
                            possibleMoves.push(new Position(this.position.x - diagonalOffset, this.position.y + diagonalOffset));

                        leftDownBlocked = true;
                    }
                    else
                        possibleMoves.push(new Position(this.position.x - diagonalOffset, this.position.y + diagonalOffset));
                }
                if (this.position.y - diagonalOffset >= 0 && this.position.x + diagonalOffset < 8 && !rightUpBlocked) {
                    // We found a piece blocker
                    if (board[this.position.y - diagonalOffset][this.position.x + diagonalOffset].name !== "") {

                        // The only exception is that it's an opposite piece
                        // - That's a valid move
                        if (board[this.position.y - diagonalOffset][this.position.x + diagonalOffset].color !== this.color)
                            possibleMoves.push(new Position(this.position.x + diagonalOffset, this.position.y - diagonalOffset));

                        rightUpBlocked = true;
                    }
                    else
                        possibleMoves.push(new Position(this.position.x + diagonalOffset, this.position.y - diagonalOffset));
                }
                if (this.position.y + diagonalOffset < 8 && this.position.x + diagonalOffset < 8 && !rightDownBlocked) {
                    // We found a piece blocker
                    if (board[this.position.y + diagonalOffset][this.position.x + diagonalOffset].name !== "") {

                        // The only exception is that it's an opposite piece
                        // - That's a valid move
                        if (board[this.position.y + diagonalOffset][this.position.x + diagonalOffset].color !== this.color)
                            possibleMoves.push(new Position(this.position.x + diagonalOffset, this.position.y + diagonalOffset));

                        rightDownBlocked = true;
                    }
                    else
                        possibleMoves.push(new Position(this.position.x + diagonalOffset, this.position.y + diagonalOffset));
                }
            }

        }
        // This is a Knight
        else if (this.name === "Knight") {

            // There are only 8 moves to check
            // Starting from the left
            if (this.position.x - 2 >= 0) {
                if (this.position.y + 1 < 8 &&
                    (board[this.position.y + 1][this.position.x - 2].name === "" ||
                        board[this.position.y + 1][this.position.x - 2].color !== this.color))
                    possibleMoves.push(new Position(this.position.x - 2, this.position.y + 1));
                if (this.position.y - 1 >= 0 &&
                    (board[this.position.y - 1][this.position.x - 2].name === "" ||
                        board[this.position.y - 1][this.position.x - 2].color !== this.color))
                    possibleMoves.push(new Position(this.position.x - 2, this.position.y - 1));
            }
            if (this.position.x - 1 >= 0) {
                if (this.position.y + 2 < 8 &&
                    (board[this.position.y + 2][this.position.x - 1].name === "" ||
                        board[this.position.y + 2][this.position.x - 1].color !== this.color))
                    possibleMoves.push(new Position(this.position.x - 1, this.position.y + 2));
                if (this.position.y - 2 >= 0 &&
                    (board[this.position.y - 2][this.position.x - 1].name === "" ||
                        board[this.position.y - 2][this.position.x - 1].color !== this.color))
                    possibleMoves.push(new Position(this.position.x - 1, this.position.y - 2));
            }
            // Now onto the right
            if (this.position.x + 2 < 8) {
                if (this.position.y + 1 < 8 &&
                    (board[this.position.y + 1][this.position.x + 2].name === "" ||
                        board[this.position.y + 1][this.position.x + 2].color !== this.color))
                    possibleMoves.push(new Position(this.position.x + 2, this.position.y + 1));
                if (this.position.y - 1 >= 0 &&
                    (board[this.position.y - 1][this.position.x + 2].name === "" ||
                        board[this.position.y - 1][this.position.x + 2].color !== this.color))
                    possibleMoves.push(new Position(this.position.x + 2, this.position.y - 1));
            }
            if (this.position.x + 1 < 8) {
                if (this.position.y + 2 < 8 &&
                    (board[this.position.y + 2][this.position.x + 1].name === "" ||
                        board[this.position.y + 2][this.position.x + 1].color !== this.color))
                    possibleMoves.push(new Position(this.position.x + 1, this.position.y + 2));
                if (this.position.y - 2 >= 0 &&
                    (board[this.position.y - 2][this.position.x + 1].name === "" ||
                        board[this.position.y - 2][this.position.x + 1].color !== this.color))
                    possibleMoves.push(new Position(this.position.x + 1, this.position.y - 2));
            }

        }
        // This is a King WORKING
        else if (this.name === "King") {

            // The logic for this particular piece is a little difficult
            // It can only move to positions that aren't being attacked by other pieces
            // Here we'll calculate all possible moves without caring whether it'll get checked
            // debugger;
            // Check the upper left corner
            if (this.position.y - 1 >= 0 && this.position.x - 1 >= 0) {
                // Only if the targeted position is not the same color piece
                if (board[this.position.y - 1][this.position.x - 1].name === "" ||
                    (board[this.position.y - 1][this.position.x - 1].name !== ""
                        && board[this.position.y - 1][this.position.x - 1].color !== this.color))
                    possibleMoves.push(new Position(this.position.x - 1, this.position.y - 1));
            }

            // Check the top
            if (this.position.y - 1 >= 0) {
                // Only if the targeted position is not the same color piece
                if (board[this.position.y - 1][this.position.x].name === "" ||
                    (board[this.position.y - 1][this.position.x].name !== ""
                        && board[this.position.y - 1][this.position.x].color !== this.color))
                    possibleMoves.push(new Position(this.position.x, this.position.y - 1));
            }

            // Check the upper right corner
            if (this.position.y - 1 >= 0 && this.position.x + 1 <= 7) {
                // Only if the targeted position is not the same color piece
                if (board[this.position.y - 1][this.position.x + 1].name === "" ||
                    (board[this.position.y - 1][this.position.x + 1].name !== ""
                        && board[this.position.y - 1][this.position.x + 1].color !== this.color)) {
                    possibleMoves.push(new Position(this.position.x + 1, this.position.y - 1));
                }
            }

            // Check the bottom left corner
            if (this.position.y + 1 <= 7 && this.position.x - 1 >= 0) {
                // Only if the targeted position is not the same color piece
                if (board[this.position.y + 1][this.position.x - 1].name === "" ||
                    (board[this.position.y + 1][this.position.x - 1].name !== ""
                        && board[this.position.y + 1][this.position.x - 1].color !== this.color))
                    possibleMoves.push(new Position(this.position.x - 1, this.position.y + 1));
            }

            // Check the bottom
            if (this.position.y + 1 <= 7) {
                // Only if the targeted position is not the same color piece
                if (board[this.position.y + 1][this.position.x].name === "" ||
                    (board[this.position.y + 1][this.position.x].name !== ""
                        && board[this.position.y + 1][this.position.x].color !== this.color))
                    possibleMoves.push(new Position(this.position.x, this.position.y + 1));
            }

            // Check the bottom right corner
            if (this.position.y + 1 <= 7 && this.position.x + 1 <= 7) {
                // Only if the targeted position is not the same color piece
                if (board[this.position.y + 1][this.position.x + 1].name === "" ||
                    (board[this.position.y + 1][this.position.x + 1].name !== ""
                        && board[this.position.y + 1][this.position.x + 1].color !== this.color)) {
                    possibleMoves.push(new Position(this.position.x + 1, this.position.y + 1));
                }
            }

            // Check the left
            if (this.position.x - 1 >= 0) {
                // Only if the targeted position is not the same color piece
                if (board[this.position.y][this.position.x - 1].name === "" ||
                    (board[this.position.y][this.position.x - 1].name !== ""
                        && board[this.position.y][this.position.x - 1].color !== this.color))
                    possibleMoves.push(new Position(this.position.x - 1, this.position.y));
            }
            // Check the right
            if (this.position.x + 1 <= 7) {
                // Only if the targeted position is not the same color piece
                if (board[this.position.y][this.position.x + 1].name === "" ||
                    (board[this.position.y][this.position.x + 1].name !== ""
                        && board[this.position.y][this.position.x + 1].color !== this.color))
                    possibleMoves.push(new Position(this.position.x + 1, this.position.y));
            }

            // The King can castle if it has not moved
            // and does not get checked after castling
            // The check will occur after all possible moves are calculated
            if (!this.hasMoved && !this.isAttacked) {
                // Check the left Rook if it hasnt moved yet
                if (board[this.position.y][0].name === "Rook" && !board[this.position.y][0].hasMoved) {
                    // Check if there's a direct pathway
                    let isBlocked = false;

                    for (let i = this.position.x - 1; i > 0; i--) {
                        if (board[this.position.y][i].name !== "") {
                            isBlocked = true;
                            break;
                        }
                    }

                    if (!isBlocked)
                        possibleMoves.push(new Position(this.position.x - 2, this.position.y));
                }

                // Check the right Rook if it hasnt moved yet
                if (board[this.position.y][7].name === "Rook" && !board[this.position.y][7].hasMoved) {
                    // Check if there's a direct pathway
                    let isBlocked = false;

                    for (let i = this.position.x + 1; i < 7; i++)
                        if (board[this.position.y][i].name !== "") {
                            isBlocked = true;
                            break;
                        }

                    if (!isBlocked)
                        possibleMoves.push(new Position(this.position.x + 2, this.position.y));
                }
            }

            // Initially, we may not pass this parameter
            if (Array.isArray(remainingOppositePieces)) {
                // It is passed in
                // We enforce the type of the parameter as follow:
                remainingOppositePieces as Array<Piece>;

                // Now that we have finished calculating all possible moves
                // for King,
                // Extract all possible attack moves for remainingOppositePieces
                let oppositeAttacks: Array<Position> = [];

                remainingOppositePieces.forEach(piece => oppositeAttacks = oppositeAttacks.concat(piece.attacks))

                // Now we iterate through the possibleMoves and filter out the attacked squares
                possibleMoves = possibleMoves.filter(target => {
                    return oppositeAttacks.findIndex(position => {
                        return position.x === target.x && position.y === target.y;
                    }) === -1;
                })
            }
        }
        this._moves = possibleMoves.slice();

        // Currently, only Pawn has specific attack patterns
        // Other pieces have the same possible attack logic as their own movement logic
        if (this.name === "Pawn")
            this._attacks = possibleAttacks.slice();
        else
            this._attacks = possibleMoves.slice();

    }
}