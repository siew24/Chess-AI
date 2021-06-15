import React from 'react';

export interface Piece {
    name: string     // The image location of the chess piece
}

export function ChessPiece(name: Piece) {
    return "assets/" + name.name + ".png";
}