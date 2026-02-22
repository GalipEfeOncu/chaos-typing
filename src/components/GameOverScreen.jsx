import React from 'react';
import './GameOverScreen.css';

export default function GameOverScreen({ score, onRestart }) {
    return (
        <div className="modal-screen gameover-screen">
            <h1 className="gameover-title glitch">MEFTA OLDUN</h1>
            <p className="gameover-subtitle">Klavye senin neyine...</p>
            <p className="gameover-score">
                SKOR: <span>{Math.floor(score)}</span>
            </p>
            <button className="btn" onClick={onRestart}>
                BAŞTAN AL
            </button>
        </div>
    );
}
