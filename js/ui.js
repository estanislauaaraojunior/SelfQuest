import { store } from './state.js';
import { calculateLevel } from './utils.js';
import { achievements } from './achievements.js';

export function renderAchievements(profile) {
    const grid = document.getElementById('achievementsGrid');
    if (!grid) return;

    grid.innerHTML = achievements.map(a => {
        const done = profile?.achievements?.includes(a.id);
        return `
            <div class="ach-item ${done ? 'completed' : ''}">
                <div style="font-size:30px">${a.icon}</div>
                <div style="font-weight:bold">${a.title}</div>
                <div class="small-muted">${a.desc}</div>
            </div>
        `;
    }).join("");
}

export function initUI() {
    store.subscribe((state) => {
        if (state.user && state.profile) {
            renderProfile(state.profile);
            renderAchievements(state.profile);

        }
    });
}

// Renderiza o perfil do jogador
function renderProfile(profile) {
    const playerName = document.getElementById('playerName');
    const level = document.getElementById('level');
    const points = document.getElementById('pointsValue');
    const tokens = document.getElementById('tokens');
    const xpText = document.getElementById('xpText');
    const xpFill = document.getElementById('xpFill');
    const followers = document.getElementById('followers');
    const following = document.getElementById('following');

    const lvl = calculateLevel(profile.xp || 0);

    if (playerName) playerName.textContent = profile.playerName;
    if (level) level.textContent = lvl.nivel;
    if (points) points.textContent = profile.points || 0;
    if (tokens) tokens.textContent = profile.tokens || 0;
    if (xpText) xpText.textContent = `${lvl.xpAtual} / ${lvl.xpProximo} XP`;
    if (followers) followers.textContent = profile.followers || 0;
    if (following) following.textContent = profile.following || 0;

    if (xpFill) {
        const pct = (lvl.xpAtual / lvl.xpProximo) * 100;
        xpFill.style.width = `${pct}%`;
    }
}

// === RENDERIZAR RANKING ===
export function renderRanking(players) {
    const list = document.getElementById('rankingList');
    if (!list) return;

    if (!players || players.length === 0) {
        list.innerHTML = '<p class="small-muted">Ranking vazio.</p>';
        return;
    }

    list.innerHTML = players.map((p, i) => `
        <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid #ddd;">
            <div><b>#${i + 1}</b> ${p.playerName}</div>
            <div class="small-muted">${p.xp} XP</div>
        </div>
    `).join('');
}

// === RENDERIZAR HISTÓRICO ===
export function renderHistory(history) {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    if (!history || history.length === 0) {
        historyList.innerHTML = '<p class="small-muted">Sem atividades recentes.</p>';
        return;
    }

    const recent = history.slice(0, 5);

    historyList.innerHTML = recent.map(h => `
        <div class="history-item" style="padding:8px; background:#fafafa; margin-bottom:6px; border-radius:6px;">
            <div style="font-weight:bold">${h.detail}</div>
            <div class="small-muted">
                +${h.points} pts • +${h.xp} XP
            </div>
        </div>
    `).join('');
}

// === RECOMPENSAS ===
export function renderRewards(profile, tab) {
    const rewardsList = document.getElementById('rewardsList');
    if (!rewardsList) return;

    let items = [];
    const claimed = profile.claimedRewards || [];

    if (tab === 'daily') {
        items = [{
            id: 'rd1',
            title: 'Completar 3 diários',
            desc: `Progresso: (${profile.dailyUploadsToday || 0}/3)`,
            reward: '100 Pts + 50 XP',
            met: (profile.dailyUploadsToday || 0) >= 3,
            claimed: claimed.includes('rd1')
        }];
    }

    if (tab === 'weekly') {
        items = [{
            id: 'rw1',
            title: 'Desafio semanal',
            desc: 'Completar 1 semanal',
            reward: '300 Pts + 150 XP',
            met: profile.weeklyCompleted === true,
            claimed: claimed.includes('rw1')
        }];
    }

    if (tab === 'monthly') {
        items = [{
            id: 'rm1',
            title: 'Mestre Mensal',
            desc: 'Completar 4 semanais',
            reward: '1000 Pts + 500 XP',
            met: false,
            claimed: claimed.includes('rm1')
        }];
    }

    rewardsList.innerHTML = items.map(item => `
        <div class="notice" style="margin-bottom:10px;">
            <div style="display:flex; justify-content:space-between;">
                <div>
                    <div style="font-weight:bold">${item.title}</div>
                    <div class="small-muted">${item.desc}</div>
                </div>
                ${item.claimed
                    ? `<button class="btn mini success" disabled>Resgatado</button>`
                    : item.met
                        ? `<button class="btn mini primary btn-claim" data-id="${item.id}" data-reward="${item.reward}">Resgatar</button>`
                        : `<button class="btn mini ghost" disabled>Pendente</button>`}
            </div>
        </div>
    `).join('');
}

