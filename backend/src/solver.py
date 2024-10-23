import copy

def next_best_move(player, board):
    """
    Returns the best move for the player based on the current board state.
    """
    playerPits = board[player]['pits']
    
    best_move = -1
    max_score = -float('inf')
    
    # Iterate over all pits to find the best move
    for pit_index in range(len(playerPits)):
        if playerPits[pit_index] != 0:
            # Simulate the move for this pit
            simulated_board, extra_turn = simulate_move(player, pit_index, board)
            
            # Evaluate the board after the move, including the possibility of an extra turn
            score = evaluate_board(simulated_board, player)
            
            # If the player gets an extra turn, simulate that as well and adjust the score
            if extra_turn:
                score += evaluate_extra_turn(player, simulated_board)
            
            # Keep track of the move that gives the best score
            if score > max_score:
                max_score = score
                best_move = pit_index
    
    return best_move if best_move != -1 else 0 


def simulate_move(player, pit_index, board):
    """
    Simulates a move by sowing seeds from the selected pit.
    Returns a new board state after the move and whether an extra turn is granted.
    """
    simulated_board = copy.deepcopy(board) 
    stones = simulated_board[player]['pits'][pit_index]
    simulated_board[player]['pits'][pit_index] = 0
    
    current_index = pit_index
    current_player = player
    extra_turn = False
    
    while stones > 0:
        current_index += 1
        
        # If we're out of pits on this side, switch to the opponent's side or store
        if current_index >= len(simulated_board[current_player]['pits']):
            if current_player == player:
                # Add to player's store
                simulated_board[current_player]['store'] += 1
                stones -= 1
                
                # Check if last stone lands in store to grant extra turn
                if stones == 0:
                    extra_turn = True
                    break
            current_player = 'player2' if current_player == 'player1' else 'player1'  # Switch sides
            current_index = -1  # Reset index to start on the other side
        
        else:
            # Sow the stone in the current pit
            if stones > 0:
                simulated_board[current_player]['pits'][current_index] += 1
                stones -= 1
    
    return simulated_board, extra_turn


def evaluate_extra_turn(player, board):
    """
    Simulates the next move when the player gets an extra turn, and returns the resulting score.
    """
    playerPits = board[player]['pits']
    
    max_score = -float('inf')
    
    # Evaluate all possible moves in this extra turn
    for pit_index in range(len(playerPits)):
        if playerPits[pit_index] != 0:
            # Simulate another move for the extra turn
            simulated_board, extra_turn = simulate_move(player, pit_index, board)
            score = evaluate_board(simulated_board, player)
            
            # If another extra turn is possible, recursively simulate further
            if extra_turn:
                score += evaluate_extra_turn(player, simulated_board)
            
            max_score = max(max_score, score)
    
    return max_score


def evaluate_board(board, player):
    """
    Evaluate the board by calculating the difference between the player's
    store and the opponent's store. The higher the score, the better the move.
    """
    opponent = 'player2' if player == 'player1' else 'player1'
    return board[player]['store'] - board[opponent]['store']
