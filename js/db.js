import { db } from './firebase-config.js';

const COLLECTION = 'users';

export const UserService = {
    async getUser(uid) {
        const doc = await db.collection(COLLECTION).doc(uid).get();
        return doc.exists ? doc.data() : null;
    },

    async createUser(uid, data) {
        return await db.collection(COLLECTION).doc(uid).set(data);
    },

    async updateUser(uid, data) {
        return await db.collection(COLLECTION).doc(uid).update(data);
    },

    async getTopPlayers(limit = 10) {
        const snap = await db.collection(COLLECTION).orderBy('xp', 'desc').limit(limit).get();
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
};
