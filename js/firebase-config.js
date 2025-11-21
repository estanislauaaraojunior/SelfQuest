const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "selfquest-43ced.firebaseapp.com",
    projectId: "selfquest-43ced",
    storageBucket: "selfquest-43ced.firebasestorage.app",
    messagingSenderId: "563236438761",
    appId: "selfquest-43ced"
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();
