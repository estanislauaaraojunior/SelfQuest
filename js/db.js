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
            points: Number(data.points || 0),
            xp: Number(data.xp || 0),
            tokens: Number(data.tokens || 0),
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

    async uploadSelfie(uid, imageFile, challengeName) {
        const timestamp = new Date().getTime();
        const storagePath = `users/${uid}/${challengeName}_${timestamp}.jpg`;
        const storageRef = storage.ref(storagePath);
        const snapshot = await storageRef.put(imageFile);
        return await snapshot.ref.getDownloadURL();
    },

    // FUNÇÃO CENTRAL DE PONTUAÇÃO E HISTÓRICO
    async awardPointsAndXp(uid, pointsToAdd, xpToAdd, description = "Atividade") {
        const userRef = db.collection(COLLECTION).doc(uid);

        return db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) {
                throw new Error("Usuário não encontrado!");
            }

            const data = userDoc.data();
            const currentPoints = Number(data.points || 0);
            const currentXp = Number(data.xp || 0);

            const newPoints = currentPoints + pointsToAdd;
            const newXp = currentXp + xpToAdd;
            
            // Cria o objeto do histórico
            const newHistoryItem = {
                detail: description,
                points: pointsToAdd,
                xp: xpToAdd,
                timestamp: new Date().toLocaleString('pt-BR')
            };

            // Atualiza tudo de uma vez
            transaction.update(userRef, {
                points: newPoints,
                xp: newXp,
                activityHistory: FieldValue.arrayUnion(newHistoryItem)
            });

            // RETORNA OS DADOS ATUALIZADOS E O NOVO ITEM
            return { newPoints, newXp, newHistoryItem };
        });
    }
};
