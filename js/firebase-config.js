const firebaseConfig = {
    apiKey: "AIzaSyCOfEuhQLDDhCGLFMAucanYrQdSe1eW4ps",
    authDomain: "selfquest-43ced.firebaseapp.com",
    projectId: "selfquest-43ced",
    storageBucket: "selfquest-43ced.firebasestorage.app",
    messagingSenderId: "563236438761",
    appId: "selfquest-43ced"
};

// Inicializa o Firebase (usando a compat API para manter a v9+ modular)
firebase.initializeApp(firebaseConfig);

// Exporta os serviços para serem usados em outros módulos
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();

// Se necessário para timestamps no Firestore
export const FieldValue = firebase.firestore.FieldValue;
