export enum Player {
    Player1 = 'player1',
    Player2 = 'player2',
}

export function playerFromString(str: string): Player {
    return str.toLowerCase() === 'player1' ? Player.Player1 : Player.Player2;
}