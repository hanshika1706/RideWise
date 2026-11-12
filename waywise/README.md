# WayWise — Smart Route Comparison & Mobility Platform

WayWise is a modern route-based cab mobility and route comparison platform that empowers commuters to compare travel times, fare costs, and real-time toll charges before choosing and booking their ride.

---

## 🌟 Key Features Implemented

### 1. Multi-Page Navigation & Linking
- **Home**: Hero section, interactive search card with location swap, quick destination chips, commuter statistics, popular commutes, and CTA banners.
- **Route Planner & Comparison (`routes`)**: Live alternative route options with filtering (Fastest ⚡, Lowest Cost 💰, Toll-Free 🛣️) and interactive selection.
- **Route Details (`details`)**: Complete journey breakdown (estimated travel time, total distance, fare estimate, and toll plaza costs) with quick booking links.
- **Ride Confirmation (`confirm`)**: Journey summary card with vehicle choices and itinerary verification.
- **Live Trip Tracking (`tracking`)**: Simulated route monitor with ETA countdown, progress indicator, and external navigation (Google Maps and Waze).
- **Cab Booking (`cab-booking`)**: Interactive vehicle tier picker (Bike, City Auto, Mini Cab, Sedan, SUV), dynamic pricing, sample ETAs, payment method selection, and instant confirmation.
- **My Trips (`trips`)**: Synchronized with `server/data/bookings.json`, showing confirmed bookings with rebooking and cancellation (`DELETE`) actions.
- **Live Mappls Map (`map`)**: Interactive map canvas powered by Mappls SDK with interactive corridor fallback mode.
- **Customer Feedback & Reviews (`feedback`)**: Form with interactive 5-star rating widget, category picker, and comments saved to `server/data/feedback.json`.
- **User Profile (`profile`)**: Profile overview with interactive **Add Saved Place Modal** and **Edit Profile Modal** saved to local JSON database.
- **Settings & Preferences (`settings`)**: Notification toggles, privacy switches, and dynamic unit switcher (**Kilometers (km)** ⇄ **Miles (mi)**).
- **JSON Database Inspector (`database`)**: Live in-app database browser allowing users to view, refresh, and download `bookings.json`, `places.json`, `feedback.json`, and `profile.json` directly from the browser.

### 2. JavaScript Interactions & Validations
- **Location Swap**: One-click swap button between pickup and destination with a smooth 180° rotation.
- **Quick Destination Chips**: One-click additions for popular hubs (+ Ambience Mall, + Cyber Hub, + BMU Campus, + Airport T3).
- **Distance Unit Converter**: Real-time conversion across all route cards when changing from Kilometers to Miles in Settings.
- **Star Rating Selector**: Interactive 1 to 5 star rating with dynamic hover and active states.
- **Form Validations**: Pickup and destination required checks, identical location prevention, email format checks, and minimum comment length validation.
- **Safe Fallback**: Automatic synchronization with browser `localStorage` ensuring zero downtime or crashes even if the backend is restarting.

### 3. Form Submissions
- **Cab Booking Form**: Submits to `POST /api/bookings` with button loading state and confirmation receipt.
- **Feedback & Review Form**: Submits to `POST /api/feedback` with confirmation screen.
- **Add Saved Place Form**: Validates and submits to `POST /api/places`.
- **Edit Profile Form**: Validates and submits to `POST /api/profile`.

### 4. Local JSON File Storage (`server/data/`)
All form submissions are permanently stored in formatted `.json` files on disk:
- `server/data/bookings.json`: Saved cab bookings and itinerary logs.
- `server/data/places.json`: Saved commuter locations and frequent hubs.
- `server/data/feedback.json`: User reviews, ratings, and commute comments.
- `server/data/profile.json`: User contact information and commute preferences.

### 5. Enhanced Graphics & Visual Design
- **Typography**: Clean, readable typography using **Plus Jakarta Sans** and **Inter** with a standard 14px body scale.
- **Color System**: Vibrant electric blue gradients (`#2563eb` to `#1d4ed8`), deep navy header (`#060a1d`), and soft slate backgrounds.
- **Card Styling**: Frosted glassmorphism, multi-layer soft shadows, and modern 16px–24px rounded corners.
- **Interactive SVG Route Map**: Route line with animated dashed center line, highway shields, and pulsing GPS markers.

---

## 🚀 Running the Project Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Instructions
1. Open terminal in the `waywise` directory:
   ```bash
   cd RideWise-main/waywise
   ```
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Start both the Express Backend and Vite Frontend concurrently:
   ```bash
   npm run dev
   ```
4. Open your browser:
   - **Frontend UI**: `http://localhost:5173`
   - **Backend API**: `http://localhost:4000`

---

## 📡 Backend API Endpoints

| Method | Endpoint | Description | Target JSON Storage |
|---|---|---|---|
| `GET` | `/api/health` | Service health and database record stats | Memory / System |
| `GET` | `/api/config` | Environment and map configuration | `.env` / Process |
| `GET` | `/api/routes` | Available commute routes | Static Catalog |
| `GET` | `/api/vehicles` | Vehicle categories and base tariffs | Static Catalog |
| `POST` | `/api/estimate` | Calculate fare breakdown by distance & tolls | Pure Function |
| `GET` | `/api/bookings` | List all saved bookings | `server/data/bookings.json` |
| `POST` | `/api/bookings` | Submit and write a new booking | `server/data/bookings.json` |
| `DELETE`| `/api/bookings/:id` | Cancel/delete a booking by ID | `server/data/bookings.json` |
| `GET` | `/api/places` | List saved commuter hubs | `server/data/places.json` |
| `POST` | `/api/places` | Add and save a new hub | `server/data/places.json` |
| `DELETE`| `/api/places/:index`| Remove a saved place by index | `server/data/places.json` |
| `GET` | `/api/feedback` | List submitted customer feedback | `server/data/feedback.json` |
| `POST` | `/api/feedback` | Submit and save a review | `server/data/feedback.json` |
| `GET` | `/api/profile` | Load commuter profile details | `server/data/profile.json` |
| `POST` | `/api/profile` | Update profile information | `server/data/profile.json` |
| `POST` | `/api/login` | Commuter authentication & session token | Auth Simulation |
| `GET` | `/api/data/export` | Export all 4 databases in a single JSON bundle | All 4 JSON files |

---

## 📁 Project Structure

```
waywise/
├── server/
│   ├── index.js              # Express REST API with CORS and JSON endpoints
│   └── data/                 # Local JSON database storage
│       ├── bookings.json     # Saved cab bookings
│       ├── feedback.json     # Commuter feedback and reviews
│       ├── places.json       # User saved places
│       └── profile.json      # User profile settings
├── src/
│   ├── components/
│   │   ├── AboutUs.jsx       # About Us page component
│   │   ├── CabBooking.jsx    # Cab booking module with JSON export
│   │   ├── MapplsMap.jsx     # Live Map component with fallback simulation
│   │   └── mappls.css        # Map styling
│   ├── aboutUs.css           # About Us styling
│   ├── cabBooking.css        # Cab Booking modern card styling
│   ├── styles.css            # Global modern design system & components
│   ├── App.jsx               # Main SPA routing, pages & modals
│   └── main.jsx              # Application entry point
├── package.json              # Project dependencies & scripts
├── vite.config.js            # Vite configuration with proxy to port 4000
└── README.md                 # Complete project documentation
```

---

*Student Project Prototype · RideWise / WayWise Mobility · 2026*
