import { useCallback } from 'react';

let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

export function useAudio() {
    const play = useCallback((type) => {
        playTrollSound(type);
    }, []);
    return play;
}

// Standalone play for use anywhere
export function playTrollSound(type) {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    switch (type) {
        case 'shoot': {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination);
            o.type = 'square';
            o.frequency.setValueAtTime(800, now);
            o.frequency.exponentialRampToValueAtTime(100, now + 0.1);
            g.gain.setValueAtTime(0.05, now);
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            o.start(now); o.stop(now + 0.1);
            break;
        }
        case 'hit': {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination);
            o.type = 'sawtooth';
            o.frequency.setValueAtTime(400, now);
            o.frequency.linearRampToValueAtTime(800, now + 0.05);
            g.gain.setValueAtTime(0.05, now);
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            o.start(now); o.stop(now + 0.05);
            break;
        }
        case 'explosion': {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination);
            o.type = 'sawtooth';
            o.frequency.setValueAtTime(150, now);
            o.frequency.exponentialRampToValueAtTime(0.01, now + 0.3);
            g.gain.setValueAtTime(0.2, now);
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            o.start(now); o.stop(now + 0.3);
            break;
        }
        case 'damage': {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination);
            o.type = 'triangle';
            o.frequency.setValueAtTime(100, now);
            o.frequency.linearRampToValueAtTime(50, now + 0.3);
            g.gain.setValueAtTime(0.3, now);
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            o.start(now); o.stop(now + 0.3);
            break;
        }
        case 'levelup': {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination);
            o.type = 'sine';
            o.frequency.setValueAtTime(400, now);
            o.frequency.linearRampToValueAtTime(1200, now + 0.4);
            g.gain.setValueAtTime(0.2, now);
            g.gain.linearRampToValueAtTime(0, now + 0.6);
            o.start(now); o.stop(now + 0.6);
            break;
        }

        // ========== TROLL SOUNDS ==========

        // Discord notification: two-note bell ding (C5 → E5)
        case 'discord': {
            // Note 1: C5 (523 Hz)
            const o1 = ctx.createOscillator();
            const g1 = ctx.createGain();
            o1.connect(g1); g1.connect(ctx.destination);
            o1.type = 'sine';
            o1.frequency.setValueAtTime(523, now);
            g1.gain.setValueAtTime(0, now);
            g1.gain.linearRampToValueAtTime(0.25, now + 0.005);
            g1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            o1.start(now); o1.stop(now + 0.3);
            // Harmonic overtone for bell character
            const o1h = ctx.createOscillator();
            const g1h = ctx.createGain();
            o1h.connect(g1h); g1h.connect(ctx.destination);
            o1h.type = 'sine';
            o1h.frequency.setValueAtTime(1046, now); // octave above
            g1h.gain.setValueAtTime(0, now);
            g1h.gain.linearRampToValueAtTime(0.08, now + 0.005);
            g1h.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            o1h.start(now); o1h.stop(now + 0.2);

            // Note 2: E5 (659 Hz) — delayed 150ms
            const o2 = ctx.createOscillator();
            const g2 = ctx.createGain();
            o2.connect(g2); g2.connect(ctx.destination);
            o2.type = 'sine';
            o2.frequency.setValueAtTime(659, now + 0.15);
            g2.gain.setValueAtTime(0, now);
            g2.gain.setValueAtTime(0, now + 0.15);
            g2.gain.linearRampToValueAtTime(0.25, now + 0.155);
            g2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            o2.start(now + 0.15); o2.stop(now + 0.5);
            // Harmonic
            const o2h = ctx.createOscillator();
            const g2h = ctx.createGain();
            o2h.connect(g2h); g2h.connect(ctx.destination);
            o2h.type = 'sine';
            o2h.frequency.setValueAtTime(1318, now + 0.15);
            g2h.gain.setValueAtTime(0, now);
            g2h.gain.setValueAtTime(0, now + 0.15);
            g2h.gain.linearRampToValueAtTime(0.06, now + 0.155);
            g2h.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
            o2h.start(now + 0.15); o2h.stop(now + 0.35);
            break;
        }

        // WhatsApp Web: quick two ascending tones
        case 'whatsappSound': {
            // Tone 1: Eb5 (622Hz)
            const o1 = ctx.createOscillator();
            const g1 = ctx.createGain();
            o1.connect(g1); g1.connect(ctx.destination);
            o1.type = 'sine';
            o1.frequency.setValueAtTime(622, now);
            g1.gain.setValueAtTime(0, now);
            g1.gain.linearRampToValueAtTime(0.2, now + 0.003);
            g1.gain.setValueAtTime(0.2, now + 0.06);
            g1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            o1.start(now); o1.stop(now + 0.15);

            // Tone 2: Ab5 (830Hz) — delayed 80ms, slightly louder
            const o2 = ctx.createOscillator();
            const g2 = ctx.createGain();
            o2.connect(g2); g2.connect(ctx.destination);
            o2.type = 'sine';
            o2.frequency.setValueAtTime(830, now + 0.08);
            g2.gain.setValueAtTime(0, now);
            g2.gain.setValueAtTime(0, now + 0.08);
            g2.gain.linearRampToValueAtTime(0.25, now + 0.083);
            g2.gain.setValueAtTime(0.25, now + 0.16);
            g2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            o2.start(now + 0.08); o2.stop(now + 0.4);
            break;
        }

        // Jumpscare: sudden loud noise burst + bass
        case 'jumpscare': {
            // White noise burst (buffer-based)
            const bufferSize = ctx.sampleRate * 0.15; // 150ms
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.8;
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const ng = ctx.createGain();
            noise.connect(ng); ng.connect(ctx.destination);
            ng.gain.setValueAtTime(0.6, now);
            ng.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            noise.start(now); noise.stop(now + 0.15);

            // Deep bass thud
            const bass = ctx.createOscillator();
            const bg = ctx.createGain();
            bass.connect(bg); bg.connect(ctx.destination);
            bass.type = 'sine';
            bass.frequency.setValueAtTime(60, now);
            bass.frequency.exponentialRampToValueAtTime(20, now + 0.3);
            bg.gain.setValueAtTime(0.7, now);
            bg.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            bass.start(now); bass.stop(now + 0.3);

            // High stinger
            const hi = ctx.createOscillator();
            const hg = ctx.createGain();
            hi.connect(hg); hg.connect(ctx.destination);
            hi.type = 'sawtooth';
            hi.frequency.setValueAtTime(3000, now);
            hi.frequency.exponentialRampToValueAtTime(500, now + 0.08);
            hg.gain.setValueAtTime(0.4, now);
            hg.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
            hi.start(now); hi.stop(now + 0.08);
            break;
        }

        default:
            break;
    }
}
