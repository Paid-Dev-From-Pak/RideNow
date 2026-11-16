import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, updateDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const rideForm = document.getElementById('rideForm');
const requestBtn = document.getElementById('requestBtn');
const activeRide = document.getElementById('activeRide');
const statusText = document.getElementById('rideStatus');
const mapContainer = document.getElementById('map-container');
const fareEstimateBox = document.getElementById('fareEstimateBox');
const customFareInput = document.getElementById('customFare');
const fareBreakdown = document.getElementById('fareBreakdown');

let myMap = null; 
let minimumFareAllowed = 0;
let currentActiveRideId = null;
let currentDriverId = null;
let selectedRating = 0;
let myMobile = "";

// --- PROFILE PICTURE LOGIC ---
window.uploadProfilePic = async function(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ridenow_upload');
    try {
        const response = await fetch('https://api.cloudinary.com/v1_1/k2shlntb/image/upload', { method: 'POST', body: formData });
        const data = await response.json();
        if(data.secure_url) {
            await setDoc(doc(db, "users", auth.currentUser.uid), { profilePic: data.secure_url }, { merge: true });
            document.getElementById('userAvatar').src = data.secure_url;
            alert("Profile picture updated!");
        }
    } catch (error) { alert("Error uploading image."); }
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        userNameDisplay.textContent = user.displayName || user.email.split('@')[0];
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
            if(userSnap.data().profilePic) document.getElementById('userAvatar').src = userSnap.data().profilePic;
            myMobile = userSnap.data().mobile || "";
        }
        checkActiveRide(user.uid);
    } else window.location.href = "index.html";
});

logoutBtn.addEventListener('click', () => signOut(auth).then(() => window.location.href = "index.html"));

document.getElementById('addStopBtn').addEventListener('click', function() {
    document.getElementById('stopGroup').style.display = 'block';
    this.style.display = 'none'; 
});
window.removeStop = function() {
    document.getElementById('stop').value = '';
    document.getElementById('stopGroup').style.display = 'none';
    document.getElementById('addStopBtn').style.display = 'block';
    updateFareEstimate();
}

let pickerMap = null;
let currentInputTarget = null; 
window.openMapPicker = function(inputId) {
    currentInputTarget = inputId;
    document.getElementById('mapModal').style.display = 'flex';
    if (!pickerMap) {
        pickerMap = L.map('picker-map').setView([31.5204, 74.3587], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(pickerMap);
    }
    setTimeout(() => { pickerMap.invalidateSize(); }, 100);
}
window.closeMapPicker = function() { document.getElementById('mapModal').style.display = 'none'; }
window.handleSearchEnter = function(event) { if (event.key === "Enter") { event.preventDefault(); searchLocation(); } }
window.searchLocation = async function() {
    const query = document.getElementById('mapSearchInput').value;
    if (!query) return;
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&accept-language=en`);
        const data = await response.json();
        if (data && data.length > 0) pickerMap.flyTo([parseFloat(data[0].lat), parseFloat(data[0].lon)], 14);
    } catch (error) {}
}
window.confirmLocation = async function() {
    const center = pickerMap.getCenter();
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${center.lat}&lon=${center.lng}&accept-language=en`);
        const data = await response.json();
        if (data && data.display_name) {
            document.getElementById(currentInputTarget).value = data.display_name.split(',').slice(0, 3).join(', ');
        }
    } catch (error) {}
    closeMapPicker();
    updateFareEstimate(); 
}

async function getCoordinates(locationName) {
    if (!locationName) return null;
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&accept-language=en`);
        const data = await response.json();
        if (data && data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    } catch (error) {}
    return null;
}

async function calculateDistance(pickupName, stopName, dropName) {
    const pickupCoords = await getCoordinates(pickupName);
    const dropCoords = await getCoordinates(dropName);
    const stopCoords = stopName ? await getCoordinates(stopName) : null;
    if (!pickupCoords || !dropCoords) return null;
    let coordsString = `${pickupCoords[1]},${pickupCoords[0]}`;
    if (stopCoords) coordsString += `;${stopCoords[1]},${stopCoords[0]}`;
    coordsString += `;${dropCoords[1]},${dropCoords[0]}`;
    try {
        const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
            return { distanceKm: (data.routes[0].distance / 1000), coordinates: data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]) };
        }
    } catch (error) {}
    return null;
}

async function updateFareEstimate() {
    const pickup = document.getElementById('pickup').value;
    const stop = document.getElementById('stop').value;
    const drop = document.getElementById('drop').value;
    if (pickup && drop) {
        fareEstimateBox.style.display = 'flex';
        fareBreakdown.textContent = "Calculating from Java Backend...";
        const routeData = await calculateDistance(pickup, stop, drop);
        if (routeData) {
            try {
                const response = await fetch(`https://ridenow-backend-yclb.onrender.com/api/fare?distance=${routeData.distanceKm}`);
                const javaData = await response.json();
                minimumFareAllowed = javaData.fare;
                fareBreakdown.textContent = `Java Min Fare: Rs. ${minimumFareAllowed} (${routeData.distanceKm.toFixed(1)} km)`;
                customFareInput.min = minimumFareAllowed;
                if(!customFareInput.value || customFareInput.value < minimumFareAllowed) customFareInput.value = minimumFareAllowed;
            } catch (error) { fareBreakdown.textContent = "Java Backend Offline!"; }
        }
    } else fareEstimateBox.style.display = 'none';
}
document.getElementById('pickup').addEventListener('change', updateFareEstimate);
document.getElementById('stop').addEventListener('change', updateFareEstimate);
document.getElementById('drop').addEventListener('change', updateFareEstimate);

