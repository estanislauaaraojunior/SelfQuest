// js/state.js

import { calculateLevel } from './utils.js';

const initialState = {
    user: null, // Dados do Auth (UID, email, etc.)
    profile: null, // Dados do Firestore (playerName, xp, points)
    loading: false
};

class StateManager {
    constructor() {
        this.state = { ...initialState };
        this.listeners = []; // Array de funções que querem ser notificadas
    }

    // Método para a UI se inscrever nas mudanças
    subscribe(listener) {
        this.listeners.push(listener);
    }

    // Método para notificar a UI de que algo mudou
    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }

    /**
     * Define o estado de autenticação (logado/deslogado).
     */
    setUser(user) {
        this.state.user = user;
        this.notify();
    }

    /**
     * Define o perfil do jogador e calcula seu nível.
     */
    setProfile(profileData) {
        if (!profileData) {
            this.state.profile = null;
            this.notify();
            return;
        }
        
        const levelInfo = calculateLevel(profileData.xp || 0); // Garante que 0 seja o valor padrão

        this.state.profile = {
            ...profileData,
            level: levelInfo.nivel,
            xpPct: levelInfo.pct
        };
        this.notify();
    }

    get() {
        return this.state;
    }
}

export const store = new StateManager();
