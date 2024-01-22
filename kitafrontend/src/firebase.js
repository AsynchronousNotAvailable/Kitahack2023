import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDD2UfRJp9PKxf4RieVokn0C-j0cDinlYc",
    authDomain: "kitahack2023-1f98f.firebaseapp.com",
    projectId: "kitahack2023-1f98f",
    storageBucket: "kitahack2023-1f98f.appspot.com",
    messagingSenderId: "889001463029",
    appId: "1:889001463029:web:c6fc554c516f95e187c9bc",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;
