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
    // Driver ki saari rides fetch karein
    const q = query(collection(db, "rides"), where("driverId", "==", driverId));

    onSnapshot(q, (snapshot) => {
        statsList.innerHTML = "";
        
        if (snapshot.empty) {
            statsList.innerHTML = "<p style='text-align: center; color: #777;'>No rides history found.</p>";
            totalRidesEl.textContent = "0";
            totalEarningsEl.textContent = "Rs. 0";
            return;
        }

        let totalFare = 0;
        let rideCount = 0;
        let ridesArray = [];

        snapshot.forEach(doc => {
            const ride = doc.data();
            ridesArray.push(ride);

            // SIRF COMPLETED RIDES ko Earnings aur Total count mein shamil karein
            if (ride.status === 'Completed') {
                totalFare += (ride.fare || 0);
                rideCount++;
            }
        });

        // Stats update karein
        totalRidesEl.textContent = rideCount;
        totalEarningsEl.textContent = `Rs. ${totalFare}`;

        // History list show karein (Nayi rides pehle)
        ridesArray.reverse().forEach((ride) => {
            const rideCard = document.createElement('div');
            rideCard.className = 'ride-item';
            
            // Status ke hisaab se border color
            if(ride.status === 'Completed') {
                rideCard.style.borderLeftColor = "var(--primary-color)"; // Green
            } else if(ride.status === 'Cancelled') {
                rideCard.style.borderLeftColor = "#d32f2f"; // Red
            } else {
                rideCard.style.borderLeftColor = "#ff9800"; // Orange
            }
            
            rideCard.innerHTML = `
                <div class="ride-details" style="width: 100%;">
                    <h4>Passenger: ${ride.passengerName}</h4>
                    <p><strong>📍 From:</strong> ${ride.pickup}</p>
                    ${ride.stop ? `<p><strong>⏸️ Stop:</strong> ${ride.stop}</p>` : ''}
                    <p><strong>🏁 To:</strong> ${ride.drop}</p>
                    <p><strong>⏰ Time:</strong> ${ride.time}</p>
                    
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                        <span style="font-weight:bold; color:${ride.status === 'Completed' ? 'var(--primary-color)' : '#d32f2f'}; text-transform:uppercase;">
                            ${ride.status}
                        </span>
                        <span style="font-weight:bold; color: #333;">
                            Fare: Rs. ${ride.fare || 0}
                        </span>
                    </div>
                </div>
            `;
            statsList.appendChild(rideCard);
        });
    });
}