async function fetchDriverRating(driverId) {
    try {
        const docRef = doc(db, "users", driverId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().rating) {
            document.getElementById('driverRatingDisplay').textContent = `⭐ ${docSnap.data().rating.toFixed(1)} / 5`;
        } else document.getElementById('driverRatingDisplay').textContent = "⭐ New Rider";
    } catch (error) { document.getElementById('driverRatingDisplay').textContent = "⭐ N/A"; }
}

function checkActiveRide(userId) {
    const q = query(collection(db, "rides"), where("passengerId", "==", userId), where("status", "in", ["Pending", "Offer Pending", "Accepted", "Completed"]));

    onSnapshot(q, async (snapshot) => {
        if (!snapshot.empty) {
            snapshot.forEach(async (docSnap) => {
                const ride = docSnap.data();
                currentActiveRideId = docSnap.id;
                currentDriverId = ride.driverId;
                
                rideForm.parentElement.style.display = 'none';
                activeRide.style.display = 'block';
                
                document.getElementById('showPickup').textContent = ride.pickup;
                document.getElementById('showDrop').textContent = ride.drop;
                document.getElementById('showFare').textContent = `Rs. ${ride.fare || 0}`;
                if (ride.stop) {
                    document.getElementById('showStopP').style.display = 'block';
                    document.getElementById('showStop').textContent = ride.stop;
                }

                // Driver Status Alert (I'm here)
                if(ride.driverStatus) {
                    document.getElementById('driverStatusAlert').style.display = 'block';
                    document.getElementById('driverStatusAlert').textContent = `🔔 ${ride.driverStatus}`;
                } else {
                    document.getElementById('driverStatusAlert').style.display = 'none';
                }

                if(ride.status === "Offer Pending") {
                    statusText.textContent = "Rider sent an offer!";
                    statusText.style.color = "orange";
                    document.getElementById('driverOfferBox').style.display = 'block';
                    document.getElementById('offerText').textContent = `${ride.driverName} offered Rs. ${ride.fare}`;
                    mapContainer.style.display = 'none';
                } 
                else if(ride.status === "Accepted") {
                    document.getElementById('driverOfferBox').style.display = 'none';
                    statusText.textContent = `Rider (${ride.driverName}) is on the way!`;
                    statusText.style.color = "var(--primary-color)";
                    mapContainer.style.display = 'block';
                    if(currentDriverId) fetchDriverRating(currentDriverId);
                    
                    // Show Driver Contact Details
                    document.getElementById('driverContact').style.display = 'block';
                    document.getElementById('driverPhone').href = `tel:${ride.driverMobile}`;
                    document.getElementById('driverPhone').innerHTML = `📞 Call ${ride.driverMobile}`;
                    
                    if (!myMap) {
                        setTimeout(async () => {
                            const routeData = await calculateDistance(ride.pickup, ride.stop, ride.drop);
                            if (!routeData) return;
                            myMap = L.map('map').setView(routeData.coordinates[0], 12);
                            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(myMap);
                            const polyline = L.polyline(routeData.coordinates, {color: '#1a73e8', weight: 5}).addTo(myMap);
                            L.marker(routeData.coordinates[0]).addTo(myMap).bindPopup(`Pickup: ${ride.pickup}`);
                            if(ride.stop) L.marker(await getCoordinates(ride.stop)).addTo(myMap).bindPopup(`Stop: ${ride.stop}`);
                            L.marker(routeData.coordinates[routeData.coordinates.length-1]).addTo(myMap).bindPopup(`Drop: ${ride.drop}`);
                            myMap.fitBounds(polyline.getBounds(), {padding: [50, 50]});
                        }, 500);
                    }
                } else if(ride.status === "Completed") {
                    document.getElementById('driverOfferBox').style.display = 'none';
                    document.getElementById('driverContact').style.display = 'none';
                    statusText.textContent = "Ride Completed!";
                    statusText.style.color = "green";
                    mapContainer.style.display = 'none';
                    if(!ride.rating) document.getElementById('ratingModal').style.display = 'flex';
                } else {
                    document.getElementById('driverOfferBox').style.display = 'none';
                    document.getElementById('driverContact').style.display = 'none';
                    statusText.textContent = "Searching for rider...";
                    statusText.style.color = "orange";
                    mapContainer.style.display = 'none';
                }
            });
        } else {
            currentActiveRideId = null;
            currentDriverId = null;
            rideForm.parentElement.style.display = 'block';
            activeRide.style.display = 'none';
            mapContainer.style.display = 'none';
            fareEstimateBox.style.display = 'none';
        }
    });
}

