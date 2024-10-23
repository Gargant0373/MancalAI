import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Player, playerFromString } from '../Player';
import { BoardState } from '../Types';

interface UseCommunicationProps {
    board: BoardState;
    movePieces: (player: Player, pitIndex: number) => Promise<void>;
    listenSockets: boolean;
}

const useCommunication = ({ board, movePieces, listenSockets }: UseCommunicationProps) => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (!listenSockets) return;

        const newSocket: Socket = io('http://localhost:8080');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to server');

            boardState(newSocket);
        });

        newSocket.on('move', async (data: { type: string, player: string, pitIndex: number }) => {
            console.log('Move data:', data);
            await movePieces(playerFromString(data.player), data.pitIndex);
        });

        return () => {
            console.log('Disconnecting socket');
            newSocket.disconnect();
        };
    }, [listenSockets]);

    const boardState = (socketInstance: Socket) => {
        socketInstance.emit('board_state', {
            board
        });
    };

    const serverMove = (player: Player) => {
        console.log('Server move:', player);
        if (socket) {
            boardState(socket);
            socket.emit('player_turn', {
                player: player,
            });
        }
    };

    return { serverMove };
};

export default useCommunication;
