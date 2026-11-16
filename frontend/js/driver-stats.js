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

const logoutBtn = document.getElementById('logoutBtn');
const totalRidesEl = document.getElementById('totalRides');
const totalEarningsEl = document.getElementById('totalEarnings');
const statsList = document.getElementById('statsList');

onAuthStateChanged(auth, (user) => {
    if (user) {
        loadStats(user.uid);
    } else {
        window.location.href = "index.html";
    }
});

logoutBtn.addEventListener('click', () => signOut(auth).then(() => window.location.href = "index.html"));

function loadStats(driverId) {
    const q = query(collection(db, "rides"), where("driverId", "==", driverId));

    onSnapshot(q, (snapshot) => {
        statsList.innerHTML = "";
        
        if (snapshot.empty) {
            statsList.innerHTML = "<p style='text-align: center; color: #777;'>No rides history found.</p>";
            return;
        }

        let totalFare = 0;
        let rideCount = 0;
        let ridesArray = [];

        snapshot.forEach(doc => {
            const ride = doc.data();
            ridesArray.push(ride);
            totalFare += (ride.fare || 0);
            rideCount++;
        });

        // Stats update karein
        totalRidesEl.textContent = rideCount;
        totalEarningsEl.textContent = `Rs. ${totalFare}`;

        // History list show karein
        ridesArray.forEach((ride) => {
            const rideCard = document.createElement('div');
            rideCard.className = 'ride-item';
            rideCard.style.borderLeftColor = "var(--primary-color)";
            
            rideCard.innerHTML = `
                <div class="ride-details" style="width: 100%;">
                    <h4>Passenger: ${ride.passengerName}</h4>
                    <p><strong>📍 From:</strong> ${ride.pickup}</p>
                    ${ride.stop ? `<p><strong>⏸️ Stop:</strong> ${ride.stop}</p>` : ''}
                    <p><strong>🏁 To:</strong> ${ride.drop}</p>
                    <p><strong>⏰ Time:</strong> ${ride.time}</p>
                    <p style="color: var(--primary-color); font-weight: bold; margin-top: 10px;">Fare Earned: Rs. ${ride.fare || 0}</p>
                </div>
            `;
            statsList.appendChild(rideCard);
        });
    });
}