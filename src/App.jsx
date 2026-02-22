import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';
import LevelUpScreen from './components/LevelUpScreen';
import HUD from './components/HUD';
import BSoDScreen from './components/BSoDScreen';
import DistractionLayer from './components/DistractionLayer';
import Scanlines from './components/Scanlines';
import { useAudio } from './hooks/useAudio';
import { words } from './data/words';
import { enemyEmojis } from './data/emojis';
import { powerupsConfigTemplate } from './data/powerups';
import './App.css';

/* ============================================
   CHAOS TYPING — React Rewrite
   ============================================ */

function shuffleMiddle(word) {
  if (word.length <= 3) return word;
  const first = word[0];
  const last = word[word.length - 1];
  const middle = word.slice(1, -1).split('');
  // Fisher-Yates shuffle
  for (let i = middle.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [middle[i], middle[j]] = [middle[j], middle[i]];
  }
  return first + middle.join('') + last;
}

function createEnemy(level, speedMultiplier, canvasWidth) {
  let word = words[Math.floor(Math.random() * words.length)];
  if (level > 3 && Math.random() > 0.6) word += 'SU';

  // Level 5+: scramble middle letters (NOT full reverse)
  let isScrambled = false;
  if (level > 5 && Math.random() > 0.8) {
    word = shuffleMiddle(word);
    isScrambled = true;
  }

  const baseSpeed = Math.random() * 0.5 + 0.6 + level * 0.08;
  // Scrambled enemies move 30% slower to give time to read
  const speedFactor = isScrambled ? 0.7 : 1.0;

  return {
    word,
    x: Math.random() * (canvasWidth - 120) + 60,
    y: -60,
    emoji: enemyEmojis[Math.floor(Math.random() * enemyEmojis.length)],
    baseSpeed,
    speed: baseSpeed * speedMultiplier * speedFactor,
    matchedIndex: 0,
    shake: 0,
    wobbleOffset: Math.random() * 100,
    isScrambled,
    vx: (Math.random() - 0.5) * 4, // horizontal velocity for Kaos bounce
  };
}

function createParticle(x, y) {
  return {
    x,
    y,
    vx: (Math.random() - 0.5) * 12,
    vy: (Math.random() - 0.5) * 12,
    life: 1.0,
    color: `hsl(${Math.random() * 360}, 100%, 60%)`,
    gravity: 0.3,
  };
}

