import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import styled from 'styled-components';
import { Player, playerFromString } from './Player';

const BoardWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 50px;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
`;

const Pit = styled.div<{ color?: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ color }) => color || '#eaeaea'};
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 10px;
  position: relative;
  cursor: pointer;
`;

const Store = styled.div<{ color?: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ color }) => color || '#eaeaea'};
  width: 120px;
  height: 200px;
  border-radius: 50%;
  font-size: 14px;
  text-align: center;
  position: relative;
  margin: 0 10px;
`;

const Piece = styled.div<{ moving: number }>`
  background-color: #444;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  position: absolute;
  width: ${({ moving }) => (moving ? '19px' : '10px')};
  height: ${({ moving }) => (moving ? '19px' : '10px')};
`;

const renderPieces = (count: number, moving: boolean) => {
    const pieces = [];
    const radius = 20;
    const layerLimit = 10;
    const layerGap = 12;

    for (let i = 0; i < count; i++) {
        const layer = Math.floor(i / layerLimit);
        const layerRadius = radius + layer * layerGap;
        const angle = (i % layerLimit) / layerLimit * 360;
        const x = layerRadius * Math.cos((angle * Math.PI) / 180);
        const y = layerRadius * Math.sin((angle * Math.PI) / 180);

        pieces.push(
            <Piece
                key={i}
                moving={i === 0 && moving ? 1 : 0}
                style={{
                    transform: `translate(${x}px, ${y}px)`,
                }}
            />
        );
    }

    return pieces;
};

const Board = (props: { setWinner: any, currentPlayer: Player, setCurrentPlayer: any, clickable: Player[], listenSockets: boolean }) => {
    const [board, setBoard] = useState({
        [Player.Player1]: {
            pits: [4, 4, 4, 4, 4, 4],
            store: 0,
        },
        [Player.Player2]: {
            pits: [4, 4, 4, 4, 4, 4],
            store: 0,
        },
    });

    const [activePit, setActivePit] = useState<number | null>(null);
    const [movingPieces, setMovingPieces] = useState<number[]>([]);

    useEffect(() => {
        const socket = io('http://localhost:8080');

        socket.on('connect', () => {
            console.log('Connected to server');
        });

        socket.on('move', (data: { type: string, player: string, pitIndex: number }) => {
            console.log('Move data:', data);
            if (data.type === 'move') {
                movePieces(playerFromString(data.player), data.pitIndex);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [props.listenSockets]);

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const getOppositePlayer = (player: Player) => (player === Player.Player1 ? Player.Player2 : Player.Player1);

    const movePieces = async (player: Player, pitIndex: number) => {
        if (activePit !== null) return;
        if (!props.clickable.includes(player)) return;
        if (board[player].pits[pitIndex] === 0) return;
        if (player !== props.currentPlayer) return;

        setMovingPieces([pitIndex + (player === Player.Player1 ? 0 : 6)]);

        if (board[player].pits[pitIndex] === 0) return;

        setActivePit(pitIndex);

        let pieces = board[player].pits[pitIndex];
        let newBoard = { ...board };
        let currentPitOwner = player;
        newBoard[player].pits[pitIndex] = 0;

        while (pieces > 0) {
            pitIndex = (pitIndex + 1);
            if (pitIndex === 6) {
                pitIndex = -1;
                if (currentPitOwner === player) {
                    newBoard[currentPitOwner].store = newBoard[currentPitOwner].store + 1;
                    currentPitOwner = getOppositePlayer(player);

                    setMovingPieces(prev => {
                        const updated = [...prev, currentPitOwner === Player.Player1 ? -2 : -1];
                        return updated;
                    });
                    pieces--;

                    await sleep(1000);
                    continue;
                } else {
                    currentPitOwner = player;
                    continue;
                }
            }

            newBoard[currentPitOwner].pits[pitIndex] = newBoard[currentPitOwner].pits[pitIndex] + 1;

            setMovingPieces(prev => {
                const updated = [...prev, currentPitOwner === Player.Player1 ? pitIndex : pitIndex + 6];
                return updated;
            });

            setBoard(newBoard);
            await sleep(500);

            pieces--;
        }

        // Check if last piece landed in an empty pit
        if (currentPitOwner === player && newBoard[currentPitOwner].pits[pitIndex] === 1) {
            const oppositePitIndex = 5 - pitIndex;
            const oppositePitCount = newBoard[getOppositePlayer(player)].pits[oppositePitIndex];
            if (oppositePitCount > 0) {
                newBoard[currentPitOwner].store = newBoard[currentPitOwner].store + oppositePitCount + 1;
                newBoard[currentPitOwner].pits[pitIndex] = 0;
                newBoard[getOppositePlayer(player)].pits[oppositePitIndex] = 0;
            }
        }

        // Check if the game is over
        if (newBoard[Player.Player1].pits.every(count => count === 0) || newBoard[Player.Player2].pits.every(count => count === 0)) {
            newBoard[Player.Player1].store = newBoard[Player.Player1].store + newBoard[Player.Player1].pits.reduce((a, b) => a + b, 0);
            newBoard[Player.Player2].store = newBoard[Player.Player2].store + newBoard[Player.Player2].pits.reduce((a, b) => a + b, 0);
            newBoard[Player.Player1].pits = [0, 0, 0, 0, 0, 0];
            newBoard[Player.Player2].pits = [0, 0, 0, 0, 0, 0];

            props.setWinner(newBoard[Player.Player1].store > newBoard[Player.Player2].store ? Player.Player1 : Player.Player2);
        }

        setBoard(newBoard);
        setActivePit(null);
        props.setCurrentPlayer(getOppositePlayer(player));
    };

    return (
        <>
            <BoardWrapper>
                <Row>
                    {/* Player 2 Store */}
                    <Store color="#e8675d">
                        {board[Player.Player2].store}
                        {renderPieces(board[Player.Player2].store, movingPieces.includes(-2))}
                    </Store>
                    <Column>
                        <Row>
                            {/* Reverse order for Player 2 */}
                            {board[Player.Player2].pits.slice().reverse().map((count, idx) => (
                                <Pit
                                    key={`player2-pit-${idx}`}
                                    color={'#f58c84'}
                                    onClick={() => movePieces(Player.Player2, 5 - idx)}
                                >
                                    {11 - idx}
                                    {count}
                                    {renderPieces(count, movingPieces.includes(11 - idx))}
                                </Pit>
                            ))}
                        </Row>
                        <Row>
                            {board[Player.Player1].pits.map((count, idx) => (
                                <Pit
                                    key={`player1-pit-${idx}`}
                                    color={'#848af5'}
                                    onClick={() => movePieces(Player.Player1, idx)}
                                >
                                    {idx}
                                    {count}
                                    {renderPieces(count, movingPieces.includes(idx))}
                                </Pit>
                            ))}
                        </Row>
                    </Column>
                    {/* Player 1 Store */}
                    <Store color="#575ede">
                        {board[Player.Player1].store}
                        {renderPieces(board[Player.Player1].store, movingPieces.includes(-1))}
                    </Store>
                </Row>
            </BoardWrapper>
        </>
    );
};

export default Board;
