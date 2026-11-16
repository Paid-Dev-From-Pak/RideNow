import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const userNameDisplay = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const historyList = document.getElementById('historyList');

onAuthStateChanged(auth, (user) => {
    if (user) {
        userNameDisplay.textContent = user.displayName || user.email.split('@')[0];
        loadHistory(user.uid);
    } else {
        window.location.href = "index.html";
    }
});

logoutBtn.addEventListener('click', () => signOut(auth).then(() => window.location.href = "index.html"));

function loadHistory(userId) {
    // User ki saari rides fetch karein (nayi pehle aayen)
    const q = query(
        collection(db, "rides"), 
        where("passengerId", "==", userId)
    );

    onSnapshot(q, (snapshot) => {
        historyList.innerHTML = "";
        
        if (snapshot.empty) {
            historyList.innerHTML = "<p style='text-align: center; color: #777;'>You haven't taken any rides yet.</p>";
            return;
        }

        // Data ko array mein le kar sort karein (taake nayi ride upar aaye)
        let ridesArray = [];
        snapshot.forEach(doc => ridesArray.push(doc.data()));
        ridesArray.sort((a, b) => b.createdAt - a.createdAt);

        ridesArray.forEach((ride) => {
            const rideCard = document.createElement('div');
            rideCard.className = 'ride-item';
            
            // Status ke hisaab se border color
            if(ride.status === 'Accepted' || ride.status === 'Completed') {
                rideCard.style.borderLeftColor = "var(--primary-color)"; 
            } else {
                rideCard.style.borderLeftColor = "#ff9800"; 
            }

            rideCard.innerHTML = `
                <div class="ride-details" style="width: 100%;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <span style="font-weight:bold; color:#333;">🏍️ Bike Ride</span>
                        <span style="font-weight:bold; color:${ride.status === 'Pending' ? '#ff9800' : 'var(--primary-color)'}; text-transform:uppercase; font-size:12px;">${ride.status}</span>
                    </div>
                    <p><strong>📍 From:</strong> ${ride.pickup}</p>
                    ${ride.stop ? `<p><strong>⏸️ Stop:</strong> ${ride.stop}</p>` : ''}
                    <p><strong>🏁 To:</strong> ${ride.drop}</p>
                    <p><strong>⏰ Time:</strong> ${ride.time}</p>
                    <p style="margin-top: 10px; font-size: 16px;"><strong>Total Fare: <span style="color:var(--primary-color);">Rs. ${ride.fare || 0}</span></strong></p>
                </div>
            `;
            historyList.appendChild(rideCard);
        });
    });
}