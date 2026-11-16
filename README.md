# 🏍️ RideNow - Bike Ride Hailing App

RideNow ek modern, responsive, aur fully functional Bike Ride Hailing application hai (Uber/InDrive ki tarah). Isme Passenger apni ride request daal sakta hai, aur Driver apna fare offer karke ride accept kar sakta hai. Iska poora backend **Java (Core)** mein develop kiya gaya hai.

## 🚀 Live Demo Links
*   🌐 **Frontend (Web App):** [https://ridenow-frontend-3ysx.onrender.com](https://ridenow-frontend-3ysx.onrender.com)
*   ⚙️ **Backend (Java API):** [https://ridenow-backend-yclb.onrender.com/api/test](https://ridenow-backend-yclb.onrender.com/api/test)

---

## ✨ Key Features
*   **InDrive Style Bidding:** Passenger apna fare offer karta hai, aur Driver apna counter-offer bhej sakta hai.
*   **Real-Time Maps:** OpenStreetMap (Leaflet) ka istemal karke Pickup aur Drop ki location set karna aur rasta dekhna.
*   **Live Tracking & Status:** Ride ka status (Pending -> Offer Pending -> Accepted -> Completed) real-time mein update hota hai.
*   **Driver & Passenger Dashboards:** Dono ke liye alag alag interfaces jahan se wo apni history aur stats dekh sakte hain.
*   **Authentication:** Firebase ke zariye secure Login/Signup.
*   **Cloudinary Integration:** Profile picture upload karne ke liye.
*   **Ratings System:** Ride complete hone ke baad Passenger Driver ko 5-star rating de sakta hai.

---

## 💻 Tech Stack
*   **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6 Modules)
*   **Backend:** Core Java (Built-in `HttpServer` API)
*   **Database:** Firebase Firestore (NoSQL)
*   **Authentication:** Firebase Auth
*   **Cloud Image Storage:** Cloudinary API
*   **Maps & Routing:** Leaflet.js, OpenStreetMap, OSRM (Open Source Routing Machine)
*   **Deployment:** Render (Backend as Docker & Frontend as Static Site)

---

## 🧠 5 Data Structures Used in Java Backend
Project ki university requirement ko poora karne ke liye Java backend (`DataStructures.java`) mein yeh 5 Data Structures implement kiye gaye hain:

1.  **Trie (Prefix Tree):** Location search / auto-suggestions ke liye (jaise "Gul" type karne par "Gulshan" suggest karna).
2.  **Stack:** Ride ke status ki history maintain karne aur Cancel/Undo handle karne ke liye.
3.  **Priority Queue:** Sabse qareeb (Nearest) driver ko pehle match karne ke liye.
4.  **HashMap:** Active Rides aur Users ko fast lookup karne ke liye.
5.  **Graph (Dijkstra's Algorithm):** Pickup aur Drop ke darmiyan shortest route aur distance nikalne ke liye.

---

## 📁 Folder Structure
```text
ridenow/
│
├── backend/                  # Java Backend
│   ├── src/
│   │   ├── Main.java         # Server & API logic
│   │   ├── DataStructures.java # 5 Data Structures implementations
│   │   └── Models.java
│   └── Dockerfile            # For Render Deployment
│
└── frontend/                 # HTML/CSS/JS Frontend
    ├── index.html
    ├── passenger.html
    ├── driver.html
    ├── css/
    ├── js/
    └── assets/
