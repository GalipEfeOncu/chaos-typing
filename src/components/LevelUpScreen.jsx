import React from 'react';
import './LevelUpScreen.css';

export default React.memo(function LevelUpScreen({ choices, onSelect }) {
    return (
        <div className="modal-screen levelup-screen">
            <h1 className="levelup-title glitch">LEVEL ATLADIN!</h1>
            <p className="levelup-subtitle">Bir saçmalık seç ve devam et:</p>
            <div className="powerup-container">
                {choices.map((p) => {
                    let typeClass = 'type-buff';
                    if (p.type === 'risk') typeClass = 'type-risk';
                    if (p.type === 'troll') typeClass = 'type-troll';

                    let stackInfo = '';
                    if (p.maxStacks > 1 && p.maxStacks < 900) {
                        stackInfo = `[${p.currentStacks}/${p.maxStacks}]`;
                    }

                    return (
                        <div
                            key={p.id}
                            className="powerup-card"
                            onClick={() => onSelect(p)}
                        >
                            <div className={`powerup-type ${typeClass}`}>
                                {p.type.toUpperCase()}
                            </div>
                            <div className="powerup-title">{p.name}</div>
                            <div className="powerup-desc">{p.desc}</div>
                            {stackInfo && <div className="powerup-stack">{stackInfo}</div>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
