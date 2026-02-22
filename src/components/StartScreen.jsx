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

export default function StartScreen({ onStart, onShowScoreboard }) {
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
        // Her over yapışta %20 şans ile buton kaçsın
        if (Math.random() > 0.8) {
            const x = (Math.random() - 0.5) * 300; // -150 to 150 px arası yatay
            // Scoreboard butonunun üstüne düşmemesi için Y eksenini sadece yukarıya (negatif) 
            // veya çok az aşağıya girmesine izin verecek şekide sınırlandırdık
            const y = (Math.random() * -150); // sadece yukarı (0 ile -150 px arası) kaçar
            setBtnPos({ x, y });
        }
    };

    return (
        <div className="modal-screen start-screen">
            <h1 className="start-title glitch">
                {title}
                <br />
                <span className="start-subtitle">Ultimate Turkish Typing Chaos V1.2</span>
            </h1>
            <p className="start-desc">
                {desc.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                        {line}
                        <br />
                    </React.Fragment>
                ))}
            </p>
            <div className="start-actions">
                <div
                    className="troll-btn-wrapper"
                    style={{ transform: `translate(${btnPos.x}px, ${btnPos.y}px)` }}
                    onMouseEnter={handleMouseEnter}
                >
                    <button className="btn" onClick={onStart}>
                        BAŞLAT (ENTER)
                    </button>
                </div>

                <div className="scoreboard-btn-wrapper">
                    <button className="btn btn-leaderboard" onClick={onShowScoreboard}>
                        🏆 SKOR TABLOSU
                    </button>
                </div>
            </div>
        </div>
    );
}
