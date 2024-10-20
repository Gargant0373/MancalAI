import React, { useState } from 'react';
import styled from 'styled-components';

enum Player {
    Player1 = 'player1',
    Player2 = 'player2',
}

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
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * 360;
        const x = 25 * Math.cos((angle * Math.PI) / 180);
        const y = 25 * Math.sin((angle * Math.PI) / 180);
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

const Board: React.FC = () => {
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

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const movePieces = async (player: Player, pitIndex: number) => {
        if (activePit !== null) return;

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
                    currentPitOwner = player === Player.Player1 ? Player.Player2 : Player.Player1;
                    newBoard[currentPitOwner].store = newBoard[currentPitOwner].store + 1;
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
            await sleep(1000);

            pieces--;
        }

        setBoard(newBoard);
        setActivePit(null);
    };

    return (
        <BoardWrapper>
            <Row>
                {/* Player 1 Store */}
                <Store color="#e8675d">
                    {board[Player.Player1].store}
                    {renderPieces(board[Player.Player1].store, movingPieces.includes(-1))}
                </Store>
                <Column>
                    <Row>
                        {/* Reverse order for Player 2 */}
                        {board[Player.Player2].pits.slice().reverse().map((count, idx) => (
                            <Pit key={`player2-pit-${idx}`} color={'#f58c84'}>
                                {11 - idx}
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
                                {renderPieces(count, movingPieces.includes(idx))}
                            </Pit>
                        ))}
                    </Row>
                </Column>
                {/* Player 2 Store */}
                <Store color="#575ede">
                    {board[Player.Player2].store}
                    {renderPieces(board[Player.Player2].store, movingPieces.includes(-1))}
                </Store>
            </Row>
        </BoardWrapper>
    );
};

export default Board;
