// js/state.js

import { calculateLevel } from './utils.js';

const initialState = {
    user: null, 
    profile: null, 
    loading: false
};

class StateManager {
    constructor() {
        this.state = { ...initialState };
        this.listeners = [];
    }

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
        if (!profileData) {
            this.state.profile = null;
            this.notify();
            return;
        }
        
        const levelInfo = calculateLevel(profileData.xp || 0); 

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
