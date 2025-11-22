// js/app.js

import { auth } from './firebase-config.js';
import { UserService } from './db.js';
import { store } from './state.js';
import { initUI, renderRanking } from './ui.js';
import { showToast } from './utils.js';
import { 
    handleGoogleLogin, 
    handleEmailPasswordLogin, 
    handleRegister,
    handleLogout
} from './auth.js'; 

// 1. Inicializa a UI
initUI();

// 2. Listener de Autenticação
auth.onAuthStateChanged(async (user) => {
    store.setUser(user);

    if (user) {
        try {
            const profile = await UserService.getUser(user.uid);
            if (profile) {
                store.setProfile(profile);
            } else {
                console.warn('Perfil não encontrado no Firestore. Criando documento básico...');
                await UserService.createUser(user.uid, {
                    playerName: user.displayName || user.email.split('@')[0],
                    xp: 0,
                    points: 0
                });
                const newProfile = await UserService.getUser(user.uid);
                store.setProfile(newProfile);
            }
            
            const topPlayers = await UserService.getTopPlayers();
            renderRanking(topPlayers);

        } catch (error) {
            showToast('Erro ao carregar dados do jogo: ' + error.message, 'error');
        }
    } else {
        store.setProfile(null);
        renderRanking([]);
    }
});


// 3. NOVO: Lógica de Upload e Recompensa
async function handleUpload(e) {
    e.preventDefault();
    const user = store.get().user;
    
    const fileInput = document.getElementById('imageUpload');
    const challengeSelect = document.getElementById('challengeSelect');
    const btnUpload = document.getElementById('btnUploadSelfie');
    
    if (!user || !fileInput.files[0] || !challengeSelect.value) {
        return showToast("Selecione um arquivo e um desafio.", "error");
    }
    
    const imageFile = fileInput.files[0];
    const challengeId = challengeSelect.value;
    
    // Mapeamento de Recompensas
    let points = 0;
    let xp = 0;
    
    switch (challengeId) {
        case 'selfie_sol':
            points = 20; xp = 150; break;
        case 'selfie_pet':
            points = 15; xp = 100; break;
        case 'selfie_natureza':
            points = 30; xp = 200; break;
        default:
            return showToast("Desafio inválido.", "error");
    }
    
    btnUpload.disabled = true; 
    showToast("Enviando foto...", "info");

    try {
        // 1. Upload da foto
        const downloadURL = await UserService.uploadSelfie(user.uid, imageFile, challengeId);
        
        // 2. Recompensa o jogador
        await UserService.awardPointsAndXp(user.uid, points, xp);

        // 3. Atualiza a UI
        const updatedProfile = await UserService.getUser(user.uid);
        store.setProfile(updatedProfile);
        
        document.getElementById('uploadForm').reset();
        showToast(`Desafio '${challengeId}' concluído! Ganhou ${xp} XP e ${points} Pontos.`, 'success');

    } catch (error) {
        showToast(`Falha no envio/pontuação: ${error.message}`, 'error');
        console.error("Upload Error:", error);
    } finally {
        btnUpload.disabled = false;
    }
}


// 4. Conexão de Eventos

// Toggle dos Formulários de Login/Registro
document.getElementById('btnShowRegister').addEventListener('click', () => {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
});
document.getElementById('btnShowLogin').addEventListener('click', () => {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
});


// Login com Email/Senha
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;
    await handleEmailPasswordLogin(email, pass);
});

// Registro
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPass').value;
    await handleRegister(name, email, pass);
});

// Login com Google
document.getElementById('btnGoogleLogin').addEventListener('click', handleGoogleLogin);

// Logout
document.getElementById('btnLogout').addEventListener('click', handleLogout);

// NOVO: Conexão do formulário de upload
document.getElementById('uploadForm').addEventListener('submit', handleUpload);
