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

// 1. Inicializa a UI (inscreve os elementos no StateManager)
initUI();

// 2. Listener de Autenticação do Firebase
auth.onAuthStateChanged(async (user) => {
    store.setUser(user);

    if (user) {
        try {
            // Usuário logado: Carrega o perfil e o ranking
            const profile = await UserService.getUser(user.uid);
            if (profile) {
                store.setProfile(profile);
            } else {
                // Caso raro: Usuário logado, mas sem doc no Firestore (criar doc básico)
                // A lógica do Google já cuida disso, mas é um bom fallback
                console.warn('Perfil não encontrado no Firestore. Criando documento básico...');
                await UserService.createUser(user.uid, {
                    playerName: user.displayName || user.email.split('@')[0],
                    xp: 0,
                    points: 0
                });
                const newProfile = await UserService.getUser(user.uid);
                store.setProfile(newProfile);
            }
            
            // Carrega Ranking
            const topPlayers = await UserService.getTopPlayers();
            renderRanking(topPlayers);

        } catch (error) {
            showToast('Erro ao carregar dados do jogo: ' + error.message, 'error');
        }
    } else {
        // Usuário deslogado: Limpa o perfil local
        store.setProfile(null);
        renderRanking([]);
    }
});


// 3. Conexão de Eventos (Event Listeners)

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

// Login com Google (NOVO)
document.getElementById('btnGoogleLogin').addEventListener('click', handleGoogleLogin);

// Logout
document.getElementById('btnLogout').addEventListener('click', handleLogout);

// Lógica inicial de desafios e outras funcionalidades do jogo iriam aqui, importando e chamando módulos específicos.