// I'M COMING BUTTON
document.getElementById('imComingBtn').addEventListener('click', async () => {
    if(!currentActiveRideId) return;
    try {
        await updateDoc(doc(db, "rides", currentActiveRideId), { passengerStatus: "I'm coming! Please wait." });
        alert("Rider ko bata diya gaya hai!");
    } catch(error) {}
});

// --- BIDDING ACCEPT/REJECT LOGIC ---
window.acceptDriverOffer = async function() {
    if(!currentActiveRideId) return;
    try {
        await updateDoc(doc(db, "rides", currentActiveRideId), { status: "Accepted" });
    } catch (error) { alert("Error accepting offer."); }
}

window.rejectDriverOffer = async function() {
    if(!currentActiveRideId) return;
    try {
        const rideRef = doc(db, "rides", currentActiveRideId);
        const rideSnap = await getDoc(rideRef);
        const ride = rideSnap.data();
        await updateDoc(rideRef, { 
            status: "Pending", driverId: null, driverName: null, driverMobile: null, fare: ride.passengerFare 
        });
    } catch (error) { alert("Error rejecting offer."); }
}

document.getElementById('cancelRideBtn').addEventListener('click', () => {
    if(!currentActiveRideId) return;
    document.getElementById('cancelModal').style.display = 'flex';
});
window.closeCancelModal = function() { document.getElementById('cancelModal').style.display = 'none'; }
window.confirmCancelRide = async function() {
    const reason = document.getElementById('cancelReason').value;
    closeCancelModal();
    try {
        await updateDoc(doc(db, "rides", currentActiveRideId), { status: "Cancelled", cancelledBy: "Passenger", cancelReason: reason });
        alert("Ride Cancelled Successfully.");
    } catch (error) { alert("Error cancelling ride: " + error.message); }
}

const starContainer = document.getElementById('starContainer');
const stars = starContainer.querySelectorAll('span');
stars.forEach(star => {
    star.addEventListener('click', () => {
        selectedRating = parseInt(star.getAttribute('data-value'));
        stars.forEach(s => s.classList.remove('active'));
        for (let i = 0; i < selectedRating; i++) stars[i].classList.add('active');
    });
});

window.submitRating = async function() {
    if(selectedRating === 0) return alert("Please select a rating.");
    if(!currentDriverId || !currentActiveRideId) return;
    try {
        const rideRef = doc(db, "rides", currentActiveRideId);
        await updateDoc(rideRef, { rating: selectedRating });
        const driverRef = doc(db, "users", currentDriverId);
        const driverSnap = await getDoc(driverRef);
        let newRating = selectedRating, totalRatings = 1;
        if (driverSnap.exists()) {
            const data = driverSnap.data();
            const oldRating = data.rating || 0, oldCount = data.ratingCount || 0;
            totalRatings = oldCount + 1;
            newRating = ((oldRating * oldCount) + selectedRating) / totalRatings;
        }
        await setDoc(driverRef, { rating: newRating, ratingCount: totalRatings }, { merge: true });
        alert("Thank you for your feedback!");
        document.getElementById('ratingModal').style.display = 'none';
        rideForm.reset();
    } catch (error) { alert("Error submitting rating: " + error.message); }
}

rideForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pickup = document.getElementById('pickup').value;
    const stop = document.getElementById('stop').value;
    const drop = document.getElementById('drop').value;
    const time = document.getElementById('rideTime').value;
    const user = auth.currentUser;
    let offeredFare = parseInt(customFareInput.value);

    if (offeredFare < minimumFareAllowed) return alert(`Minimum fare Rs. ${minimumFareAllowed} se kam offer nahi kar sakte.`);

    requestBtn.textContent = "Requesting...";
    requestBtn.disabled = true;

    try {
        await addDoc(collection(db, "rides"), {
            passengerId: user.uid, passengerName: user.displayName || "Passenger", passengerMobile: myMobile,
            rideType: "Bike", pickup: pickup, stop: stop || null, drop: drop, time: time, 
            fare: offeredFare, passengerFare: offeredFare, minFare: minimumFareAllowed, status: "Pending", createdAt: serverTimestamp()
        });
        requestBtn.textContent = "Request Bike Ride";
        requestBtn.disabled = false;
    } catch (error) {
        alert("Error: " + error.message);
        requestBtn.textContent = "Request Bike Ride";
        requestBtn.disabled = false;
    }
});