export default function App() {
  const playSound = useAudio();

  // --- Game state stored in refs for performance (no re-renders during game loop) ---
  const gameStateRef = useRef('MENU'); // MENU | PLAYING | LEVELUP | GAMEOVER
  const enemiesRef = useRef([]);
  const particlesRef = useRef([]);
  const activeTargetRef = useRef(null);
  const shakeIntensityRef = useRef(0);

  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const levelRef = useRef(1);
  const nextLevelScoreRef = useRef(500);
  const spawnIntervalRef = useRef(2000);
  const spawnTimerRef = useRef(0);

  const speedMultiplierRef = useRef(1.0);
  const scoreMultiplierRef = useRef(1.0);
  const blurAmountRef = useRef(0);
  const isMirroredRef = useRef(false);
  const isTinyTextRef = useRef(false);
  const isNightModeRef = useRef(false);
  const isCensoredRef = useRef(false);
  const lazerChanceRef = useRef(0);
  const freezeTimeRef = useRef(0);
  const isTeleportRef = useRef(false);

  const lastTimeRef = useRef(0);
  const loopIdRef = useRef(null);

  const canvasRef = useRef(null);

  // Powerups with runtime stacks tracking
  const powerupsRef = useRef(
    powerupsConfigTemplate.map((p) => ({ ...p, currentStacks: 0 }))
  );

  // --- React state for UI screens (these trigger re-renders) ---
  const [screen, setScreen] = useState('MENU'); // syncs with gameStateRef
  const [hudData, setHudData] = useState({
    score: 0,
    lives: 3,
    level: 1,
    nextLevelScore: 500,
    activeBuffs: [],
  });
  const [bsodVisible, setBsodVisible] = useState(false);
  const [levelUpChoices, setLevelUpChoices] = useState([]);
  const [discoFast, setDiscoFast] = useState(false);
  const [canvasFilter, setCanvasFilter] = useState('none');
  const [canvasTransform, setCanvasTransform] = useState('none');

  // Troll event states
  const [winUpdateVisible, setWinUpdateVisible] = useState(false);
  const [winUpdateProgress, setWinUpdateProgress] = useState(0);
  const [captchaVisible, setCaptchaVisible] = useState(false);
  const [captchaState, setCaptchaState] = useState('idle'); // idle | checking | done
  const [screenTiltAngle, setScreenTiltAngle] = useState(0);
  const savedSpeedRef = useRef(1.0);

  const activeBuffsRef = useRef([]);

  // --- Build combined canvas filter string from current state ---
  const updateCanvasEffects = useCallback(() => {
    const filters = [];
    if (blurAmountRef.current > 0) filters.push(`blur(${blurAmountRef.current}px)`);
    if (isMirroredRef.current) filters.push('hue-rotate(180deg) saturate(1.5)');
    setCanvasFilter(filters.length > 0 ? filters.join(' ') : 'none');
  }, []);

  // --- Update HUD (bridge refs → state) ---
  const updateHUD = useCallback(() => {
    setHudData({
      score: scoreRef.current,
      lives: livesRef.current,
      level: levelRef.current,
      nextLevelScore: nextLevelScoreRef.current,
      activeBuffs: [...activeBuffsRef.current],
    });
  }, []);

  // --- Explosion helper ---
  const createExplosion = useCallback(
    (x, y) => {
      playSound('explosion');
      const newParticles = [];
      for (let i = 0; i < 25; i++) {
        newParticles.push(createParticle(x, y));
      }
      particlesRef.current = [...particlesRef.current, ...newParticles];
      shakeIntensityRef.current = 10;
    },
    [playSound]
  );

  // --- Laser kill helper ---
  const tryLaserKill = useCallback(() => {
    const chance = lazerChanceRef.current;
    const enemies = enemiesRef.current;
    if (chance > 0 && Math.random() < chance && enemies.length > 0) {
      const idx = Math.floor(Math.random() * enemies.length);
      const victim = enemies[idx];
      createExplosion(victim.x, victim.y);
      scoreRef.current += victim.word.length * 10 * scoreMultiplierRef.current;
      enemiesRef.current = enemies.filter((e) => e !== victim);
      if (victim === activeTargetRef.current) activeTargetRef.current = null;
      updateHUD();
    }
  }, [createExplosion, updateHUD]);

  // --- Game Over ---
  const gameOver = useCallback(() => {
    gameStateRef.current = 'GAMEOVER';
    playSound('damage');
    setScreen('GAMEOVER');
    updateHUD();
  }, [playSound, updateHUD]);

  // --- Show Level Up ---
  const showLevelUp = useCallback(() => {
    gameStateRef.current = 'LEVELUP';
    playSound('levelup');

    const available = powerupsRef.current.filter(
      (p) => p.currentStacks < p.maxStacks
    );
    if (available.length === 0) {
      gameStateRef.current = 'PLAYING';
      lastTimeRef.current = performance.now();
      return;
    }

    const choices = [];
    while (choices.length < 3 && choices.length < available.length) {
      const pick = available[Math.floor(Math.random() * available.length)];
      if (!choices.includes(pick)) choices.push(pick);
    }

    setLevelUpChoices(choices);
    setScreen('LEVELUP');
  }, [playSound]);

  // --- Select Powerup ---
  const selectPowerup = useCallback(
    (powerup) => {
      const canvas = canvasRef.current?.getCanvas?.();

      // Apply effect
      switch (powerup.id) {
        case 'short_circuit':
          enemiesRef.current.forEach((e) => createExplosion(e.x, e.y));
          enemiesRef.current = [];
          activeTargetRef.current = null;
          break;
        case 'extra_life':
          livesRef.current++;
          break;
        case 'matrix':
          speedMultiplierRef.current *= 0.7;
          break;
        case 'za_warudo':
          freezeTimeRef.current = 5000;
          break;
        case 'laser_eyes':
          lazerChanceRef.current += 0.05;
          break;
        case 'mirror_mode':
          // Kaos Modu: crazy wobble + hue shift, NO unreadable scaleX flip
          isMirroredRef.current = true;
          updateCanvasEffects();
          scoreMultiplierRef.current *= 3;
          speedMultiplierRef.current *= 0.75;
          break;
        case 'inflation':
          scoreMultiplierRef.current *= 2;
          speedMultiplierRef.current *= 1.2; // was 1.3, reduced
          break;
        case 'myopia':
          blurAmountRef.current += 1.5; // was 2, reduced
          updateCanvasEffects();
          scoreMultiplierRef.current *= 2; // was x3, reduced
          break;
        case 'night_mode':
          isNightModeRef.current = true;
          scoreMultiplierRef.current *= 3; // was x4, reduced (still generous)
          break;
        case 'censorship':
          isCensoredRef.current = true;
          scoreMultiplierRef.current *= 2; // was x3, reduced (now playable)
          break;
        case 'tiny_text':
          isTinyTextRef.current = true;
          scoreMultiplierRef.current *= 1.5; // was += 0.5, now multiplicative
          break;
        case 'disco':
          setDiscoFast(true);
          break;
        case 'bsod':
          setBsodVisible(true);
          // Freeze enemies during BSOD so player doesn't lose lives unfairly
          freezeTimeRef.current = Math.max(freezeTimeRef.current, 1500);
          setTimeout(() => setBsodVisible(false), 1500); // was 2500ms
          break;
        case 'teleport':
          isTeleportRef.current = true;
          scoreMultiplierRef.current *= 2;
          break;
        default:
          break;
      }

      powerup.currentStacks++;

      // Track active buff names
      if (
        powerup.type !== 'troll' &&
        powerup.id !== 'short_circuit' &&
        powerup.id !== 'extra_life' &&
        powerup.id !== 'za_warudo'
      ) {
        if (!activeBuffsRef.current.includes(powerup.name)) {
          activeBuffsRef.current.push(powerup.name);
        }
      }

      levelRef.current++;
      // +1 life every level up
      livesRef.current++;
      nextLevelScoreRef.current = Math.floor(
        scoreRef.current + 500 + levelRef.current * 250
      );
      spawnIntervalRef.current = Math.max(
        500,
        2000 - levelRef.current * 120
      );

      setScreen('PLAYING');
      gameStateRef.current = 'PLAYING';
      lastTimeRef.current = performance.now();
      updateHUD();
    },
    [createExplosion, updateHUD]
  );

  // --- Start Game ---
  const startGame = useCallback(() => {
    scoreRef.current = 0;
    livesRef.current = 3;
    levelRef.current = 1;
    nextLevelScoreRef.current = 500;
    enemiesRef.current = [];
    particlesRef.current = [];
    activeTargetRef.current = null;
    spawnIntervalRef.current = 2000;
    spawnTimerRef.current = 0;
    speedMultiplierRef.current = 1.0;
    scoreMultiplierRef.current = 1.0;
    blurAmountRef.current = 0;
    isMirroredRef.current = false;
    isTinyTextRef.current = false;
    isNightModeRef.current = false;
    isCensoredRef.current = false;
    lazerChanceRef.current = 0;
    isTeleportRef.current = false;
    freezeTimeRef.current = 0;
    shakeIntensityRef.current = 0;
    activeBuffsRef.current = [];

    powerupsRef.current = powerupsConfigTemplate.map((p) => ({
      ...p,
      currentStacks: 0,
    }));

    setCanvasFilter('none');
    setCanvasTransform('none');
    setDiscoFast(false);
    setBsodVisible(false);

    gameStateRef.current = 'PLAYING';
    setScreen('PLAYING');
    lastTimeRef.current = performance.now();
    updateHUD();
  }, [updateHUD]);

  // --- Main Game Loop ---
  useEffect(() => {
    let loopId;

    function gameLoop(timestamp) {
      if (gameStateRef.current !== 'PLAYING') {
        loopId = requestAnimationFrame(gameLoop);
        return;
      }

      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Freeze time (Za Warudo)
      if (freezeTimeRef.current > 0) {
        freezeTimeRef.current -= deltaTime;
      }

      // Spawn enemies
      if (freezeTimeRef.current <= 0) {
        spawnTimerRef.current += deltaTime;
        if (spawnTimerRef.current > spawnIntervalRef.current) {
          const canvas = canvasRef.current?.getCanvas?.();
          const cw = canvas ? canvas.width : 1080;
          enemiesRef.current.push(
            createEnemy(
              levelRef.current,
              speedMultiplierRef.current,
              cw
            )
          );
          spawnTimerRef.current = 0;
        }
      }

      // Update enemies
      const enemies = enemiesRef.current;
      let lost = false;

      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];

        // Update position
        if (freezeTimeRef.current <= 0) {
          e.y += e.speed;
          const canvas = canvasRef.current?.getCanvas?.();
          const cw = canvas ? canvas.width : 1080;

          if (isMirroredRef.current) {
            // Kaos Modu: velocity-based with wall bouncing
            e.x += e.vx;
            if (e.x < 50 || e.x > cw - 50) {
              e.vx = -e.vx; // Bounce off wall!
              e.x = Math.max(50, Math.min(cw - 50, e.x));
            }
          } else {
            // Normal: gentle sin wobble
            e.x += Math.sin((e.y + e.wobbleOffset) * 0.02) * 0.5;
          }

          if (e.shake > 0) e.shake--;
        }

        // Check if enemy reached bottom
        const canvas = canvasRef.current?.getCanvas?.();
        const ch = canvas ? canvas.height : 680;
        if (e.y > ch - 50) {
          livesRef.current--;
          createExplosion(e.x, e.y);
          enemies.splice(i, 1);
          if (e === activeTargetRef.current) activeTargetRef.current = null;
          playSound('damage');
          updateHUD();

          if (livesRef.current <= 0) {
            gameOver();
            return;
          }
        }
      }

      // Update particles
      const parts = particlesRef.current;
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.life -= 0.04;
        if (p.life <= 0) parts.splice(i, 1);
      }

      // Shake decay
      if (shakeIntensityRef.current > 0) {
        shakeIntensityRef.current *= 0.9;
        if (shakeIntensityRef.current < 0.5) shakeIntensityRef.current = 0;
      }

      loopId = requestAnimationFrame(gameLoop);
    }

    loopId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(loopId);
  }, [createExplosion, gameOver, playSound, updateHUD]);

  // --- Keyboard Input ---
  useEffect(() => {
    function handleKeyDown(e) {
      const gs = gameStateRef.current;

      if (gs !== 'PLAYING') {
        if ((gs === 'MENU' || gs === 'GAMEOVER') && e.key === 'Enter') {
          startGame();
        }
        return;
      }

      const key = e.key.toLocaleUpperCase('tr-TR');
      if (key.length > 1 && key !== 'I' && key !== 'İ') return;

      const checkMatch = (inputKey, targetChar) => {
        if (inputKey === targetChar) return true;
        if (
          (inputKey === 'I' || inputKey === 'İ') &&
          (targetChar === 'I' || targetChar === 'İ')
        )
          return true;
        return false;
      };

      const target = activeTargetRef.current;
      const enemies = enemiesRef.current;

      if (target) {
        const nextChar = target.word[target.matchedIndex];
        if (checkMatch(key, nextChar)) {
          target.matchedIndex++;
          target.shake = 5;
          playSound('hit');
          tryLaserKill();

          // Teleport: move to random X, tiny Y jitter
          if (isTeleportRef.current && activeTargetRef.current) {
            const canvas = canvasRef.current?.getCanvas?.();
            const cw = canvas ? canvas.width : 1080;
            activeTargetRef.current.x = Math.random() * (cw - 120) + 60;
            activeTargetRef.current.y += (Math.random() - 0.5) * 30;
          }

          if (
            activeTargetRef.current &&
            activeTargetRef.current.matchedIndex ===
            activeTargetRef.current.word.length
          ) {
            createExplosion(
              activeTargetRef.current.x,
              activeTargetRef.current.y
            );
            scoreRef.current +=
              activeTargetRef.current.word.length *
              10 *
              scoreMultiplierRef.current;
            enemiesRef.current = enemies.filter(
              (en) => en !== activeTargetRef.current
            );
            activeTargetRef.current = null;

            if (scoreRef.current >= nextLevelScoreRef.current) showLevelUp();
            updateHUD();
          }
        } else {
          playSound('shoot');
        }
      } else {
        const candidates = enemies.filter((en) =>
          checkMatch(key, en.word[0])
        );

        if (candidates.length > 0) {
          candidates.sort((a, b) => b.y - a.y);
          activeTargetRef.current = candidates[0];
          activeTargetRef.current.matchedIndex = 1;
          activeTargetRef.current.shake = 5;
          playSound('hit');
          tryLaserKill();

          // Teleport on first letter match too
          if (isTeleportRef.current && activeTargetRef.current) {
            const canvas = canvasRef.current?.getCanvas?.();
            const cw = canvas ? canvas.width : 1080;
            activeTargetRef.current.x = Math.random() * (cw - 120) + 60;
            activeTargetRef.current.y += (Math.random() - 0.5) * 30;
          }

          if (
            activeTargetRef.current &&
            activeTargetRef.current.matchedIndex ===
            activeTargetRef.current.word.length
          ) {
            createExplosion(
              activeTargetRef.current.x,
              activeTargetRef.current.y
            );
            scoreRef.current +=
              activeTargetRef.current.word.length *
              10 *
              scoreMultiplierRef.current;
            enemiesRef.current = enemies.filter(
              (en) => en !== activeTargetRef.current
            );
            activeTargetRef.current = null;

            if (scoreRef.current >= nextLevelScoreRef.current) showLevelUp();
            updateHUD();
          }
        } else {
          playSound('shoot');
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    startGame,
    playSound,
    createExplosion,
    tryLaserKill,
    showLevelUp,
    updateHUD,
  ]);

  // === TROLL HANDLERS ===
  const handleWindowsUpdate = useCallback(() => {
    if (winUpdateVisible) return;
    setWinUpdateVisible(true);
    savedSpeedRef.current = speedMultiplierRef.current;
    speedMultiplierRef.current *= 0.3;
    setWinUpdateProgress(0);
    // Animate progress
    let p = 0;
    const pInterval = setInterval(() => {
      p += Math.random() * 3;
      if (p > 100) p = 100;
      setWinUpdateProgress(Math.floor(p));
      if (p >= 100) clearInterval(pInterval);
    }, 250);
    setTimeout(() => {
      setWinUpdateVisible(false);
      speedMultiplierRef.current = savedSpeedRef.current;
      clearInterval(pInterval);
    }, 5000);
  }, [winUpdateVisible]);

  const handleCaptcha = useCallback(() => {
    if (captchaVisible) return;
    setCaptchaVisible(true);
    setCaptchaState('idle');
    gameStateRef.current = 'CAPTCHA';
  }, [captchaVisible]);

  const handleCaptchaClick = useCallback(() => {
    if (captchaState !== 'idle') return;
    setCaptchaState('checking');
    setTimeout(() => {
      setCaptchaState('done');
      setTimeout(() => {
        setCaptchaVisible(false);
        setCaptchaState('idle');
        gameStateRef.current = 'PLAYING';
        lastTimeRef.current = performance.now();
      }, 600);
    }, 1200);
  }, [captchaState]);

  const handleScreenTilt = useCallback((angle) => {
    setScreenTiltAngle(angle);
  }, []);

  return (
    <div
      className={`app-body ${discoFast ? 'disco-fast' : 'disco-bg'}`}
      style={{
        transform: screenTiltAngle ? `rotate(${screenTiltAngle}deg)` : 'none',
        transition: 'transform 0.8s ease',
      }}
    >
      <Scanlines />
      <BSoDScreen visible={bsodVisible} />

      {/* WINDOWS UPDATE OVERLAY */}
      {winUpdateVisible && (
        <div className="windows-update-screen">
          <div className="wu-spinner" />
          <div className="wu-title">Güncellemeler üzerinde çalışılıyor</div>
          <div className="wu-subtitle">Bilgisayarınızı kapatmayın. Bu biraz zaman alabilir.</div>
          <div className="wu-progress">{winUpdateProgress}%</div>
          <div className="wu-warning">Bilgisayarınız birkaç kez yeniden başlatılacak</div>
        </div>
      )}

      {/* CAPTCHA OVERLAY */}
      {captchaVisible && (
        <div className="captcha-overlay" onClick={handleCaptchaClick}>
          <div className="captcha-box">
            <div
              className={`captcha-checkbox ${captchaState === 'checking' ? 'checking' :
                captchaState === 'done' ? 'checked' : ''
                }`}
            >
              {captchaState === 'done' && '✓'}
            </div>
            <span className="captcha-label">Ben robot değilim</span>
            <div className="captcha-logo">
              <span className="captcha-logo-icon">🤖</span>
              <span className="captcha-logo-text">reCAPTCHA</span>
            </div>
          </div>
        </div>
      )}

      <div className="game-container">
        <HUD
          score={hudData.score}
          lives={hudData.lives}
          level={hudData.level}
          nextLevelScore={hudData.nextLevelScore}
          activeBuffs={hudData.activeBuffs}
        />

        <DistractionLayer
          level={screen === 'PLAYING' ? hudData.level : 0}
          canvasWidth={1080}
          canvasHeight={680}
          onWindowsUpdate={handleWindowsUpdate}
          onCaptcha={handleCaptcha}
          onScreenTilt={handleScreenTilt}
        />

        <div
          className="canvas-wrapper"
          style={{ filter: canvasFilter, transform: canvasTransform }}
        >
          <GameCanvas
            ref={canvasRef}
            enemies={enemiesRef}
            particles={particlesRef}
            activeTarget={activeTargetRef}
            isNightMode={isNightModeRef}
            isTinyText={isTinyTextRef}
            isCensored={isCensoredRef}
            shakeIntensity={shakeIntensityRef}
            freezeTime={freezeTimeRef}
          />
        </div>

        {screen === 'MENU' && <StartScreen onStart={startGame} />}
        {screen === 'GAMEOVER' && (
          <GameOverScreen score={hudData.score} onRestart={startGame} />
        )}
        {screen === 'LEVELUP' && (
          <LevelUpScreen choices={levelUpChoices} onSelect={selectPowerup} />
        )}
      </div>

      <div className="version-tag">CHAOS TYPING v1.0</div>
    </div>
  );
}
