const firebaseConfig = {
    apiKey: "AIzaSyCOfEuhQLDDhCGLFMAucanYrQdSe1eW4ps",
    authDomain: "selfquest-43ced.firebaseapp.com",
    projectId: "selfquest-43ced",
    storageBucket: "selfquest-43ced.firebasestorage.app",
    messagingSenderId: "563236438761",
    appId: "1:563236438761:web:fe2115e33e6d8c137ba678"
};

// Inicializa o Firebase (usando a compat API para manter a v9+ modular)
firebase.initializeApp(firebaseConfig);

// Exporta os serviços para serem usados em outros módulos
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();

// Se necessário para timestamps no Firestore
export const FieldValue = firebase.firestore.FieldValue;
