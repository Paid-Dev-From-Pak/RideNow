# 🏍️ RideNow - Bike Ride Hailing App

RideNow is a modern, fully responsive, and real-time Bike Ride Hailing application (similar to InDrive). Passengers can request rides and offer a fare, while drivers can bid (counter-offer) on those requests. The core business logic and backend are developed in **Core Java**.

---

## 🔗 Live Demo Links
*   🌐 **Live Web App (Frontend):** [https://ridenow-frontend-3ysx.onrender.com](https://ridenow-frontend-3ysx.onrender.com)
*   ⚙️ **Java Backend API:** [https://ridenow-backend-yclb.onrender.com/api/test](https://ridenow-backend-yclb.onrender.com/api/test)

---

## ✨ Key Features

*   **Role-based Authentication:** Separate signup and login flows for Passengers and Drivers using Firebase Auth.
*   **InDrive Style Bidding System:** Passengers offer a fare, and Drivers can send counter-offers. Passengers have the option to Accept or Reject the driver's offer.
*   **Real-Time Maps & Routing:** Integration with OpenStreetMap (Leaflet) and OSRM API to set Pickup, Stop, and Drop locations and visualize the shortest path.
*   **Live Status Alerts:** Real-time alert buttons like "I'm Here" (for Drivers) and "I'm Coming" (for Passengers) to keep each other updated.
*   **Contact System:** After a ride is accepted, both the Passenger and Driver can view each other's mobile numbers to coordinate via call.
*   **Driver Stats & History:** Drivers can view their total earnings and completed rides dashboard. Passengers can view their past ride history.
*   **Ratings System:** Passengers can give a 5-star rating to the driver after the ride is completed.
*   **Cancel System:** Both parties can cancel a ride with a specific reason.
*   **Cloudinary Integration:** Users can upload a profile picture.

---

## 🧠 5 Data Structures Used in Java Backend
To fulfill the university project requirements, the following 5 Data Structures are implemented in the Java backend (`DataStructures.java`):

1.  **Trie (Prefix Tree):** Used for location search and auto-suggestions (e.g., typing "Gul" suggests "Gulshan").
2.  **Stack:** Used to maintain the history of ride statuses and handle Undo/Cancel operations.
3.  **Priority Queue:** Used for matching the nearest available driver to a passenger's request.
4.  **HashMap:** Used for fast lookup of active rides and user data.
5.  **Graph (Dijkstra's Algorithm):** Used to calculate the shortest route and distance between Pickup and Drop locations.

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
