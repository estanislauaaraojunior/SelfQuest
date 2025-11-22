import { auth } from './firebase-config.js';
import { UserService } from './db.js';
import { store } from './state.js';
import { showToast, calculateLevel } from './utils.js';
import { handleGoogleLogin, handleEmailPasswordLogin, handleRegister, handleLogout } from './auth.js';
// CORREÇÃO: Importar initUI para ativar o listener do perfil.
import { renderRewards, renderHistory, initUI } from './ui.js'; 

// === CONFIGURAÇÃO DE VALORES (Restaurada do código original) ===
const CONFIG = {
    pontos: {
        diario: 10,
        semanal: 50,
        fitnessPorKm: 2, 
        convite: 30,
        quiz: 15,
        anuncio: 10,
        validar: 20
    },
    experiencia: {
        diario: 25,
        semanal: 100,
        fitnessPorKm: 0.5, 
        convite: 50,
        quiz: 7,
        anuncio: 5,
        validar: 10
    }
};

// Variáveis Globais
let currentUploadType = null; 
let currentUploadId = null;
let fitnessInterval = null;
let fitnessSeconds = 0;

// ================= INICIALIZAÇÃO =================
document.addEventListener('DOMContentLoaded', () => {
    attachAuthEvents(); 
    // PASSO CRÍTICO: Ativa o escutador de estado global (store.subscribe)
    // que dispara o renderProfile sempre que o perfil é atualizado.
    initUI(); 
});

auth.onAuthStateChanged(async (user) => {
    store.setUser(user);
    const authContainer = document.getElementById('authContainer');
    const appContainer = document.getElementById('appContainer');

    if (user) {
        if(authContainer) authContainer.classList.add('hidden');
        if(appContainer) appContainer.classList.remove('hidden');
        
        try {
            let profile = await UserService.getUser(user.uid);
            if (!profile) {
                const initialData = {
                    playerName: user.displayName || user.email.split('@')[0],
                    xp: 0, points: 0, tokens: 5, followers: 0, following: 0,
                    activityHistory: [],
                    claimedRewards: [],
                    dailyUploadsToday: 0 
                };
                await UserService.createUser(user.uid, initialData);
                profile = initialData;
            }
            store.setProfile(profile);
            initGameUI(profile);
            attachGameEvents(); 
            
        } catch (e) {
            console.error("Erro load:", e);
            showToast('Erro ao carregar dados.', 'error');
        }
    } else {
        if(authContainer) authContainer.classList.remove('hidden');
        if(appContainer) appContainer.classList.add('hidden');
    }
});

// ================= UI INICIAL =================
function initGameUI(profile) {
    try {
        // O renderProfile é chamado automaticamente pelo initUI/store.subscribe
        renderDailyGrid();
        renderRanking();
        renderRewards(profile, 'daily');
        const history = (profile.activityHistory || []).slice().reverse();
        renderHistory(history);
    } catch (e) { console.error(e); }
}

function renderDailyGrid() {
    const grid = document.getElementById('dailyGrid');
    if(!grid) return;
    const challenges = [
        { id: 'd1', title: 'Selfie no Espelho', img: 'https://picsum.photos/150/100?random=1' },
        { id: 'd2', title: 'Selfie com Café', img: 'https://picsum.photos/150/100?random=2' },
        { id: 'd3', title: 'Selfie Paisagem', img: 'https://picsum.photos/150/100?random=3' }
    ];
    grid.innerHTML = challenges.map(c => `
        <div class="daily-card" id="card-${c.id}" data-id="${c.id}">
            <img src="${c.img}" class="daily-thumb">
            <div style="font-weight:700;margin-top:4px">${c.title}</div>
        </div>
    `).join('');
    document.querySelectorAll('.daily-card').forEach(card => {
        card.addEventListener('click', () => openChooser('daily', card.dataset.id));
    });
}

