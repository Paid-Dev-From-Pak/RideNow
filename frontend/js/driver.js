import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const driverName = document.getElementById('driverName');
const logoutBtn = document.getElementById('logoutBtn');
const ridesList = document.getElementById('ridesList');

onAuthStateChanged(auth, (user) => {
    if (user) {
        driverName.textContent = user.displayName || user.email.split('@')[0];
        loadAvailableRides(); 
    } else {
        window.location.href = "index.html";
    }
});

logoutBtn.addEventListener('click', () => signOut(auth).then(() => window.location.href = "index.html"));

function loadAvailableRides() {
    const q = query(collection(db, "rides"), where("status", "==", "Pending"));

    onSnapshot(q, (snapshot) => {
        ridesList.innerHTML = ""; 
        
        if (snapshot.empty) {
            ridesList.innerHTML = "<p style='text-align: center; color: #777; padding: 20px;'>No pending bike rides available right now. Waiting...</p>";
            return;
        }

        snapshot.forEach((docSnap) => {
            const ride = docSnap.data();
            const rideId = docSnap.id;

            const rideCard = document.createElement('div');
            rideCard.className = 'ride-item';
            
            rideCard.innerHTML = `
                <div class="ride-details">
                    <h4>Passenger: ${ride.passengerName}</h4>
                    <p style="font-size: 15px; margin-bottom: 8px; color: #2e7d32; font-weight: bold;">🏍️ Bike | Passenger Offer: Rs. ${ride.fare || 0}</p>
                    <p style="font-size: 13px; color: #666; margin-bottom: 8px;">Passenger Min Limit: Rs. ${ride.minFare || 0}</p>
                    <p><strong>📍 Pickup:</strong> ${ride.pickup}</p>
                    ${ride.stop ? `<p><strong>⏸️ Stop:</strong> ${ride.stop}</p>` : ''}
                    <p><strong>🏁 Drop:</strong> ${ride.drop}</p>
                    <p><strong>⏰ Time:</strong> ${ride.time}</p>
                    
                    <div style="margin-top: 10px; display: flex; gap: 10px; align-items: center;">
                        <label style="font-size: 14px; font-weight: bold;">Your Price (Rs.):</label>
                        <input type="number" id="counter-${rideId}" value="${ride.fare}" style="padding: 5px 10px; border: 1px solid #ddd; border-radius: 5px; width: 100px;">
                    </div>
                </div>
                <div style="display:flex; flex-direction:column; gap:10px; margin-top:10px;">
                    <button class="btn-accept" data-id="${rideId}">Send Offer</button>
                    <button class="btn-cancel" data-id="${rideId}" style="background:#ffebee; color:#d32f2f; border:1px solid #ffcdd2; padding:10px; border-radius:8px; cursor:pointer;">Ignore</button>
                </div>
            `;

            const acceptBtn = rideCard.querySelector('.btn-accept');
            acceptBtn.addEventListener('click', async () => {
                const counterFare = parseInt(document.getElementById(`counter-${rideId}`).value);
                if(!counterFare) return alert("Enter valid price.");
                if(counterFare < ride.minFare) return alert(`Minimum limit Rs. ${ride.minFare} se kam offer nahi kar sakte!`);

                acceptBtn.textContent = "Sending...";
                acceptBtn.disabled = true;
                try {
                    const rideRef = doc(db, "rides", rideId);
                    await updateDoc(rideRef, {
                        status: "Offer Pending", // Changed from Accepted to Offer Pending
                        driverId: auth.currentUser.uid,
                        driverName: auth.currentUser.displayName || "Rider",
                        fare: counterFare 
                    });
                } catch (error) {
                    alert("Error: " + error.message);
                    acceptBtn.textContent = "Send Offer";
                    acceptBtn.disabled = false;
                }
            });

            const cancelBtn = rideCard.querySelector('.btn-cancel');
            cancelBtn.addEventListener('click', async () => {
                if(!confirm("Ignore this ride?")) return;
                cancelBtn.textContent = "Ignoring...";
                try {
                    await updateDoc(doc(db, "rides", rideId), { status: "Cancelled", cancelledBy: "Driver", cancelReason: "Driver ignored" });
                } catch (error) { alert("Error: " + error.message); }
            });

            ridesList.appendChild(rideCard);
        });
    });
}