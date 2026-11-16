# 🏍️ RideNow - Bike Ride Hailing App

RideNow ek modern, fully responsive, aur real-time **Bike Ride Hailing application** hai (InDrive jaisi). Isme Passengers apni ride request daal sakte hain aur Drivers apna fare offer (bidding) kar sakte hain. Iska core logic aur business backend **Java** mein develop kiya gaya hai.

---

## 🔗 Live Demo Links
*   🌐 **Live Web App (Frontend):** [https://ridenow-frontend-3ysx.onrender.com](https://ridenow-frontend-3ysx.onrender.com)
*   ⚙️ **Java Backend API:** [https://ridenow-backend-yclb.onrender.com/api/test](https://ridenow-backend-yclb.onrender.com/api/test)

---

## ✨ Key Features

*   **Role-based Authentication:** Passenger aur Driver ke liye alag alag signup aur login system (Firebase Auth).
*   **InDrive Style Bidding System:** Passenger apna fare offer karta hai. Driver usko counter-offer bhej sakta hai, aur Passenger ke paas us offer ko Accept ya Reject karne ka option hota hai.
*   **Real-Time Maps & Routing:** OpenStreetMap (Leaflet) aur OSRM API ka istemal karke Pickup, Stop, aur Drop ki locations set karna aur shortest rasta dekhna.
*   **Live Status Alerts:** Driver ke paas "I'm Here" aur Passenger ke paas "I'm Coming" ke real-time alert buttons.
*   **Contact System:** Ride accept hone ke baad Passenger aur Driver ek doosre ka mobile number dekh kar direct call kar sakte hain.
*   **Driver Stats & History:** Driver apni total earnings aur completed rides ka dashboard dekh sakta hai. Passenger apni ride history dekh sakta hai.
*   **Ratings System:** Ride complete hone ke baad Passenger Driver ko 5-star rating de sakta hai.
*   **Cancel System:** Dono ke paas proper reason ke sath ride cancel karne ka option hai.
*   **Cloudinary Integration:** User profile picture upload karne ke liye.

---

## 🧠 5 Data Structures Used in Java Backend
University project ki requirement ko poora karne ke liye Java backend (`DataStructures.java`) mein yeh 5 Data Structures implement kiye gaye hain:

1.  **Trie (Prefix Tree):** Location search / auto-suggestions ke liye (jaise "Gul" type karne par "Gulshan" suggest karna).
2.  **Stack:** Ride ke status ki history maintain karne aur Cancel/Undo handle karne ke liye.
3.  **Priority Queue:** Sabse qareeb (Nearest) driver ko pehle match karne ke liye.
4.  **HashMap:** Active Rides aur Users ko fast lookup karne ke liye.
5.  **Graph (Dijkstra's Algorithm):** Pickup aur Drop ke darmiyan shortest route aur distance nikalne ke liye.

---

## 💻 Tech Stack

*   **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6 Modules)
*   **Backend:** Core Java (Built-in `HttpServer` API)
*   **Database:** Firebase Firestore (NoSQL)
*   **Authentication:** Firebase Auth
*   **Image Storage:** Cloudinary API
*   **Maps & Routing:** Leaflet.js, OpenStreetMap, OSRM (Open Source Routing Machine)
*   **Deployment:** Render (Backend as Docker container & Frontend as Static Site)

---

## 📁 Folder Structure
```text
ridenow/
│
├── backend/                  # Java Backend
│   ├── src/
│   │   ├── Main.java         # Server, API & Routing logic
│   │   ├── DataStructures.java # 5 Data Structures implementations
│   │   └── Models.java       # Data models
│   └── Dockerfile            # For Render Deployment
│
└── frontend/                 # HTML/CSS/JS Frontend
    ├── index.html            # Login/Signup
    ├── passenger.html        # Passenger Dashboard
    ├── passenger-history.html# Passenger Ride History
    ├── driver.html           # Driver Dashboard
    ├── driver-my-rides.html  # Active Accepted Rides
    ├── driver-stats.html     # Driver Earnings
    ├── css/
    ├── js/
    └── assets/
