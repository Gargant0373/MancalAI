import React from 'react';
import Board from './Board';
import './styles/utility.css';

const App: React.FC = () => {
    return (
        <div>
            <h1>Mancala Game</h1>
            <Board />
        </div>
    );
}

export default App;
