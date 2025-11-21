// js/ui.js

import { store } from './state.js';

// Mapeamento de elementos do DOM
const elements = {
    authContainer: document.getElementById('authContainer'),
    appContainer: document.getElementById('appContainer'),
    // Elementos do Perfil
    playerName: document.getElementById('uiPlayerName'),
    level: document.getElementById('uiLevel'),
    points: document.getElementById('uiPoints'),
    xpFill: document.getElementById('uiXpFill'),
    // Ranking
    rankingList: document.getElementById('rankingList'),
    // Forms
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm')
};

/**
 * Inicializa a UI, inscrevendo-a no store para receber atualizações.
 */
export function initUI() {
    store.subscribe((state) => {
        // 1. Alterna a tela de Auth/App
        renderAuth(state.user); 
        
        // 2. Se logado, atualiza os dados do perfil
        if (state.profile) {
            renderProfile(state.profile);
        }
    });
}

/**
 * Alterna entre as telas de Login e Aplicação.
 */
function renderAuth(user) {
    if (user) {
        elements.authContainer.classList.add('hidden');
        elements.appContainer.classList.remove('hidden');
        // Oculta o form de registro e volta ao login
        elements.registerForm.classList.add('hidden');
        elements.loginForm.classList.remove('hidden');
    } else {
        elements.authContainer.classList.remove('hidden');
        elements.appContainer.classList.add('hidden');
    }
}

/**
 * Atualiza os dados de perfil (Nome, Nível, Pontos, XP Bar).
 */
function renderProfile(profile) {
    elements.playerName.textContent = profile.playerName;
    elements.level.textContent = profile.level;
    elements.points.textContent = profile.points;
    elements.xpFill.style.width = `${profile.xpPct}%`;
}

/**
 * Renderiza a lista de jogadores no ranking.
 */
export function renderRanking(players) {
    if (players.length === 0) {
        elements.rankingList.innerHTML = '<p>Nenhum jogador no ranking ainda.</p>';
        return;
    }
    elements.rankingList.innerHTML = players.map((p, i) => `
        <div class="ranking-item">
            <b>#${i + 1}</b> ${p.playerName} <small>(${p.xp} XP)</small>
        </div>
    `).join('');
}
