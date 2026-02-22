import React, { useState, useEffect } from 'react';
import './StartScreen.css';

const TITLES = [
    "Chaos Typing",
    "Coahs Tpying",
    "chAos TYpINg",
    "Chaos Typign",
    "Oyun Bozuk",
    "Typing Chaos"
];

const DESCS = [
    "Düşen kelimeleri yaz.\nMavi ekrana kanma.\nKaosa teslim olma.",
    "Düşen kelimeleri yaz.\nKlavyeni kırma.\nAğlamak serbest.",
    "Düşen kelimeleri yaz.\nZaten kaybedeceksin.\nBoşuna çabalama.",
    "Oyun çok kolay.\nBunu kaybeden de ne bileyim.\nKesin hata yoktur."
];

export default function StartScreen({ onStart }) {
    const [title, setTitle] = useState(TITLES[0]);
    const [desc, setDesc] = useState(DESCS[0]);
    const [btnPos, setBtnPos] = useState({ x: 0, y: 0 });
    const [teleportCount, setTeleportCount] = useState(0);

    useEffect(() => {
        // Her girişte rastgele bir troll başlık ve açıklama gelebilir
        if (Math.random() > 0.4) setTitle(TITLES[Math.floor(Math.random() * TITLES.length)]);
        if (Math.random() > 0.3) setDesc(DESCS[Math.floor(Math.random() * DESCS.length)]);
    }, []);

    const handleMouseEnter = () => {
        // İlk 1 veya 2 hover'da buton ışınlansın
        if (teleportCount < 2 && Math.random() > 0.2) {
            setTeleportCount(prev => prev + 1);
            const x = (Math.random() - 0.5) * 300; // -150 to 150 px
            const y = (Math.random() - 0.5) * 200 + 50; // Biraz daha farklı yerlere
            setBtnPos({ x, y });
        }
    };

    return (
        <div className="modal-screen start-screen">
            <h1 className="start-title glitch">
                {title}
                <br />
                <span className="start-subtitle">Ultimate Turkish Typing Chaos V1.0</span>
            </h1>
            <p className="start-desc">
                {desc.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                        {line}
                        <br />
                    </React.Fragment>
                ))}
            </p>
            <div
                className="troll-btn-wrapper"
                style={{ transform: `translate(${btnPos.x}px, ${btnPos.y}px)` }}
                onMouseEnter={handleMouseEnter}
            >
                <button className="btn" onClick={onStart}>
                    BAŞLAT (ENTER)
                </button>
            </div>
        </div>
    );
}
