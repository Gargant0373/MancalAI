from flask import Flask, request
from flask_socketio import SocketIO, emit
from solver import next_best_move

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app, cors_allowed_origins="*")

# Dictionary to store board states for each client
board_states = {}

@app.route('/')
def index():
    return "WebSocket Server is running!"

@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')

@socketio.on('disconnect')
def handle_disconnect():
    session_id = request.sid
    print(f'Client {session_id} disconnected')
    
    # Remove the board state for the disconnected client
    if session_id in board_states:
        del board_states[session_id]

@socketio.on('move')
def handle_move(data):
    print(f"Received move from client: {data}")
    emit('move', data, broadcast=True)

@socketio.on('board_state')
def handle_board_state(data):
    session_id = request.sid
    # Save the received board state
    board_states[session_id] = data
    print(f"Received board state from client {session_id}: {data}")

@socketio.on('player_turn')
def handle_server_move(data):
    session_id = request.sid
    print(f"Received server move from client {session_id}: {data}")
    
    # Retrieve the board state for the client
    board = board_states.get(session_id)['board']
    if board:
        player = data['player']
        pitIndex = next_best_move(player, board)
        # Emit a move event with a dummy pitIndex (as an example)
        emit('move', {'player': player, 'pitIndex': pitIndex}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8080, debug=True)
