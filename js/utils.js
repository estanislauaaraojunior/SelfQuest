export function showToast(message, type = 'info') {
    // Implementação simples de toast
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
    return { nivel, xpAtual: xp - xpAcumulado, xpProximo: xpProx, pct: ((xp - xpAcumulado)/xpProx)*100 };
}
