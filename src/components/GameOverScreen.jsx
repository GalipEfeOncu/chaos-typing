import React, { useState } from 'react';
import { collection, addDoc, updateDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import './GameOverScreen.css';

export default function GameOverScreen({ score, level, onRestart }) {
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const finalName = name.trim().substring(0, 15).toUpperCase();
        const finalScore = Math.floor(score);

        if (!finalName || finalName.length < 3) {
            setError('İsim en az 3 harfli olmalı trol kardeş!');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const scoresRef = collection(db, 'scores');
            const q = query(scoresRef, where("name", "==", finalName));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Name exists, check if new score is higher
                const existingDoc = querySnapshot.docs[0];
                const existingData = existingDoc.data();

                if (finalScore > existingData.score) {
                    await updateDoc(existingDoc.ref, {
                        score: finalScore,
                        level: level,
                        updatedAt: serverTimestamp()
                    });
                    setSubmitted(true);
                } else {
                    setError('Bu ismin zaten daha yüksek bir skoru var ezik!');
                }
            } else {
                // Create a new record
                await addDoc(scoresRef, {
                    name: finalName,
                    score: finalScore,
                    level: level,
                    createdAt: serverTimestamp(),
                });
                setSubmitted(true);
            }
        } catch (err) {
            console.error('Skor kaydedilemedi:', err);
            setError('Bağlantı koptu, skoru yiyemedik!');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-screen gameover-screen">
            <h1 className="gameover-title glitch">MEFTA OLDUN</h1>
            <p className="gameover-subtitle">Klavye senin neyine...</p>
            <p className="gameover-score">
                SKOR: <span>{Math.floor(score)}</span>
            </p>

            {!submitted ? (
                <form className="score-form" onSubmit={handleSubmit}>
                    <p className="score-form-title">ADINI TARİHE YAZDIR</p>
                    <input
                        type="text"
                        placeholder="Adın ne?"
                        className="score-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={15}
                        disabled={submitting}
                        autoFocus
                    />
                    {error && <div className="score-error">{error}</div>}
                    <div className="score-buttons">
                        <button
                            type="submit"
                            className="btn btn-save"
                            disabled={submitting}
                        >
                            {submitting ? 'KAYDEDİLİYOR...' : 'KAYDET'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-skip"
                            onClick={onRestart}
                            disabled={submitting}
                        >
                            GEÇ VE OYNA
                        </button>
                    </div>
                </form>
            ) : (
                <div className="score-success">
                    <p>SKORUN TABLOYA YAZILDI!</p>
                    <button className="btn" onClick={onRestart}>
                        TEKRAR OYNA
                    </button>
                </div>
            )}
        </div>
    );
}
