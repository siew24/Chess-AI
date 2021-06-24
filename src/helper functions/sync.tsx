import { Piece } from '../piece';

/** Updates remainingPieces with the newer info from the Board */
export function syncRemainingPieceswithBoard(board: Array<Array<Piece>>, remainingPieces: { [key: string]: Array<Piece> }): void {
    remainingPieces["W"].forEach(piece => {
        for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
            for (let columnIndex = 0; columnIndex < board[rowIndex].length; columnIndex++) {
                if (board[rowIndex][columnIndex].uid === piece.uid) {
                    // Fetch updated data from Board piece
                    piece.fromData(board[rowIndex][columnIndex]);
                }
            }
        }
    }
    );
    remainingPieces["B"].forEach(piece => {
        for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
            for (let columnIndex = 0; columnIndex < board[rowIndex].length; columnIndex++) {
                if (board[rowIndex][columnIndex].uid === piece.uid) {
                    // Fetch updated data from Board piece
                    piece.fromData(board[rowIndex][columnIndex]);
                }
            }
        }
    }
    );
}

/** Updates the Board with the newer info from remainingPieces */
export function syncBoardwithRemainingPieces(board: Array<Array<Piece>>, remainingPieces: { [key: string]: Array<Piece> }): void {
    remainingPieces["W"].forEach(piece => {
        for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
            for (let columnIndex = 0; columnIndex < board[rowIndex].length; columnIndex++) {
                if (board[rowIndex][columnIndex].uid === piece.uid) {
                    // Update positions
                    if (board[piece.position.y][piece.position.x].uid !== -1) {
                        // An opposite piece has been eaten
                        remainingPieces["B"] = remainingPieces["B"].filter(oppositePiece => {
                            return oppositePiece.uid !== board[piece.position.y][piece.position.x].uid;
                        });
                    }

                    board[piece.position.y][piece.position.x].fromData(piece);

                }
            }
        }
    }

    );
    remainingPieces["B"].forEach(piece => {
        for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
            for (let columnIndex = 0; columnIndex < board[rowIndex].length; columnIndex++) {
                if (board[rowIndex][columnIndex].uid === piece.uid) {
                    // Update positions
                    if (board[piece.position.y][piece.position.x].uid !== -1) {
                        // An opposite piece has been eaten
                        remainingPieces["W"] = remainingPieces["W"].filter(oppositePiece => {
                            return oppositePiece.uid !== board[piece.position.y][piece.position.x].uid;
                        });
                    }

                    board[piece.position.y][piece.position.x].fromData(piece);
                }
            }
        }
    });
}