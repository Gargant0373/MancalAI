export interface BoardState {
    player1: PlayerState,
    player2: PlayerState,
}

export interface PlayerState {
    pits: number[];
    store: number;
}