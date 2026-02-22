import React, { useEffect, useRef, useState, useCallback } from 'react';
import { fakeNotifs } from '../data/notifications';
import {
    trollCharacterMessages,
    clippyMessages,
    tabTitles,
    cookieConsentText,
    jumpscareEmojis,
} from '../data/trollMessages';
import { playTrollSound } from '../hooks/useAudio';
import './DistractionLayer.css';

// Weighted random event selection
function pickEvent(events, level) {
    const available = events.filter((e) => level >= e.minLevel);
    if (available.length === 0) return null;
    const totalWeight = available.reduce((s, e) => s + e.weight, 0);
    let r = Math.random() * totalWeight;
    for (const e of available) {
        r -= e.weight;
        if (r <= 0) return e;
    }
    return available[available.length - 1];
}

const TROLL_EVENTS = [
    // Level 1+
    { id: 'screenTilt', minLevel: 1, weight: 3 },
    { id: 'notifSound', minLevel: 1, weight: 4 },
    // Level 2+
    { id: 'cookieConsent', minLevel: 2, weight: 2 },
    { id: 'trollCharacter', minLevel: 2, weight: 3 },
    { id: 'tabTitle', minLevel: 2, weight: 4 },
    // Level 3+
    { id: 'fakeCursors', minLevel: 3, weight: 2 },
    { id: 'clippy', minLevel: 3, weight: 2 },
    { id: 'jumpscare', minLevel: 3, weight: 1 },
    { id: 'errorPopup', minLevel: 3, weight: 3 },
    // Level 4+
    { id: 'whatsapp', minLevel: 4, weight: 2 },
    // Level 5+
    { id: 'captcha', minLevel: 5, weight: 1 },
    // Level 6+
    { id: 'windowsUpdate', minLevel: 6, weight: 1 },
    // Level 7+
    { id: 'screenFlash', minLevel: 7, weight: 1 },
];

let globalId = 0;

