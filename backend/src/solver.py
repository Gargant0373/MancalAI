def next_best_move(player, board):
    print(board)
    playerPits = board.get(player).get('pits')
    playerStore = board.get(player).get('store')
    
    # Temporary just for testing
    # Find first non-empty pit
    for i in range(len(playerPits)):
        if playerPits[i] != 0:
            return i
    return 0