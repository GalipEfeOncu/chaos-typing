import React from 'react';
import './BSoDScreen.css';

export default function BSoDScreen({ visible }) {
    if (!visible) return null;
    return (
        <div className="bsod-screen">
            <h1 className="bsod-face">:(</h1>
            <p className="bsod-main">
                Kişisel bilgisayarınız bir sorunla karşılaştı ve yeniden başlatılması gerekiyor.
            </p>
            <p className="bsod-code">Durdurma Kodu: CRITICAL_PROCESS_DIED</p>
        </div>
    );
}
