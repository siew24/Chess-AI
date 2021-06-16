import React from 'react';

export interface Position {
    x: number,
    y: number
}

export type Piece = {
    name: string,     // The image location of the chess piece
    color: string,  // A one-character identifier
    position: Position,
    hasMoved: boolean,
    isAttacked: boolean
}

export function ChessPiece(chessPiece: Piece) {
    return "assets/" + chessPiece.name + " " + chessPiece.color + ".png";
}

// A placeholder
export function availableMoves(board: Array<Array<Piece>>, chessPiece: Piece) {
    return [[0, 0]];
}