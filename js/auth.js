// js/auth.js

import { auth, FieldValue } from './firebase-config.js';
import { UserService } from './db.js';
import { showToast } from './utils.js';

// Lógica de Email e Senha

export async function handleRegister(name, email, password) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        const profileData = {
            playerName: name, 
            xp: 0,
            points: 0,
            createdAt: FieldValue.serverTimestamp() 
        };
        await UserService.createUser(user.uid, profileData);
        
        showToast('Cadastro realizado com sucesso! Bem-vindo(a).', 'success');
        
    } catch (error) {
        showToast(`Erro ao cadastrar: ${error.message}`, 'error');
        console.error("Register Error:", error);
    }
}

export async function handleEmailPasswordLogin(email, password) {
    try {
        await auth.signInWithEmailAndPassword(email, password);
        showToast('Login realizado com sucesso!', 'success');
    } catch (error) {
        showToast(`Erro no login: ${error.message}`, 'error');
        console.error("Login Error:", error);
    }
}


// Lógica de Login com Google (Já implementada)

export async function handleGoogleLogin() {
    const provider = new auth.GoogleAuthProvider();
    
    try {
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        const isNewUser = result.additionalUserInfo.isNewUser;

        if (isNewUser) {
            const profileData = {
                playerName: user.displayName || user.email.split('@')[0], 
                xp: 0,
                points: 0,
                createdAt: FieldValue.serverTimestamp()
            };
            
            await UserService.createUser(user.uid, profileData);
            showToast(`Bem-vindo(a), ${profileData.playerName}! Seu perfil foi criado.`, 'success');
        } else {
            showToast('Login com Google realizado com sucesso!', 'success');
        }
        
    } catch (error) {
        showToast(`Erro ao logar com Google: ${error.message}`, 'error');
        console.error("Google Login Error:", error);
    }
}

export async function handleLogout() {
    try {
        await auth.signOut();
        showToast('Você saiu da sua conta.');
    } catch (error) {
        showToast(`Erro ao sair: ${error.message}`, 'error');
    }
}
