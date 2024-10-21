from flask import Flask
from flask_socketio import SocketIO, emit
import click

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def index():
    return "WebSocket Server is running!"

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    # Testing send
    emit('move', {'type': 'move', 'player': 'player1', 'pitIndex': 2})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('move')
def handle_move(data):
    print(f"Received move from client: {data}")
    emit('move', data, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8080, debug=True)
