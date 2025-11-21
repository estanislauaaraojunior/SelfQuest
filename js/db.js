// js/db.js

import { db, FieldValue } from './firebase-config.js'; // Importa a instância do Firestore

const COLLECTION = 'users';

export const UserService = {
    /**
     * Busca os dados de perfil de um usuário no Firestore.
     * @param {string} uid - O ID do usuário (UID do Firebase Auth).
     * @returns {Promise<Object|null>}
     */
    async getUser(uid) {
        const doc = await db.collection(COLLECTION).doc(uid).get();
        return doc.exists ? doc.data() : null;
    },

    /**
     * Cria o documento inicial de perfil de um novo usuário.
     * @param {string} uid - O ID do usuário.
     * @param {Object} data - Dados iniciais (playerName, xp, points, etc.).
     * @returns {Promise<void>}
     */
    async createUser(uid, data) {
        const fullData = {
            ...data,
            createdAt: FieldValue.serverTimestamp() // Boa prática para registro de data
        };
        return await db.collection(COLLECTION).doc(uid).set(fullData);
    },

    /**
     * Atualiza dados de um usuário existente.
     * @param {string} uid - O ID do usuário.
     * @param {Object} data - Dados a serem atualizados.
     * @returns {Promise<void>}
     */
    async updateUser(uid, data) {
        return await db.collection(COLLECTION).doc(uid).update(data);
    },

    /**
     * Busca os jogadores com mais XP para o ranking.
     * @param {number} limit - Número máximo de jogadores.
     * @returns {Promise<Array<Object>>}
     */
    async getTopPlayers(limit = 10) {
        const snap = await db.collection(COLLECTION)
                             .orderBy('xp', 'desc')
                             .limit(limit)
                             .get();
                             
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
};
