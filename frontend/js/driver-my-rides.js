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

const logoutBtn = document.getElementById('logoutBtn');
const myRidesList = document.getElementById('myRidesList');

onAuthStateChanged(auth, (user) => {
    if (user) { loadMyAcceptedRides(user.uid); } 
    else { window.location.href = "index.html"; }
});

logoutBtn.addEventListener('click', () => signOut(auth).then(() => window.location.href = "index.html"));

async function getCoordinates(locationName) {
    if (!locationName) return null;
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&accept-language=en`);
        const data = await response.json();
        if (data && data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    } catch (error) {}
    return null;
}

async function drawRouteOnMap(map, coordsArray) {
    try {
        let coordsString = coordsArray.map(c => `${c[1]},${c[0]}`).join(';');
        const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
            const routeCoordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
            const routeLine = L.polyline(routeCoordinates, { color: '#1a73e8', weight: 5, opacity: 0.8 }).addTo(map);
            map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
            const distanceKm = (data.routes[0].distance / 1000).toFixed(1);
            const durationMin = Math.round(data.routes[0].duration / 60);
            return { distanceKm, durationMin };
        }
    } catch (error) {}
    return null;
}

function loadMyAcceptedRides(driverId) {
    const q = query(collection(db, "rides"), where("driverId", "==", driverId), where("status", "==", "Accepted"));

    onSnapshot(q, (snapshot) => {
        myRidesList.innerHTML = "";
        if (snapshot.empty) {
            myRidesList.innerHTML = "<p style='text-align: center; color: #777;'>No active rides right now.</p>";
            return;
        }

        snapshot.forEach((docSnap) => {
            const ride = docSnap.data();
            const rideId = docSnap.id;
            
            const rideCard = document.createElement('div');
            rideCard.className = 'ride-item';
            rideCard.style.flexDirection = 'column'; 
            rideCard.style.borderLeftColor = "var(--primary-color)"; 
            
            const mapId = `map-${rideId}`;
            const infoId = `info-${rideId}`;
            let stopHtml = ride.stop ? `<p><strong>⏸️ Stop:</strong> ${ride.stop}</p>` : '';

            // Passenger Status Alert (I'm coming)
            let alertHtml = ride.passengerStatus ? `<div style="display:block; margin-bottom:10px; background:#ff9800; color:white; padding:10px; border-radius:8px; font-weight:bold; text-align:center;">🔔 ${ride.passengerStatus}</div>` : '';

            rideCard.innerHTML = `
                ${alertHtml}
                <div class="ride-details" style="width: 100%;">
                    <h4>Passenger: ${ride.passengerName}</h4>
                    <p><strong>📍 Pickup:</strong> ${ride.pickup}</p>
                    ${stopHtml}
                    <p><strong>🏁 Drop:</strong> ${ride.drop}</p>
                    <p><strong>⏰ Time:</strong> ${ride.time}</p>
                    <p style="color: #2e7d32; font-weight: bold; font-size: 16px;">💰 Fare: Rs. ${ride.fare}</p>
                    
                    <div style="background:#f0f4c3; border:1px solid #dce775; padding:15px; border-radius:8px; margin-top:15px; text-align:center;">
                        <h4>Passenger Contact</h4>
                        <a href="tel:${ride.passengerMobile}" style="display: inline-block; background: var(--primary-color); color: white; padding: 10px 20px; border-radius: 20px; text-decoration: none; font-weight: bold; margin-top: 10px;">📞 Call ${ride.passengerMobile}</a>
                        <button id="imHereBtn-${rideId}" style="display:block; width:100%; margin-top:10px; padding:10px; border-radius:8px; border:1px solid #4caf50; background:white; color:#4caf50; font-weight:bold; cursor:pointer;">📍 I'm Here</button>
                    </div>

                    <div id="${infoId}" style="margin-top: 10px; padding: 10px; background: #e3f2fd; border-radius: 5px; font-weight: bold; color: #1a73e8; display: none;">Calculating route...</div>
                    
                    <div style="display:flex; gap:10px; margin-top:15px;">
                        <button class="btn-complete" style="flex:1; background:var(--primary-color); color:white; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:600;">Complete</button>
                        <button class="btn-cancel-ride" style="flex:1; background:#ffebee; color:#d32f2f; border:1px solid #ffcdd2; padding:12px; border-radius:8px; cursor:pointer; font-weight:600;">Cancel</button>
                    </div>
                </div>
                <div id="${mapId}" style="height: 250px; width: 100%; border-radius: 8px; margin-top: 15px; border: 1px solid #ddd;"></div>
            `;
            
            myRidesList.appendChild(rideCard);

            // IM HERE BUTTON LOGIC
            document.getElementById(`imHereBtn-${rideId}`).addEventListener('click', async () => {
                try {
                    await updateDoc(doc(db, "rides", rideId), { driverStatus: "I'm here! Please come out." });
                    alert("Passenger ko bata diya gaya hai!");
                } catch(error) {}
            });

            const completeBtn = rideCard.querySelector('.btn-complete');
            completeBtn.addEventListener('click', async () => {
                if(!confirm("Passenger ko drop kar diya? Ride complete?")) return;
                completeBtn.textContent = "Completing..."; completeBtn.disabled = true;
                try { await updateDoc(doc(db, "rides", rideId), { status: "Completed" }); } catch (error) {}
            });

            const cancelRideBtn = rideCard.querySelector('.btn-cancel-ride');
            cancelRideBtn.addEventListener('click', async () => {
                if(!confirm("Are you sure you want to cancel?")) return;
                cancelRideBtn.textContent = "Cancelling..."; cancelRideBtn.disabled = true;
                try { await updateDoc(doc(db, "rides", rideId), { status: "Cancelled", cancelledBy: "Driver", cancelReason: "Driver cancelled from app" }); } catch (error) {}
            });

            setTimeout(async () => {
                const pickupCoords = await getCoordinates(ride.pickup); const dropCoords = await getCoordinates(ride.drop); const stopCoords = ride.stop ? await getCoordinates(ride.stop) : null;
                if (!pickupCoords || !dropCoords) return;
                const rideMap = L.map(mapId).setView(pickupCoords, 12); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(rideMap);
                L.marker(pickupCoords).addTo(rideMap).bindPopup(`Pickup: ${ride.pickup}`); if (stopCoords) L.marker(stopCoords).addTo(rideMap).bindPopup(`Stop: ${ride.stop}`); L.marker(dropCoords).addTo(rideMap).bindPopup(`Drop: ${ride.drop}`);
                let routePoints = [pickupCoords]; if (stopCoords) routePoints.push(stopCoords); routePoints.push(dropCoords);
                const routeInfo = await drawRouteOnMap(rideMap, routePoints);
                if (routeInfo) { const infoDiv = document.getElementById(infoId); infoDiv.style.display = 'block'; infoDiv.innerHTML = `🚗 Distance: ${routeInfo.distanceKm} km &nbsp; | &nbsp; ⏱️ Est. Time: ${routeInfo.durationMin} mins`; }
            }, 500);
        });
    });
}