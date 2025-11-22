// js/utils.js

export function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

export function calculateLevel(xp) {
    const BASE = 1000;
    const FATOR = 1.15;
    let nivel = 1;
    let xpAcumulado = 0;
    let xpProx = BASE;

    while (xp >= xpAcumulado + xpProx) {
        xpAcumulado += xpProx;
        nivel++;
        xpProx = Math.floor(BASE * Math.pow(FATOR, nivel - 1));
    }
    
    const xpNoNivel = xp - xpAcumulado; 
    const pct = xpProx > 0 ? (xpNoNivel / xpProx) * 100 : 0; 

    return { 
        nivel, 
        xpAtual: xpNoNivel, 
        xpProximo: xpProx, 
        pct: Math.min(100, pct)
    };
}
