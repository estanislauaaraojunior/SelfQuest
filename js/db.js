// js/db.js

import { db, storage, FieldValue } from './firebase-config.js'; 

const COLLECTION = 'users';

export const UserService = {
    async getUser(uid) {
        const doc = await db.collection(COLLECTION).doc(uid).get();
        return doc.exists ? doc.data() : null;
    },

    async createUser(uid, data) {
        const fullData = {
            ...data,
            createdAt: FieldValue.serverTimestamp()
        };
        return await db.collection(COLLECTION).doc(uid).set(fullData);
    },

    async updateUser(uid, data) {
        return await db.collection(COLLECTION).doc(uid).update(data);
    },

    async getTopPlayers(limit = 10) {
        const snap = await db.collection(COLLECTION)
                             .orderBy('xp', 'desc')
                             .limit(limit)
                             .get();
                             
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // NOVO: Lógica de Upload para o Firebase Storage
    async uploadSelfie(uid, imageFile, challengeName) {
        const timestamp = new Date().getTime();
        const storagePath = `users/${uid}/${challengeName}_${timestamp}.jpg`;
        
        const storageRef = storage.ref(storagePath);
        const snapshot = await storageRef.put(imageFile);
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        return downloadURL;
    },

    // NOVO: Transação Segura para Pontuação
    async awardPointsAndXp(uid, pointsToAdd, xpToAdd) {
        const userRef = db.collection(COLLECTION).doc(uid);

        return db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);

            if (!userDoc.exists) {
                throw new Error("Documento do usuário não existe!");
            }

            const currentPoints = userDoc.data().points || 0;
            const currentXp = userDoc.data().xp || 0;

            const newPoints = currentPoints + pointsToAdd;
            const newXp = currentXp + xpToAdd;
            
            transaction.update(userRef, {
                points: newPoints,
                xp: newXp
            });

            return { newPoints, newXp };
        });
    }
};
