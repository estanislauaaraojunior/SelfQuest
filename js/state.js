import { calculateLevel } from './utils.js';

// Estado inicial padrão
const initialState = {
    user: null, // Dados do Auth
    profile: {  // Dados do Firestore
        playerName: '',
        xp: 0,
        points: 0,
        level: 1
    },
    loading: false
};

class StateManager {
    constructor() {
        this.state = { ...initialState };
        this.listeners = [];
    }

    // Permite que a UI "escute" mudanças no estado
    subscribe(listener) {
        this.listeners.push(listener);
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }

    setUser(user) {
        this.state.user = user;
        this.notify();
    }

    setProfile(profileData) {
        if (!profileData) return;
        const levelInfo = calculateLevel(profileData.xp);
        
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
