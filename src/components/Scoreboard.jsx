import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import './Scoreboard.css';

export default function Scoreboard({ onClose }) {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchScores = async () => {
            try {
                const scoresRef = collection(db, 'scores');
                const q = query(scoresRef, orderBy('score', 'desc'), limit(15));
                const querySnapshot = await getDocs(q);

                const fetchedScores = [];
                querySnapshot.forEach((doc) => {
                    fetchedScores.push({ id: doc.id, ...doc.data() });
                });

                setScores(fetchedScores);
            } catch (err) {
                console.error('Skorlar çekilemedi:', err);
                setError('Bağlantı koptu, skorlar yalan oldu...');
            } finally {
                setLoading(false);
            }
        };

        fetchScores();
    }, []);

    return (
        <div className="modal-screen scoreboard-screen" style={{ display: 'flex' }}>
            <div className="scoreboard-container">
                <h1 className="scoreboard-title glitch">🏆 LİDERLİK TABLOSU 🏆</h1>

                <div className="scoreboard-content">
                    {loading ? (
                        <div className="scoreboard-loading">Kayıtlar aranıyor...</div>
                    ) : error ? (
                        <div className="scoreboard-error">{error}</div>
                    ) : scores.length === 0 ? (
                        <div className="scoreboard-empty">Henüz kimse cesaret edemedi.</div>
                    ) : (
                        <ul className="scoreboard-list">
                            <li className="scoreboard-list-header">
                                <span className="sc-rank">#</span>
                                <span className="sc-name">İSİM</span>
                                <span className="sc-level">LVL</span>
                                <span className="sc-score">SKOR</span>
                            </li>
                            {scores.map((s, index) => (
                                <li
                                    key={s.id}
                                    className={`scoreboard-item ${index === 0 ? 'top-1' : index === 1 ? 'top-2' : index === 2 ? 'top-3' : ''}`}
                                >
                                    <span className="sc-rank">{index + 1}</span>
                                    <span className="sc-name">{s.name}</span>
                                    <span className="sc-level">{s.level}</span>
                                    <span className="sc-score">{s.score}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <button className="btn btn-close" onClick={onClose}>
                    MENÜYE DÖN
                </button>
            </div>
        </div>
    );
}
