import React from 'react';
import { Game } from './game';

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

    set position(position: Position) { this._position.fromData(position); }

    set attacked(value: boolean) { this._isAttacked = value; }

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

    /**
     * 
     *
     * After evaluating availableMoves,
     * we remove possibilities that may make the King in check, (King is not attacked) or
     * possibilities that may make the King be still in check (King is attacked)
     * 
     * In addition, both King pieces are set their attacked variables here
     * 
     * The modification is done by reference on remainingPieces
    */
    static restrictMovement(board: Array<Array<Piece>>, remainingPieces: { [key: string]: Array<Piece> }, isRecursive: boolean = false): void {
        // Find out if the King is in check
        for (let i = 0; i < remainingPieces["W"].length; i++) {
            if (remainingPieces["W"][i].name === "King") {
                let kingPiece = remainingPieces["W"][i];
                let attackingPiece: Piece | undefined = undefined;
                let moreThanOneAttack: boolean = false;

                // First we set kingPiece to be not attacked
                kingPiece.attacked = false;

                /*
                    An attack can be blocked if:
                    - There's only one attacking piece

                    If there is a chance where two or more attacking pieces
                    that are found, we remove possible blocking moves
                */

                // Check if there's a hidden knight attacking the King
                let knightAttackFound = false;
                for (let xOffset = -2; xOffset <= 2; xOffset++) {
                    if (xOffset === 0)
                        continue;

                    for (let yOffset = -2; yOffset <= 2; yOffset++) {
                        if (yOffset === 0)
                            continue;

                        if (xOffset === yOffset && xOffset === 0)
                            continue;

                        if (Math.abs(xOffset * yOffset) !== 2)
                            continue;

                        // Ensure the position is on the board
                        if ((kingPiece.position.x + xOffset >= 0 && kingPiece.position.x + xOffset <= 7) &&
                            (kingPiece.position.y + yOffset >= 0 && kingPiece.position.y + yOffset <= 7)) {
                            // Check if the position is the opposite-colored knight piece
                            if (board[kingPiece.position.y + yOffset][kingPiece.position.x + xOffset].name === "Knight" &&
                                board[kingPiece.position.y + yOffset][kingPiece.position.x + xOffset].color !== kingPiece.color) {
                                knightAttackFound = true;
                                kingPiece.attacked = true;
                                attackingPiece = board[kingPiece.position.y + yOffset][kingPiece.position.x + xOffset];
                                break;
                            }
                        }

                        if (knightAttackFound)
                            break;
                    }
                }

                /* 
                    We first check for open checks
                    The case where the King is in check also relies on
                    this case

                    Open checks occur on clear line of sights and king attacking events,
                    so for each direction, 
                    we record every same-colored piece and stop on encountering
                    an opposite-colored piece
                */
                // We now iterate through 8 line of sights
                for (let xStep = -1; xStep <= 1; xStep++) {
                    for (let yStep = -1; yStep <= 1; yStep++) {

                        // Exclude 0 0 case
                        if (xStep === yStep && xStep === 0)
                            continue;

                        // Define the xy-direction
                        let xStart = kingPiece.position.x;
                        let yStart = kingPiece.position.y;

                        // Define cache for same-colored piece and opposite-colored piece
                        let pathPositions: Array<Position> = [];
                        let sameBlockingPieces: Array<Piece> = [];
                        let potentialAttackingPiece: Piece = new Piece();

                        // Ensure we're looping within board boundaries
                        while ((xStart + xStep >= 0 && xStart + xStep <= 7) &&
                            (yStart + yStep >= 0 && yStart + yStep <= 7)) {

                            xStart += xStep;
                            yStart += yStep;

                            let currentPiece = board[yStart][xStart];

                            if (currentPiece.uid !== -1) {
                                if (currentPiece.color === kingPiece.color) {
                                    sameBlockingPieces.push(currentPiece);

                                    // If there are more than one same-colored pieces
                                    // on the line of sight
                                    // we can move on to the next line
                                    if (sameBlockingPieces.length > 1)
                                        break;
                                }
                                else {
                                    if (["Knight", "King"].includes(currentPiece.name))
                                        break;

                                    // Check if the piece is a Pawn
                                    if (currentPiece.name === "Pawn") {

                                        if (xStep !== 0 && yStep !== 0) {
                                            // If the Pawn can attack the King
                                            if (currentPiece.attacks.findIndex(positions => kingPiece.position.x === positions.x && kingPiece.position.y === positions.y) !== -1) {
                                                // Check if there's already an attacking piece
                                                if (attackingPiece !== undefined) {
                                                    moreThanOneAttack = true;
                                                    break;
                                                }

                                                // Otherwise we have our first attacking piece
                                                attackingPiece = currentPiece;
                                                kingPiece.attacked = true;
                                                break;
                                            }
                                            else
                                                break;
                                        }
                                        else
                                            break;
                                    }

                                    // Check if the piece is a Bishop
                                    if (currentPiece.name === "Bishop" && (xStep === 0 || yStep === 0))
                                        break;

                                    // Check if the piece is a Rook
                                    if (currentPiece.name === "Rook" && xStep !== 0 && yStep !== 0)
                                        break;

                                    // If we haven't found any same-colored pieces
                                    // but instead encountered a linear movement opposite piece
                                    if (sameBlockingPieces.length === 0) {

                                        // Check if there's already an attacking piece
                                        if (attackingPiece !== undefined) {
                                            moreThanOneAttack = true;
                                            break;
                                        }

                                        // Otherwise we have our first attacking piece
                                        attackingPiece = currentPiece;
                                        kingPiece.attacked = true;
                                        break;
                                    }
                                    else {
                                        potentialAttackingPiece = currentPiece;
                                        break;
                                    }
                                }
                            }

                            pathPositions.push(new Position(xStart, yStart));
                        }
                        if (moreThanOneAttack)
                            break;

                        // If we have reached here, 
                        // either we encountered an opposite piece
                        // or we reach the edge of the board

                        // We reached the edge - we can continue to the next line of sight
                        if (potentialAttackingPiece.uid === -1)
                            continue;

                        // We found a potential open check
                        // Go through each encountered same colored pieces
                        // and filter out those which makes the King to be checked
                        sameBlockingPieces.forEach(piece => {
                            piece._moves = piece.moves.filter(moves => {
                                let index = pathPositions.findIndex(position => moves.x === position.x && moves.y === position.y);

                                if (index !== -1)
                                    return true;

                                // Additionally, we could eat the potential attacker
                                if (moves.x === potentialAttackingPiece.position.x && moves.y === potentialAttackingPiece.position.y)
                                    return true;

                                return false;
                            });

                            // Update this to the remainingPieces as well
                            let index = remainingPieces["W"].findIndex(remain => remain.uid === piece.uid);

                            remainingPieces["W"][index]._moves = piece.moves;
                            remainingPieces["W"][index]._attacks = piece.moves;
                        });
                    }
                    if (moreThanOneAttack)
                        break;
                }

                // When there's only one attacking piece,
                // Eating the attacking piece is valid
                if (!moreThanOneAttack && attackingPiece !== undefined) {
                    // Here we can assume that attackingPiece is passed in

                    // If the attacking piece needs a clear line of sight
                    if (attackingPiece.name !== "Knight") {
                        // Generate a list of possible block positions
                        let blockPositions: Array<Position> = [];
                        // Define the x-direction and step
                        let xStart = kingPiece.position.x;
                        let xStep = kingPiece.position.x < attackingPiece.position.x ? 1
                            : kingPiece.position.x === attackingPiece.position.x ? 0 : -1;
                        // Define the y-direction and step
                        let yStart = kingPiece.position.y;
                        let yStep = kingPiece.position.y < attackingPiece.position.y ? 1
                            : kingPiece.position.y === attackingPiece.position.y ? 0 : -1;

                        xStart += xStep;
                        yStart += yStep;
                        while (attackingPiece.position.x !== xStart && attackingPiece.position.y !== yStart) {
                            blockPositions.push(new Position(xStart, yStart));
                            xStart += xStep;
                            yStart += yStep;
                        }

                        // Go through each piece and clear moves that are not able to block
                        remainingPieces["W"].forEach(piece => {
                            if (piece.name !== "King") {
                                piece._moves = piece.moves.filter(blockingMoves => {
                                    // Keep moves that can block the attack
                                    return blockPositions.findIndex(moves => moves.x === blockingMoves.x && moves.y === blockingMoves.y) !== -1;
                                });
                            }
                        });
                    }

                    // Attacking a piece also prevents checking
                    // Now check it can attack the attacking piece instead
                    remainingPieces["W"].forEach(piece => {
                        if (piece.name !== "King") {
                            piece._attacks = piece.attacks.filter(attackMoves => {
                                // Keep moves that can block the attack
                                return (attackingPiece as Piece).position.x === attackMoves.x
                                    && (attackingPiece as Piece).position.y === attackMoves.y;
                            });

                            if (piece.name !== "Pawn")
                                piece._moves = piece.attacks;
                        }
                    });
                }
                // There is more than one attacker - only King is able to move
                else if (moreThanOneAttack) {
                    // Remove all moves and attacks from every piece except the King
                    remainingPieces["W"].forEach(piece => {
                        if (piece.name !== "King") {
                            piece._moves = [];
                            piece._attacks = [];
                        }
                    })
                }

                // Now we check whether king's attacks can evade checking
                // Copy the board and remainingPieces
                let copyBoard = board.map(row => row.map(piece => {
                    let newPiece = new Piece();
                    newPiece.fromData(piece);
                    return newPiece;
                }));
                let copyRemaining = {
                    "W": remainingPieces["W"].map(piece => {
                        let newPiece = new Piece();
                        newPiece.fromData(piece);
                        return newPiece;
                    }),
                    "B": remainingPieces["B"].map(piece => {
                        let newPiece = new Piece();
                        newPiece.fromData(piece);
                        return newPiece;
                    })
                };

                // Because we're recursively check if kingPiece gets checked after eating
                // one piece, we have to halt it by setting a flag
                if (!isRecursive) {
                    kingPiece._moves = kingPiece.moves.filter(position => {
                        let removedPiece: Piece | undefined;
                        if (board[position.y][position.x].uid !== -1 && kingPiece.color !== board[position.y][position.x].color)
                            copyRemaining["B"] = copyRemaining["B"].filter(piece => {
                                if (piece.position.x !== position.x && piece.position.y !== position.y)
                                    return true;

                                removedPiece = new Piece();
                                removedPiece.fromData(piece);
                                return false;
                            });

                        // We move the piece in our copies
                        copyBoard[position.y][position.x].fromData(kingPiece);
                        copyBoard[position.y][position.x].position.fromData(position);
                        copyBoard[kingPiece.position.y][kingPiece.position.x] = new Piece();


                        // Calculate availableMoves for each piece on the board
                        // the King Pieces have to be the last to be calculated
                        let pieceList: Array<Piece> = [];
                        copyBoard.forEach(row => {
                            row.forEach(piece => {
                                if (piece.uid !== -1) {
                                    if (piece.name === "King")
                                        pieceList.push(piece);
                                    else
                                        piece.availableMoves(copyBoard);
                                }
                            })
                        });

                        // Because board and remainingPieces are mutually exclusive, we have to
                        // iterate through both remainingPieces and board and recalculate availableMoves
                        Game.syncRemainingPieceswithBoard(copyBoard, copyRemaining);

                        if (pieceList[0].color === "W") {
                            pieceList[0].availableMoves(board, remainingPieces["B"]);
                            pieceList[1].availableMoves(board, remainingPieces["W"]);
                        }
                        else {
                            pieceList[1].availableMoves(board, remainingPieces["B"]);
                            pieceList[0].availableMoves(board, remainingPieces["W"]);
                        }

                        // Because board and remainingPieces are mutually exclusive, we have to
                        // iterate through both remainingPieces and board and recalculate availableMoves
                        Game.syncRemainingPieceswithBoard(copyBoard, copyRemaining);
                        Piece.restrictMovement(copyBoard, copyRemaining, true);
                        Game.syncBoardwithRemainingPieces(copyBoard, copyRemaining);

                        // Now check if the result makes our king get checked
                        let returnValue = !copyBoard[position.y][position.x].isAttacked;

                        // Reset the board
                        copyBoard[position.y][position.x] = new Piece();
                        copyBoard[kingPiece.position.y][kingPiece.position.x].fromData(kingPiece);
                        // Add back the removed piece
                        if (removedPiece !== undefined) {
                            remainingPieces["B"].push(removedPiece);
                        }

                        return returnValue;
                    });
                }

                break;
            }
        }

        // Find out if the King is in check
        for (let i = 0; i < remainingPieces["B"].length; i++) {
            if (remainingPieces["B"][i].name === "King") {
                let kingPiece = remainingPieces["B"][i];
                let attackingPiece: Piece | undefined = undefined;
                let moreThanOneAttack: boolean = false;

                // First we set kingPiece to be not attacked
                kingPiece.attacked = false;

                /*
                    An attack can be blocked if:
                    - There's only one attacking piece

                    If there is a chance where two or more attacking pieces
                    that are found, we remove possible blocking moves
                */

                // Check if there's a hidden knight attacking the King
                let knightAttackFound = false;
                for (let xOffset = -2; xOffset <= 2; xOffset++) {
                    if (xOffset === 0)
                        continue;

                    for (let yOffset = -2; yOffset <= 2; yOffset++) {
                        if (yOffset === 0)
                            continue;

                        if (xOffset === yOffset && xOffset === 0)
                            continue;

                        if (Math.abs(xOffset * yOffset) !== 2)
                            continue;

                        // Ensure the position is on the board
                        if ((kingPiece.position.x + xOffset >= 0 && kingPiece.position.x + xOffset <= 7) &&
                            (kingPiece.position.y + yOffset >= 0 && kingPiece.position.y + yOffset <= 7)) {
                            // Check if the position is the opposite-colored knight piece
                            if (board[kingPiece.position.y + yOffset][kingPiece.position.x + xOffset].name === "Knight" &&
                                board[kingPiece.position.y + yOffset][kingPiece.position.x + xOffset].color !== kingPiece.color) {
                                knightAttackFound = true;
                                kingPiece.attacked = true;
                                attackingPiece = board[kingPiece.position.y + yOffset][kingPiece.position.x + xOffset];
                                break;
                            }
                        }

                        if (knightAttackFound)
                            break;
                    }
                }

                /* 
                    We first check for open checks
                    The case where the King is in check also relies on
                    this case

                    Open checks occur on clear line of sights and king attacking events,
                    so for each direction, 
                    we record every same-colored piece and stop on encountering
                    an opposite-colored piece
                */
                // We now iterate through 8 line of sights
                for (let xStep = -1; xStep <= 1; xStep++) {
                    for (let yStep = -1; yStep <= 1; yStep++) {

                        // Exclude 0 0 case
                        if (xStep === yStep && xStep === 0)
                            continue;

                        // Define the xy-direction
                        let xStart = kingPiece.position.x;
                        let yStart = kingPiece.position.y;

                        // Define cache for same-colored piece and opposite-colored piece
                        let pathPositions: Array<Position> = [];
                        let sameBlockingPieces: Array<Piece> = [];
                        let potentialAttackingPiece: Piece = new Piece();

                        // Ensure we're looping within board boundaries
                        while ((xStart + xStep >= 0 && xStart + xStep <= 7) &&
                            (yStart + yStep >= 0 && yStart + yStep <= 7)) {

                            xStart += xStep;
                            yStart += yStep;

                            let currentPiece = board[yStart][xStart];

                            if (currentPiece.uid !== -1) {
                                if (currentPiece.color === kingPiece.color) {
                                    sameBlockingPieces.push(currentPiece);

                                    // If there are more than one same-colored pieces
                                    // on the line of sight
                                    // we can move on to the next line
                                    if (sameBlockingPieces.length > 1)
                                        break;
                                }
                                else {
                                    if (["Knight", "King"].includes(currentPiece.name))
                                        break;

                                    // Check if the piece is a Pawn
                                    if (currentPiece.name === "Pawn") {

                                        if (xStep !== 0 && yStep !== 0) {
                                            // If the Pawn can attack the King
                                            if (currentPiece.attacks.findIndex(positions => kingPiece.position.x === positions.x && kingPiece.position.y === positions.y) !== -1) {
                                                // Check if there's already an attacking piece
                                                if (attackingPiece !== undefined) {
                                                    moreThanOneAttack = true;
                                                    break;
                                                }

                                                // Otherwise we have our first attacking piece
                                                attackingPiece = currentPiece;
                                                kingPiece.attacked = true;
                                                break;
                                            }
                                            else
                                                break;
                                        }
                                        else
                                            break;
                                    }

                                    // Check if the piece is a Bishop
                                    if (currentPiece.name === "Bishop" && (xStep === 0 || yStep === 0))
                                        break;

                                    // Check if the piece is a Rook
                                    if (currentPiece.name === "Rook" && xStep !== 0 && yStep !== 0)
                                        break;

                                    // If we haven't found any same-colored pieces
                                    // but instead encountered a linear movement opposite piece
                                    if (sameBlockingPieces.length === 0) {
                                        // Check if there's already an attacking piece
                                        if (attackingPiece !== undefined) {
                                            moreThanOneAttack = true;
                                            break;
                                        }

                                        // Otherwise we have our first attacking piece
                                        attackingPiece = currentPiece;
                                        kingPiece.attacked = true;
                                        break;
                                    }
                                    else {
                                        potentialAttackingPiece = currentPiece;
                                        break;
                                    }
                                }
                            }

                            pathPositions.push(new Position(xStart, yStart));
                        }
                        if (moreThanOneAttack)
                            break;

                        // If we have reached here, 
                        // either we encountered an opposite piece
                        // or we reach the edge of the board

                        // We reached the edge - we can continue to the next line of sight
                        if (potentialAttackingPiece.uid === -1)
                            continue;

                        // We found a potential open check
                        // Go through each encountered same colored pieces
                        // and filter out those which makes the King to be checked
                        sameBlockingPieces.forEach(piece => {
                            piece._moves = piece.moves.filter(moves => {
                                let index = pathPositions.findIndex(position => moves.x === position.x && moves.y === position.y);

                                if (index !== -1)
                                    return true;

                                // Additionally, we could eat the potential attacker
                                if (moves.x === potentialAttackingPiece.position.x && moves.y === potentialAttackingPiece.position.y)
                                    return true;

                                return false;
                            });

                            // Update this to the remainingPieces as well
                            let index = remainingPieces["B"].findIndex(remain => remain.uid === piece.uid);

                            remainingPieces["B"][index]._moves = piece.moves;
                            remainingPieces["B"][index]._attacks = piece.moves;
                        });
                    }
                    if (moreThanOneAttack)
                        break;
                }

                // When there's only one attacking piece,
                // Eating the attacking piece is valid
                if (!moreThanOneAttack && attackingPiece !== undefined) {
                    // Here we can assume that attackingPiece is passed in

                    // If the attacking piece needs a clear line of sight
                    if (attackingPiece.name !== "Knight") {
                        // Generate a list of possible block positions
                        let blockPositions: Array<Position> = [];
                        // Define the x-direction and step
                        let xStart = kingPiece.position.x;
                        let xStep = kingPiece.position.x < attackingPiece.position.x ? 1
                            : kingPiece.position.x === attackingPiece.position.x ? 0 : -1;
                        // Define the y-direction and step
                        let yStart = kingPiece.position.y;
                        let yStep = kingPiece.position.y < attackingPiece.position.y ? 1
                            : kingPiece.position.y === attackingPiece.position.y ? 0 : -1;

                        xStart += xStep;
                        yStart += yStep;
                        while (attackingPiece.position.x !== xStart && attackingPiece.position.y !== yStart) {
                            blockPositions.push(new Position(xStart, yStart));
                            xStart += xStep;
                            yStart += yStep;
                        }

                        // Go through each piece and clear moves that are not able to block
                        remainingPieces["B"].forEach(piece => {
                            if (piece.name !== "King") {
                                piece._moves = piece.moves.filter(blockingMoves => {
                                    // Keep moves that can block the attack
                                    return blockPositions.findIndex(moves => moves.x === blockingMoves.x && moves.y === blockingMoves.y) !== -1;
                                });
                            }
                        });
                    }

                    // Attacking a piece also prevents checking
                    // Now check it can attack the attacking piece instead
                    remainingPieces["B"].forEach(piece => {
                        if (piece.name !== "King") {
                            piece._attacks = piece.attacks.filter(attackMoves => {
                                // Keep moves that can block the attack
                                return (attackingPiece as Piece).position.x === attackMoves.x
                                    && (attackingPiece as Piece).position.y === attackMoves.y;
                            });

                            if (piece.name !== "Pawn")
                                piece._moves = piece.attacks;
                        }
                    });
                }
                // There is more than one attacker - only King is able to move
                else if (moreThanOneAttack) {
                    // Remove all moves and attacks from every piece except the King
                    remainingPieces["B"].forEach(piece => {
                        if (piece.name !== "King") {
                            piece._moves = [];
                            piece._attacks = [];
                        }
                    })
                }

                // Now we check whether king's attacks can evade checking
                // Copy the board and remainingPieces
                let copyBoard = board.map(row => row.map(piece => {
                    let newPiece = new Piece();
                    newPiece.fromData(piece);
                    return newPiece;
                }));
                let copyRemaining = {
                    "W": remainingPieces["W"].map(piece => {
                        let newPiece = new Piece();
                        newPiece.fromData(piece);
                        return newPiece;
                    }),
                    "B": remainingPieces["B"].map(piece => {
                        let newPiece = new Piece();
                        newPiece.fromData(piece);
                        return newPiece;
                    })
                };

                // Because we're recursively check if kingPiece gets checked after eating
                // one piece, we have to halt it by setting a flag
                if (!isRecursive) {
                    kingPiece._moves = kingPiece.moves.filter(position => {
                        let removedPiece: Piece | undefined;
                        if (board[position.y][position.x].uid !== -1 && kingPiece.color !== board[position.y][position.x].color)
                            copyRemaining["W"] = copyRemaining["W"].filter(piece => {
                                if (piece.position.x !== position.x && piece.position.y !== position.y)
                                    return true;

                                removedPiece = new Piece();
                                removedPiece.fromData(piece);
                                return false;
                            });

                        // We move the piece in our copies
                        copyBoard[position.y][position.x].fromData(kingPiece);
                        copyBoard[position.y][position.x].position.fromData(position);
                        copyBoard[kingPiece.position.y][kingPiece.position.x] = new Piece();


                        // Calculate availableMoves for each piece on the board
                        // the King Pieces have to be the last to be calculated
                        let pieceList: Array<Piece> = [];
                        copyBoard.forEach(row => {
                            row.forEach(piece => {
                                if (piece.uid !== -1) {
                                    if (piece.name === "King")
                                        pieceList.push(piece);
                                    else
                                        piece.availableMoves(copyBoard);
                                }
                            })
                        });

                        // Because board and remainingPieces are mutually exclusive, we have to
                        // iterate through both remainingPieces and board and recalculate availableMoves
                        Game.syncRemainingPieceswithBoard(copyBoard, copyRemaining);

                        if (pieceList[0].color === "B") {
                            pieceList[0].availableMoves(board, remainingPieces["W"]);
                            pieceList[1].availableMoves(board, remainingPieces["B"]);
                        }
                        else {
                            pieceList[1].availableMoves(board, remainingPieces["W"]);
                            pieceList[0].availableMoves(board, remainingPieces["B"]);
                        }

                        // Because board and remainingPieces are mutually exclusive, we have to
                        // iterate through both remainingPieces and board and recalculate availableMoves
                        Game.syncRemainingPieceswithBoard(copyBoard, copyRemaining);
                        Piece.restrictMovement(copyBoard, copyRemaining, true);
                        Game.syncBoardwithRemainingPieces(copyBoard, copyRemaining);

                        // Now check if the result makes our king get checked
                        let returnValue = !copyBoard[position.y][position.x].isAttacked;

                        // Reset the board
                        copyBoard[position.y][position.x] = new Piece();
                        copyBoard[kingPiece.position.y][kingPiece.position.x].fromData(kingPiece);
                        // Add back the removed piece
                        if (removedPiece !== undefined) {
                            remainingPieces["W"].push(removedPiece);
                        }

                        return returnValue;
                    });
                }

                break;
            }
        }
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
                if (this.position.y !== 7 && board[this.position.y + 1][this.position.x].uid === -1) {
                    possibleMoves.push(new Position(this.position.x, this.position.y + 1));

                    // If itself did not move and no other piece are on that tile
                    if (this.position.y === 1 && board[this.position.y + 2][this.position.x].uid === -1)
                        possibleMoves.push(new Position(this.position.x, this.position.y + 2));
                }
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
                if (this.position.y !== 0 && board[this.position.y - 1][this.position.x].uid === -1) {
                    possibleMoves.push(new Position(this.position.x, this.position.y - 1));

                    // If itself did not move
                    if (this.position.y === 6 && board[this.position.y - 2][this.position.x].uid === -1)
                        possibleMoves.push(new Position(this.position.x, this.position.y - 2));
                }
            }
        }
        // This is a Rook
        else if (this.name === "Rook") {

            for (let xStep = -1; xStep <= 1; xStep++) {
                for (let yStep = -1; yStep <= 1; yStep++) {

                    if (xStep * yStep !== 0)
                        continue;

                    if (xStep === yStep && xStep === 0)
                        continue;

                    // Define starting position
                    let xStart = this.position.x;
                    let yStart = this.position.y;

                    // Ensure we're looping within board boundaries
                    while ((xStart + xStep >= 0 && xStart + xStep <= 7) &&
                        (yStart + yStep >= 0 && yStart + yStep <= 7)) {

                        xStart += xStep;
                        yStart += yStep;

                        // Stop traversing this line when
                        // some piece has blocked the line of sight
                        if (board[yStart][xStart].uid !== -1) {
                            // The only exception is the piece is an opposite color
                            if (board[yStart][xStart].color !== this.color)
                                possibleMoves.push(new Position(xStart, yStart));

                            break;
                        }

                        possibleMoves.push(new Position(xStart, yStart));
                    }
                }
            }
        }
        // This is a Bishop
        else if (this.name === "Bishop") {

            for (let xStep = -1; xStep <= 1; xStep += 2) {

                for (let yStep = -1; yStep <= 1; yStep += 2) {
                    // Define the xy-direction
                    let xStart = this.position.x;
                    let yStart = this.position.y;

                    // Ensure we're looping within board boundaries
                    while ((xStart + xStep >= 0 && xStart + xStep <= 7) &&
                        (yStart + yStep >= 0 && yStart + yStep <= 7)) {

                        xStart += xStep;
                        yStart += yStep;

                        // Stop traversing this line when
                        // some piece has blocked the line of sight
                        if (board[yStart][xStart].uid !== -1) {
                            // The only exception is the piece is an opposite color
                            if (board[yStart][xStart].color !== this.color)
                                possibleMoves.push(new Position(xStart, yStart));

                            break;
                        }

                        possibleMoves.push(new Position(xStart, yStart));
                    }
                }
            }
        }
        // This is a Queen
        else if (this.name === "Queen") {

            // Go Diagonally
            for (let xStep = -1; xStep <= 1; xStep++) {
                for (let yStep = -1; yStep <= 1; yStep++) {

                    if (xStep === yStep && xStep === 0)
                        continue;

                    // Define the starting position
                    let xStart = this.position.x;
                    let yStart = this.position.y;

                    // Ensure we're looping within board boundaries
                    while ((xStart + xStep >= 0 && xStart + xStep <= 7) &&
                        (yStart + yStep >= 0 && yStart + yStep <= 7)) {

                        xStart += xStep;
                        yStart += yStep;

                        // Stop traversing this line when
                        // some piece has blocked the line of sight
                        if (board[yStart][xStart].uid !== -1) {
                            // The only exception is the piece is an opposite color
                            if (board[yStart][xStart].color !== this.color)
                                possibleMoves.push(new Position(xStart, yStart));

                            break;
                        }

                        possibleMoves.push(new Position(xStart, yStart));
                    }
                }
            }

        }
        // This is a Knight
        else if (this.name === "Knight") {

            // Check for 8 moves
            for (let xOffset = -2; xOffset <= 2; xOffset++) {
                if (xOffset === 0)
                    continue;

                for (let yOffset = -2; yOffset <= 2; yOffset++) {
                    if (yOffset === 0)
                        continue;

                    if (Math.abs(xOffset * yOffset) !== 2)
                        continue;

                    // Ensure the position is on the board
                    if ((this.position.x + xOffset >= 0 && this.position.x + xOffset <= 7) &&
                        (this.position.y + yOffset >= 0 && this.position.y + yOffset <= 7)) {
                        // Check if the position is a same-colored piece
                        if (board[this.position.y + yOffset][this.position.x + xOffset].uid !== -1 &&
                            board[this.position.y + yOffset][this.position.x + xOffset].color === this.color)
                            continue;

                        // Otherwise add this move
                        possibleMoves.push(new Position(this.position.x + xOffset, this.position.y + yOffset));
                    }
                }
            }
        }
        // This is a King WORKING
        else if (this.name === "King") {

            // The logic for this particular piece is a little difficult
            // It can only move to positions that aren't being attacked by other pieces
            // Here we'll calculate all possible moves without caring whether it'll get checked

            for (let xStep = -1; xStep <= 1; xStep++) {
                for (let yStep = -1; yStep <= 1; yStep++) {

                    if (xStep === yStep && xStep === 0)
                        continue;

                    // Define the xy-direction
                    let xStart = this.position.x;
                    let yStart = this.position.y;

                    // Ensure we're looping within board boundaries
                    if ((xStart + xStep >= 0 && xStart + xStep <= 7) &&
                        (yStart + yStep >= 0 && yStart + yStep <= 7)) {

                        xStart += xStep;
                        yStart += yStep;

                        if (board[yStart][xStart].uid !== -1) {
                            // If we encounter an opposite colored piece
                            if (board[yStart][xStart].color !== this.color)
                                possibleMoves.push(new Position(xStart, yStart));
                        }
                        else
                            possibleMoves.push(new Position(xStart, yStart));
                    }
                }
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