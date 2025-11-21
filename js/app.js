import { auth } from './firebase-config.js';
import { UserService } from './db.js';
import { store } from './state.js';
import { initUI, renderRanking } from './ui.js';
import { showToast } from './utils.js';

// Inicializa a UI
initUI();

// Listener de Autenticação
auth.onAuthStateChanged(async (user) => {
    store.setUser(user);

    if (user) {
        try {
            // Carrega dados do perfil
            const profile = await UserService.getUser(user.uid);
            if (profile) {
                store.setProfile(profile);
            } else {
                // Fallback se for novo usuário sem doc
                console.warn('Perfil não encontrado, criando...');
            }
            
            // Carrega Ranking
            const topPlayers = await UserService.getTopPlayers();
            renderRanking(topPlayers);

        } catch (error) {
            showToast('Erro ao carregar dados: ' + error.message, 'error');
        }
    }
});

// Lógica de Login (Event Listeners)
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;
    
    try {
        await auth.signInWithEmailAndPassword(email, pass);
    } catch (err) {
        showToast('Erro no login: ' + err.message);
    }
});

document.getElementById('btnLogout').addEventListener('click', () => {
    auth.signOut();
    // Limpa estado local se necessário
});
