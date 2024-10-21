import { useState } from "react";
import { Player } from "./Player";
import styled from "styled-components";
import Board from "./Board";

const GameInformation = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-top: 50px;
`;

const Row = styled.div`
    display: flex;
    align-items: center;
    padding: 10px;
`;

const Game = () => {
    const [winner, setWinner] = useState<Player | null>(null);
    const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.Player1);

    return <>
        <GameInformation>
            {winner ? (
                <Row>{winner} wins!</Row>
            ) : (
                <Row>Current player: {currentPlayer}</Row>
            )}
        </GameInformation>
        <Board setWinner={setWinner} currentPlayer={currentPlayer} setCurrentPlayer={setCurrentPlayer} clickable={[Player.Player1, Player.Player2]} listenSockets={true} />
    </>;
}

export default Game;

