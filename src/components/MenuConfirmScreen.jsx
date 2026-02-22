import React, { useState, useEffect } from 'react';
import './MenuConfirmScreen.css';

const TROLL_MESSAGES = [
    "KORKAK PİÇ!",
    "KLAVYEDEN Mİ KORKTUN?",
    "AĞLAYARAK KAÇIYORSUN!",
    "ZOR GELDİ TABİ...",
    "ANNEN Mİ ÇAĞIRDI?",
    "PUANIN ZATEN ÇÖPTÜ."
];

export default function MenuConfirmScreen({ onConfirm, onCancel }) {
    const [msg, setMsg] = useState("");

    useEffect(() => {
        setMsg(TROLL_MESSAGES[Math.floor(Math.random() * TROLL_MESSAGES.length)]);
    }, []);

    return (
        <div className="modal-screen confirm-screen">
            <h1 className="confirm-title glitch">{msg}</h1>
            <p className="confirm-subtitle">Pes edip menüye dönecek misin?</p>

            <div className="confirm-actions">
                <button className="btn btn-coward" onClick={onConfirm}>
                    KAÇ
                </button>
                <button className="btn btn-brave" onClick={onCancel}>
                    KAL (SAVAŞ)
                </button>
            </div>
        </div>
    );
}