async function renderRanking() {
    const list = document.getElementById('rankingList');
    if(!list) return;
    try {
        const players = await UserService.getTopPlayers();
        list.innerHTML = players.map((p, i) => `
            <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #eee">
                <div><b>#${i+1}</b> ${p.playerName}</div>
                <div class="small-muted">${p.xp} XP</div>
            </div>
        `).join('');
    } catch (e) { list.innerHTML = 'Erro ranking.'; }
}

// ================= EVENTOS =================
function attachAuthEvents() {
    document.getElementById('btnShowRegister')?.addEventListener('click', () => {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.remove('hidden');
    });
    document.getElementById('btnShowLogin')?.addEventListener('click', () => {
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('registerForm').classList.add('hidden');
    });
    document.getElementById('loginForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        handleEmailPasswordLogin(document.getElementById('loginEmail').value, document.getElementById('loginPassword').value);
    });
    document.getElementById('registerForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        handleRegister(document.getElementById('regName').value, document.getElementById('regEmail').value, document.getElementById('regPass').value);
    });
    document.getElementById('btnGoogleLogin')?.addEventListener('click', handleGoogleLogin);
}

function attachGameEvents() {
    document.getElementById('btnLogout')?.addEventListener('click', handleLogout);
    
    // Uploads
    document.getElementById('btnUploadWeekly')?.addEventListener('click', () => openChooser('weekly', 'weekly'));
    document.getElementById('chooserClose')?.addEventListener('click', () => {
        document.getElementById('chooserModal').style.display = 'none';
    });
    document.getElementById('chooserConfirm')?.addEventListener('click', handleUploadConfirm);
    
    // Tarefas Rápidas
    document.getElementById('btnTaskQuiz')?.addEventListener('click', () => quickTask(CONFIG.pontos.quiz, CONFIG.experiencia.quiz, 'Questionário'));
    document.getElementById('btnTaskAd')?.addEventListener('click', () => quickTask(CONFIG.pontos.anuncio, CONFIG.experiencia.anuncio, 'Anúncio'));
    document.getElementById('btnTaskValidate')?.addEventListener('click', () => quickTask(CONFIG.pontos.validar, CONFIG.experiencia.validar, 'Validação'));
    
    // Fitness
    document.getElementById('fitnessStart')?.addEventListener('click', startFitness);
    document.getElementById('fitnessStop')?.addEventListener('click', stopFitness);
    
    // Limpar Histórico
    document.getElementById('clearHistory')?.addEventListener('click', async () => {
         const user = store.get().user;
         await UserService.updateUser(user.uid, { activityHistory: [] });
         updateLocalProfile({ activityHistory: [] });
         showToast('Histórico limpo.', 'info');
    });

    // Loja e Lateral
    document.getElementById('btnBuyFilter')?.addEventListener('click', () => buyItem(10, 'Filtro Exclusivo'));
    document.getElementById('btnBuyBoost')?.addEventListener('click', () => buyItem(50, 'Boost de XP'));
    document.getElementById('btnInvite')?.addEventListener('click', async () => {
        const user = store.get().user;
        await updatePointsAndXp(user.uid, CONFIG.pontos.convite, CONFIG.experiencia.convite, "Convite de Amigo");
        showToast('Convite enviado!', 'success');
    });

    document.getElementById('btnExchange')?.addEventListener('click', async () => {
        const input = document.getElementById('exchangeInput');
        if(!input) return;
        const amount = parseInt(input.value);
        if (!amount || amount <= 0) return showToast('Valor inválido', 'error');
        
        const user = store.get().user;
        const profile = store.get().profile;
        if (profile.points < amount) return showToast(`Pontos insuficientes.`, 'error');
        
        const tokensGained = Math.floor(amount * 0.8);
        const newPoints = profile.points - amount;
        const newTokens = (profile.tokens || 0) + tokensGained;

        await UserService.updateUser(user.uid, { points: newPoints, tokens: newTokens });
        await updatePointsAndXp(user.uid, 0, 0, `Troca: -${amount} Pts / +${tokensGained} T`);
        
        updateLocalProfile({ points: newPoints, tokens: newTokens });
        showToast(`Troca realizada!`, 'success');
        input.value = '';
    });

    // Abas de Recompensas
    const tabs = document.querySelectorAll('.rewards-tabs .tab');
    if(tabs) {
        tabs.forEach(tab => {
            const newTab = tab.cloneNode(true);
            tab.parentNode.replaceChild(newTab, tab);
            newTab.addEventListener('click', () => {
                document.querySelectorAll('.rewards-tabs .tab').forEach(t => t.classList.remove('active'));
                newTab.classList.add('active');
                const type = newTab.id.replace('tab', '').toLowerCase();
                const currentProfile = store.get().profile;
                if(currentProfile) renderRewards(currentProfile, type);
            });
        });
    }

    // Resgate de Recompensas
    const rewardsList = document.getElementById('rewardsList');
    if (rewardsList) {
        const newList = rewardsList.cloneNode(true);
        rewardsList.parentNode.replaceChild(newList, rewardsList);
        newList.addEventListener('click', async (e) => {
            if (e.target.classList.contains('btn-claim')) {
                const rewardId = e.target.dataset.id;
                const rewardText = e.target.dataset.reward;
                const user = store.get().user;
                const profile = store.get().profile;

                let pts = 0, xp = 0;
                if(rewardText.includes('100')) { pts=100; xp=50; }
                else if(rewardText.includes('300')) { pts=300; xp=150; }
                else { pts=1000; xp=500; }

                const newClaimed = [...(profile.claimedRewards || [])];
                if (!newClaimed.includes(rewardId)) {
                    newClaimed.push(rewardId);
                    await updatePointsAndXp(user.uid, pts, xp, `Recompensa: ${rewardId}`);
                    await UserService.updateUser(user.uid, { claimedRewards: newClaimed });
                    
                    updateLocalProfile({ claimedRewards: newClaimed });
                    showToast('Recompensa resgatada!', 'success');
                }
            }
        });
    }
}

