// js/utils.js

/**
 * Exibe uma mensagem de notificação (Toast) na tela.
 * @param {string} message - A mensagem a ser exibida.
 * @param {'info'|'success'|'error'} type - Tipo de notificação.
 */
export function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

/**
 * Calcula o nível e o progresso de XP do jogador.
 * @param {number} xp - XP total atual do jogador.
 * @returns {{nivel: number, xpAtual: number, xpProximo: number, pct: number}}
 */
export function calculateLevel(xp) {
    const BASE = 1000; // XP necessário para o Nível 2
    const FATOR = 1.15; // Aumento exponencial
    let nivel = 1;
    let xpAcumulado = 0;
    let xpProx = BASE; // XP necessário para o próximo nível

    // Loop para encontrar o nível atual
    while (xp >= xpAcumulado + xpProx) {
        xpAcumulado += xpProx;
        nivel++;
        // Calcula o XP necessário para o próximo nível (N+1)
        xpProx = Math.floor(BASE * Math.pow(FATOR, nivel - 1));
    }
    
    // XP atual no nível (XP total - XP de níveis anteriores)
    const xpNoNivel = xp - xpAcumulado; 
    
    // Porcentagem de preenchimento da barra
    const pct = xpProx > 0 ? (xpNoNivel / xpProx) * 100 : 0; 

    return { 
        nivel, 
        xpAtual: xpNoNivel, 
        xpProximo: xpProx, 
        pct: Math.min(100, pct) // Garante que a porcentagem não passe de 100
    };
}
