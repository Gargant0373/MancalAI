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
    const [socketInitialized, setSocketInitialized] = useState(false);

    const waitForSocketInitialization = () => {
        return new Promise<void>((resolve) => {
            const checkSocket = () => {
                if (socketInitialized) {
                    resolve();
                } else {
                    setTimeout(checkSocket, 50); 
                }
            };
            checkSocket();
        });
    };

    useEffect(() => {
        if (!listenSockets) return;

        const newSocket: Socket = io('http://localhost:8080');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            boardState(newSocket);
            setSocketInitialized(true);
        });

        newSocket.on('move', async (data: { type: string, player: string, pitIndex: number }) => {
            console.log('Move data:', data);
            await movePieces(playerFromString(data.player), data.pitIndex);
        });

        return () => {
            newSocket.disconnect();
            setSocketInitialized(false);
        };
    }, [listenSockets]);

    const boardState = (socketInstance: Socket) => {
        socketInstance.emit('board_state', {
            board
        });
    };

    const serverMove = async (player: Player, board: BoardState) => {
        await waitForSocketInitialization();

        socket?.emit('player_turn', {
            board: board,
            player: player,
        });
    };

    return { serverMove };
};

export default useCommunication;