// === FUNÇÃO CENTRAL DE ATUALIZAÇÃO ===
async function updatePointsAndXp(uid, pts, xp, desc) {
    try {
        const result = await UserService.awardPointsAndXp(uid, pts, xp, desc);
        
        const currentProfile = store.get().profile;
        const newHistory = [...(currentProfile.activityHistory || [])];
        if(result.newHistoryItem) newHistory.push(result.newHistoryItem);

        const updates = {
            points: result.newPoints,
            xp: result.newXp,
            activityHistory: newHistory
        };
        
        const oldLevel = calculateLevel(currentProfile.xp).nivel;
        const newLevel = calculateLevel(result.newXp).nivel;
        if(newLevel > oldLevel) {
            showToast(`🎉 PARABÉNS! Você subiu para o nível ${newLevel}!`, 'success');
        }

        updateLocalProfile(updates);
    } catch(e) {
        console.error("ERRO FIREBASE AO ATUALIZAR PONTUAÇÃO:", e); 
        showToast('Erro ao atualizar pontuação. Verifique o console.', 'error');
    }
}

function updateLocalProfile(updates) {
    const currentProfile = store.get().profile;
    const newProfile = { ...currentProfile, ...updates };
    store.setProfile(newProfile); // Isso aciona o renderProfile no ui.js via store.subscribe
    
    const activeTabEl = document.querySelector('.rewards-tabs .tab.active');
    const activeTab = activeTabEl ? activeTabEl.id.replace('tab', '').toLowerCase() : 'daily';
    renderRewards(newProfile, activeTab);
    
    const historyToRender = [...(newProfile.activityHistory || [])].reverse();
    renderHistory(historyToRender);
}

// ... o restante do código fitness e helper
function openChooser(type, id) {
    currentUploadType = type;
    currentUploadId = id;
    const modal = document.getElementById('chooserModal');
    if(modal) modal.style.display = 'flex';
}

