import { store } from './state.js';

const elements = {
    authContainer: document.getElementById('authContainer'),
    appContainer: document.getElementById('appContainer'),
    playerName: document.getElementById('uiPlayerName'),
    level: document.getElementById('uiLevel'),
    points: document.getElementById('uiPoints'),
    xpFill: document.getElementById('uiXpFill'),
    rankingList: document.getElementById('rankingList')
};

export function initUI() {
    // Se inscreve no StateManager
    store.subscribe((state) => {
        renderAuth(state.user);
        if (state.user && state.profile) {
            renderProfile(state.profile);
        }
    });
}

function renderAuth(user) {
    if (user) {
        elements.authContainer.classList.add('hidden'); // Classe CSS display:none
        elements.appContainer.classList.remove('hidden');
    } else {
        elements.authContainer.classList.remove('hidden');
        elements.appContainer.classList.add('hidden');
    }
}

function renderProfile(profile) {
    elements.playerName.textContent = profile.playerName;
    elements.level.textContent = profile.level;
    elements.points.textContent = profile.points;
    elements.xpFill.style.width = `${profile.xpPct}%`;
}

export function renderRanking(players) {
    elements.rankingList.innerHTML = players.map((p, i) => `
        <div class="ranking-item">
            <b>#${i+1}</b> ${p.playerName} <small>(${p.xp} XP)</small>
        </div>
    `).join('');
}
