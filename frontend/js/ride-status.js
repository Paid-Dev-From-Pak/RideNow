import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, query, where, onSnapshot, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

let myMap = null;

onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = "index.html";
    else trackRide(user.uid);
});

async function getCoordinates(locationName) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&accept-language=en`);
        const data = await response.json();
        if (data && data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    } catch (error) {}
    return null;
}

function trackRide(userId) {
    const q = query(collection(db, "rides"), where("passengerId", "==", userId), where("status", "in", ["Pending", "Accepted", "Completed"]));

    onSnapshot(q, async (snapshot) => {
        if (!snapshot.empty) {
            snapshot.forEach(async (docSnap) => {
                const ride = docSnap.data();
                document.getElementById('routeText').textContent = `${ride.pickup} ➔ ${ride.drop}`;
                document.getElementById('fareText').textContent = `Fare: Rs. ${ride.fare}`;
                document.getElementById('statusBadge').textContent = ride.status;

                if(ride.status === "Accepted" || ride.status === "Completed") {
                    document.getElementById('driverInfo').style.display = 'flex';
                    document.getElementById('driverNameText').textContent = ride.driverName || "Rider";
                    document.getElementById('driverAvatar').textContent = (ride.driverName || "R")[0].toUpperCase();
                    
                    // Fetch Driver Rating
                    if(ride.driverId) {
                        const driverSnap = await getDoc(doc(db, "users", ride.driverId));
                        if (driverSnap.exists() && driverSnap.data().rating) {
                            document.getElementById('driverRatingText').textContent = `⭐ ${driverSnap.data().rating.toFixed(1)}`;
                        }
                    }
                }

                // Map Draw
                if (!myMap) {
                    const pickupCoords = await getCoordinates(ride.pickup);
                    const dropCoords = await getCoordinates(ride.drop);
                    if (!pickupCoords || !dropCoords) return;

                    myMap = L.map('map').setView(pickupCoords, 12);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(myMap);
                    L.marker(pickupCoords).addTo(myMap).bindPopup(`Pickup`);
                    L.marker(dropCoords).addTo(myMap).bindPopup(`Drop`);
                    
                    const polyline = L.polyline([pickupCoords, dropCoords], {color: '#1a73e8', weight: 5}).addTo(myMap);
                    myMap.fitBounds(polyline.getBounds(), {padding: [50, 50]});
                }
            });
        } else {
            document.getElementById('routeText').textContent = "No active ride found.";
            document.getElementById('statusBadge').textContent = "Idle";
        }
    });
}