async function handleUploadConfirm() {
    const fileInput = document.getElementById('imageUploadInput');
    const user = store.get().user;
    const confirmBtn = document.getElementById('chooserConfirm');
    
    if (!fileInput || !fileInput.files[0]) { showToast('Selecione uma imagem', 'error'); return; }
    if(confirmBtn) confirmBtn.innerHTML = 'Enviando...';
    
    try {
        await UserService.uploadSelfie(user.uid, fileInput.files[0], currentUploadId);
        
        const isWeekly = currentUploadType === 'weekly';
        const pts = isWeekly ? CONFIG.pontos.semanal : CONFIG.pontos.diario;
        const xp = isWeekly ? CONFIG.experiencia.semanal : CONFIG.experiencia.diario;
        const desc = isWeekly ? "Desafio Semanal" : `Desafio Diário`;
        
        await updatePointsAndXp(user.uid, pts, xp, desc);
        
        if (currentUploadType === 'daily') {
            const currentProfile = store.get().profile;
            const newCount = (currentProfile.dailyUploadsToday || 0) + 1;
            await UserService.updateUser(user.uid, { dailyUploadsToday: newCount });
            updateLocalProfile({ dailyUploadsToday: newCount });
        } else {
            await UserService.updateUser(user.uid, { weeklyCompleted: true });
            updateLocalProfile({ weeklyCompleted: true });
        }

        showToast('Enviado com sucesso!', 'success');
        document.getElementById('chooserModal').style.display = 'none';
    } catch (e) {
        showToast('Erro: ' + e.message, 'error');
    } finally {
        if(confirmBtn) confirmBtn.innerHTML = 'Enviar';
    }
}

async function quickTask(pts, xp, name) {
    const user = store.get().user;
    showToast(`Realizando ${name}...`);
    await new Promise(r => setTimeout(r, 1000));
    await updatePointsAndXp(user.uid, pts, xp, name);
    showToast(`${name} completo!`, 'success');
}

async function buyItem(cost, name) {
    const user = store.get().user;
    const profile = store.get().profile;
    if ((profile.tokens || 0) < cost) return showToast(`Saldo insuficiente.`, 'error');
    
    const newTokens = profile.tokens - cost;
    await UserService.updateUser(user.uid, { tokens: newTokens });
    await updatePointsAndXp(user.uid, 0, 0, `Compra: ${name} (-${cost}T)`);
    
    updateLocalProfile({ tokens: newTokens });
    showToast(`Comprou ${name}!`, 'success');
}

function startFitness() {
    const startBtn = document.getElementById('fitnessStart');
    const stopBtn = document.getElementById('fitnessStop');
    if(startBtn) startBtn.disabled = true;
    if(stopBtn) stopBtn.disabled = false;
    fitnessSeconds = 0;
    fitnessInterval = setInterval(() => {
        fitnessSeconds++;
        const min = Math.floor(fitnessSeconds / 60).toString().padStart(2,'0');
        const sec = (fitnessSeconds % 60).toString().padStart(2,'0');
        const timer = document.getElementById('fitnessTime');
        if(timer) timer.textContent = `00:${min}:${sec}`;
    }, 1000);
}

function stopFitness() {
    clearInterval(fitnessInterval);
    const startBtn = document.getElementById('fitnessStart');
    const stopBtn = document.getElementById('fitnessStop');
    if(startBtn) startBtn.disabled = false;
    if(stopBtn) stopBtn.disabled = true;
    
    const kmSimulado = fitnessSeconds / 600; 
    
    const pts = Math.floor(kmSimulado * CONFIG.pontos.fitnessPorKm * 100) + 10; 
    const xp = Math.floor(kmSimulado * CONFIG.experiencia.fitnessPorKm * 100) + 5;
    
    if (fitnessSeconds > 10) { 
        updatePointsAndXp(store.get().user.uid, pts, xp, `Treino Fitness (${fitnessSeconds}s)`);
        showToast(`Treino concluído! +${pts} Pts, +${xp} XP`, 'success');
    } else {
        showToast("Treino muito curto.", "info");
    }
}
