def next_best_move(player, board):
    playerPits = board[player].pits
    playerStore = board[player].store
    
    # Temporary just for testing
    # Find first non-empty pit
    for i in range(len(playerPits)):
        if playerPits[i] != 0:
            return {'player': player, 'pitIndex': i}
    return {'player': player, 'pitIndex': 0}