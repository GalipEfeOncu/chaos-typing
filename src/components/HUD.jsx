import React from 'react';
import './HUD.css';

export default React.memo(function HUD({ score, lives, level, nextLevelScore, activeBuffs, onMenuClick }) {
    return (
        <div className="hud">
            <div className="hud-row hud-score">
                SKOR: <span className="hud-value">{Math.floor(score)}</span>
            </div>
            <div className="hud-row hud-lives">
                CAN: <span className="hud-value">{lives}</span>
            </div>
            <div className="hud-row hud-level">
                LEVEL: <span className="hud-value">{level}</span>
            </div>
            <div className="hud-row hud-next">
                SONRAKİ: <span className="hud-value">{nextLevelScore}</span>
            </div>
            {activeBuffs.length > 0 && (
                <div className="hud-buffs">
                    MODLAR: {activeBuffs.join(', ')}
                </div>
            )}
            {onMenuClick && (
                <button className="hud-menu-btn" onClick={onMenuClick}>
                    MENÜYE DÖN
                </button>
            )}
        </div>
    );
});
