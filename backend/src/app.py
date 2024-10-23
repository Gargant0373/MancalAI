from flask import Flask, request
from flask_socketio import SocketIO, emit
from solver import next_best_move

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app, cors_allowed_origins="*")

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

@socketio.on('move')
def handle_move(data):
    print(f"Received move from client: {data}")
    emit('move', data, broadcast=True)

@socketio.on('player_turn')
def handle_server_move(data):
    session_id = request.sid
    print(f"Received server move from client {session_id}: {data}")
    
    board = data.get('board')
    player2 = board.get('player2')
    if player2 and player2.get('pits'):
        player2.get('pits').reverse()
        
    if board:
        player = data.get('player')
        pitIndex = next_best_move(player, board)
        print(f"Server move: {pitIndex} with {board.get(player).get('pits')[pitIndex]} stones")
        emit('move', {'player': player, 'pitIndex': pitIndex}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8080, debug=True)
