import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import './GameCanvas.css';

const GameCanvas = forwardRef(function GameCanvas(
    { enemies, particles, activeTarget, isNightMode, isTinyText, isCensored, shakeIntensity, freezeTime },
    ref
) {
    const canvasRef = useRef(null);
    const fontLoaded = useRef(false);

    // Expose canvas element for sizing from parent
    useImperativeHandle(ref, () => ({
        getCanvas: () => canvasRef.current,
    }));

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        function resize() {
            canvas.width = window.innerWidth > 1100 ? 1100 : window.innerWidth - 20;
            canvas.height = window.innerHeight > 700 ? 700 : window.innerHeight - 20;
        }
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        function draw() {
            ctx.save();
            const shake = shakeIntensity.current || 0;
            if (shake > 0) {
                const dx = (Math.random() - 0.5) * shake;
                const dy = (Math.random() - 0.5) * shake;
                ctx.translate(dx, dy);
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Player
            ctx.fillStyle = '#222';
            ctx.fillRect(canvas.width / 2 - 40, canvas.height - 60, 80, 60);
            ctx.fillStyle = '#00ffcc';
            ctx.fillRect(canvas.width / 2 - 30, canvas.height - 50, 60, 30);
            const hasTarget = activeTarget.current !== null;
            ctx.fillStyle = hasTarget ? '#ff0055' : '#fff';
            ctx.beginPath();
            ctx.arc(canvas.width / 2 - 15, canvas.height - 40, 4, 0, Math.PI * 2);
            ctx.arc(canvas.width / 2 + 15, canvas.height - 40, 4, 0, Math.PI * 2);
            ctx.fill();

            // Enemies
            const currentEnemies = enemies.current;
            const currentTarget = activeTarget.current;

            for (let i = 0; i < currentEnemies.length; i++) {
                const enemy = currentEnemies[i];
                const isActive = enemy === currentTarget;
                drawEnemy(ctx, canvas, enemy, isActive, isTinyText.current, isCensored.current);
            }

            // Particles
            const currentParticles = particles.current;
            for (let i = 0; i < currentParticles.length; i++) {
                const p = currentParticles[i];
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, 5, 5);
                ctx.globalAlpha = 1.0;
            }

            // Night mode — dark vignette overlay (dim but visible)
            if (isNightMode.current) {
                // Dark radial gradient from center (lighter) to edges (darker)
                const cx = canvas.width / 2;
                const cy = canvas.height / 2;
                const maxR = Math.sqrt(cx * cx + cy * cy);
                const gradient = ctx.createRadialGradient(cx, cy, maxR * 0.15, cx, cy, maxR);
                gradient.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
                gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.7)');
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0.88)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Subtle glow around active target
                if (currentTarget) {
                    const tGrad = ctx.createRadialGradient(
                        currentTarget.x, currentTarget.y - 20, 0,
                        currentTarget.x, currentTarget.y - 20, 90
                    );
                    tGrad.addColorStop(0, 'rgba(0, 255, 204, 0.12)');
                    tGrad.addColorStop(1, 'rgba(0, 255, 204, 0)');
                    ctx.fillStyle = tGrad;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            }

            ctx.restore();
        }

        let animId;
        function loop() {
            draw();
            animId = requestAnimationFrame(loop);
        }
        animId = requestAnimationFrame(loop);

        return () => cancelAnimationFrame(animId);
    }, []); // Refs-based rendering, no deps needed

    return <canvas ref={canvasRef} className="game-canvas" />;
});

function drawEnemy(ctx, canvas, enemy, isActive, isTinyText, isCensored) {
    const drawX = enemy.x + (Math.random() - 0.5) * (enemy.shake || 0);
    const drawY = enemy.y + (Math.random() - 0.5) * (enemy.shake || 0);

    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(enemy.emoji, drawX, drawY);

    const wordY = drawY - 45;

    // Censorship logic
    let matchedStr = enemy.word.substring(0, enemy.matchedIndex);
    let remainingStr = enemy.word.substring(enemy.matchedIndex);

    if (isCensored && !isActive) {
        // Not targeted: show first 2 letters, rest censored
        if (enemy.word.length > 2) {
            matchedStr = '';
            const visible = enemy.word.substring(0, 2);
            const censored = '*'.repeat(enemy.word.length - 2);
            remainingStr = visible + censored;
        }
    } else if (isCensored && isActive) {
        // Actively typing: show matched (green) + next 2 chars visible + rest censored
        const next2 = remainingStr.substring(0, 2);
        const restLength = remainingStr.length - 2;
        remainingStr = next2 + (restLength > 0 ? '*'.repeat(restLength) : '');
    }

    ctx.font = isTinyText
        ? "bold 10px 'Press Start 2P'"
        : "bold 16px 'Press Start 2P'";

    const totalWidth = ctx.measureText(enemy.word).width;

    // Clamp drawX so word text doesn't overflow canvas edges
    const halfWord = totalWidth / 2 + 10;
    const clampedX = Math.max(halfWord, Math.min(canvas.width - halfWord, drawX));
    const startX = clampedX - totalWidth / 2;

    if (isActive) {
        ctx.fillStyle = 'rgba(255, 0, 85, 0.4)';
        ctx.fillRect(startX - 8, wordY - 22, totalWidth + 16, 34);

        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height);
        ctx.lineTo(clampedX, drawY + 10);
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 + Math.random() * 0.4})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    let cursorX = startX;

    ctx.fillStyle = '#00ffcc';
    ctx.shadowColor = '#00ffcc';
    ctx.shadowBlur = 15;
    ctx.textAlign = 'left';
    ctx.fillText(matchedStr, cursorX, wordY);
    ctx.shadowBlur = 0;

    cursorX += ctx.measureText(matchedStr).width;

    // Scrambled words shown in yellow as visual warning
    const normalColor = enemy.isScrambled ? '#ffdd44' : '#ffffff';
    ctx.fillStyle = isActive ? '#ff0055' : normalColor;
    ctx.fillText(remainingStr, cursorX, wordY);
}

export default GameCanvas;
