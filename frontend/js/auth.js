import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const db = getFirestore(app);

const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const showSignup = document.getElementById('showSignup');
const showLogin = document.getElementById('showLogin');
const errorMsg = document.getElementById('error-msg');

// Role Selector UI Logic
const rolePassenger = document.getElementById('rolePassenger');
const roleDriver = document.getElementById('roleDriver');

rolePassenger.addEventListener('click', () => {
    document.querySelector('input[value="passenger"]').checked = true;
    rolePassenger.classList.add('selected');
    roleDriver.classList.remove('selected');
});

roleDriver.addEventListener('click', () => {
    document.querySelector('input[value="driver"]').checked = true;
    roleDriver.classList.add('selected');
    rolePassenger.classList.remove('selected');
});

// Toggle Forms
showSignup.addEventListener('click', (e) => {
    e.preventDefault(); loginForm.style.display = 'none'; signupForm.style.display = 'block'; errorMsg.textContent = '';
});
showLogin.addEventListener('click', (e) => {
    e.preventDefault(); signupForm.style.display = 'none'; loginForm.style.display = 'block'; errorMsg.textContent = '';
});

// LOGIN Logic
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    errorMsg.style.color = "#00c853"; errorMsg.textContent = "Logging in...";

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Check Role from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === 'driver') {
            window.location.href = "driver.html";
        } else {
            window.location.href = "passenger.html"; // Default for old users
        }
    } catch (error) {
        errorMsg.style.color = "#d32f2f"; errorMsg.textContent = "Invalid email or password.";
    }
});

// SIGNUP Logic
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const mobile = document.getElementById('signupMobile').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const role = document.querySelector('input[name="userRole"]:checked').value;

    errorMsg.style.color = "#00c853"; errorMsg.textContent = "Creating account...";

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: name });
        
        // Save User Data to Firestore
        await setDoc(doc(db, "users", user.uid), {
            name: name, email: email, mobile: mobile, role: role, createdAt: new Date()
        });

        alert("Account created successfully!");
        if (role === 'driver') window.location.href = "driver.html";
        else window.location.href = "passenger.html";
        
    } catch (error) {
        errorMsg.style.color = "#d32f2f"; errorMsg.textContent = error.message;
    }
});