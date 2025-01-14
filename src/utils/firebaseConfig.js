import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyAEjSCWNzW3S-3LM9U2aMxoAWXf0ft1BIk",
    authDomain: "shamaim-lifestyle.firebaseapp.com",
    projectId: "shamaim-lifestyle",
    storageBucket: "shamaim-lifestyle.appspot.com",
    messagingSenderId: "253251908610",
    appId: "1:253251908610:web:86c78215bb5dd42c43e31b",
    measurementId: "G-VFR062HQ94"
};

const firebaseApp = initializeApp(firebaseConfig);
export default firebaseApp;
