import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCAn-9Nm7LUtu086mFPJe5JPFG-sm5s58w",
  authDomain: "ridenow-153eb.firebaseapp.com",
  projectId: "ridenow-153eb",
  storageBucket: "ridenow-153eb.firebasestorage.app",
  messagingSenderId: "989370787374",
  appId: "1:989370787374:web:c804083561da3cb59f61bf"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const showSignup = document.getElementById('showSignup');
const showLogin = document.getElementById('showLogin');
const errorMsg = document.getElementById('error-msg');

// Toggle Forms
showSignup.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
    errorMsg.textContent = '';
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
    errorMsg.textContent = '';
});

// LOGIN Logic
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    errorMsg.style.color = "#00c853";
    errorMsg.textContent = "Logging in...";

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            window.location.href = "passenger.html"; 
        })
        .catch((error) => {
            errorMsg.style.color = "#d32f2f";
            errorMsg.textContent = "Invalid email or password."; // Security ke liye specific error nahi dete
        });
});

// SIGNUP Logic
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    errorMsg.style.color = "#00c853";
    errorMsg.textContent = "Creating account...";

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // User ban gaya, ab uska Naam update karein
            return updateProfile(userCredential.user, { displayName: name });
        })
        .then(() => {
            alert("Account created successfully!");
            window.location.href = "passenger.html";
        })
        .catch((error) => {
            errorMsg.style.color = "#d32f2f";
            errorMsg.textContent = error.message;
        });
});