export default function DistractionLayer({
    level,
    canvasWidth,
    canvasHeight,
    onWindowsUpdate,
    onCaptcha,
    onScreenTilt,
}) {
    const [popups, setPopups] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [flashes, setFlashes] = useState([]);
    const [cookies, setCookies] = useState([]);
    const [clippies, setClippies] = useState([]);
    const [trollChars, setTrollChars] = useState([]);
    const [cursors, setCursors] = useState([]);
    const [jumpscares, setJumpscares] = useState([]);
    const originalTitle = useRef(document.title);

    // Cleanup tab title on unmount
    useEffect(() => {
        return () => { document.title = originalTitle.current; };
    }, []);

    useEffect(() => {
        if (level < 1) return;

        const interval = setInterval(() => {
            const event = pickEvent(TROLL_EVENTS, level);
            if (!event) return;

            const id = ++globalId;

            switch (event.id) {
                // === LEVEL 1+ ===
                case 'screenTilt': {
                    const angle = (Math.random() - 0.5) * 6; // -3 to +3 degrees
                    onScreenTilt?.(angle);
                    // Reset after 8-15 seconds
                    setTimeout(() => onScreenTilt?.(0), 8000 + Math.random() * 7000);
                    break;
                }
                case 'notifSound': {
                    const sounds = ['discord', 'whatsappSound'];
                    playTrollSound(sounds[Math.floor(Math.random() * sounds.length)]);
                    break;
                }

                // === LEVEL 2+ ===
                case 'cookieConsent': {
                    setCookies((prev) => [...prev, { id }]);
                    setTimeout(() => setCookies((prev) => prev.filter((c) => c.id !== id)), 5000);
                    break;
                }
                case 'trollCharacter': {
                    const msg = trollCharacterMessages[Math.floor(Math.random() * trollCharacterMessages.length)];
                    const fromLeft = Math.random() > 0.5;
                    setTrollChars((prev) => [...prev, { id, msg, fromLeft }]);
                    setTimeout(() => setTrollChars((prev) => prev.filter((t) => t.id !== id)), 5000);
                    break;
                }
                case 'tabTitle': {
                    const title = tabTitles[Math.floor(Math.random() * tabTitles.length)];
                    document.title = title;
                    setTimeout(() => { document.title = originalTitle.current; }, 8000);
                    break;
                }

                // === LEVEL 3+ ===
                case 'fakeCursors': {
                    const count = 2 + Math.floor(Math.random() * 4); // 2-5
                    const newCursors = [];
                    for (let i = 0; i < count; i++) {
                        newCursors.push({
                            id: ++globalId,
                            startX: Math.random() * 100,
                            startY: Math.random() * 100,
                            seed: Math.random() * 1000,
                        });
                    }
                    setCursors((prev) => [...prev, ...newCursors]);
                    const duration = 5000 + Math.random() * 5000; // 5-10s
                    const ids = newCursors.map((c) => c.id);
                    setTimeout(() => setCursors((prev) => prev.filter((c) => !ids.includes(c.id))), duration);
                    break;
                }
                case 'clippy': {
                    const msg = clippyMessages[Math.floor(Math.random() * clippyMessages.length)];
                    setClippies((prev) => [...prev, { id, msg }]);
                    setTimeout(() => setClippies((prev) => prev.filter((c) => c.id !== id)), 6000);
                    break;
                }
                case 'jumpscare': {
                    const emoji = jumpscareEmojis[Math.floor(Math.random() * jumpscareEmojis.length)];
                    playTrollSound('jumpscare');
                    setJumpscares((prev) => [...prev, { id, emoji }]);
                    setTimeout(() => setJumpscares((prev) => prev.filter((j) => j.id !== id)), 600);
                    break;
                }
                case 'errorPopup': {
                    const popup = {
                        id,
                        text: `ERROR: 0x${Math.floor(Math.random() * 9999)} System32`,
                        left: Math.random() * Math.max(100, canvasWidth - 150),
                        top: Math.random() * Math.max(100, canvasHeight - 100),
                    };
                    setPopups((prev) => [...prev, popup]);
                    setTimeout(() => setPopups((prev) => prev.filter((p) => p.id !== id)), 2000);
                    break;
                }

                // === LEVEL 4+ ===
                case 'windowsUpdate': {
                    onWindowsUpdate?.();
                    break;
                }
                case 'captcha': {
                    onCaptcha?.();
                    break;
                }

                // === LEVEL 5+ ===
                case 'whatsapp': {
                    const rawMsg = fakeNotifs[Math.floor(Math.random() * fakeNotifs.length)];
                    let sender = 'WhatsApp';
                    let msgBody = rawMsg;
                    if (rawMsg.includes(':')) {
                        const parts = rawMsg.split(':');
                        sender = parts[0].trim();
                        msgBody = parts.slice(1).join(':').trim();
                    }
                    const now = new Date();
                    const timeStr = `${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;
                    setNotifications((prev) => [...prev, { id, sender, msgBody, timeStr }]);
                    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 4000);
                    break;
                }

                // === LEVEL 7+ ===
                case 'screenFlash': {
                    setFlashes((prev) => [...prev, id]);
                    setTimeout(() => setFlashes((prev) => prev.filter((f) => f !== id)), 100);
                    break;
                }

                default:
                    break;
            }
        }, 7000);

        return () => clearInterval(interval);
    }, [level, canvasWidth, canvasHeight, onWindowsUpdate, onCaptcha, onScreenTilt]);

    return (
        <div className="distraction-layer">
            {/* Error Popups */}
            {popups.map((p) => (
                <div key={p.id} className="fake-popup" style={{ left: p.left, top: p.top }}>
                    {p.text}
                </div>
            ))}

            {/* WhatsApp Notifications */}
            {notifications.map((n) => (
                <div key={n.id} className="whatsapp-notification">
                    <div className="wa-icon">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                    </div>
                    <div className="wa-content">
                        <div className="wa-app-name">WHATSAPP</div>
                        <div className="wa-header">
                            <span>{n.sender}</span>
                            <span className="wa-time">{n.timeStr}</span>
                        </div>
                        <div className="wa-message">{n.msgBody}</div>
                    </div>
                </div>
            ))}

            {/* Cookie Consent */}
            {cookies.map((c) => (
                <div key={c.id} className="cookie-banner">
                    <div className="cookie-icon">🍪</div>
                    <div className="cookie-text">{cookieConsentText}</div>
                    <div className="cookie-buttons">
                        <button className="cookie-btn cookie-accept">HEPSINI KABUL ET</button>
                        <button className="cookie-btn cookie-manage">Ayarları Yönet (847 ortağı tek tek seç)</button>
                    </div>
                </div>
            ))}

            {/* Clippy */}
            {clippies.map((c) => (
                <div key={c.id} className="clippy-container">
                    <div className="clippy-char">📎</div>
                    <div className="clippy-bubble">
                        <div className="clippy-text">{c.msg}</div>
                    </div>
                </div>
            ))}

            {/* Troll Character */}
            {trollChars.map((t) => (
                <div key={t.id} className={`troll-character ${t.fromLeft ? 'from-left' : 'from-right'}`}>
                    <div className="troll-face">🤡</div>
                    <div className="troll-bubble">{t.msg}</div>
                </div>
            ))}

            {/* Fake Cursors */}
            {cursors.map((c) => (
                <div
                    key={c.id}
                    className="fake-cursor"
                    style={{
                        '--start-x': `${c.startX}%`,
                        '--start-y': `${c.startY}%`,
                        '--seed': c.seed,
                        animationDelay: `${c.seed % 1}s`,
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="black" strokeWidth="1">
                        <path d="M5 3l14 8-6 2-3 7z" />
                    </svg>
                </div>
            ))}

            {/* Jumpscares */}
            {jumpscares.map((j) => (
                <div key={j.id} className="jumpscare-overlay">
                    <span className="jumpscare-emoji">{j.emoji}</span>
                </div>
            ))}

            {/* Screen Flashes */}
            {flashes.map((fid) => (
                <div key={fid} className="screen-flash" />
            ))}
        </div>
    );
}
