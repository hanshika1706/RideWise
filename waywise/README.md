# WayWise — Figma-aligned prototype

This version updates the website UI to match the submitted Figma direction: dark navy navigation, pale blue-grey background, compact cards, and separate pages for Home, Login, Route Options, Route Details, Ride Confirmation, Trip Tracking, Profile, My Trips, and Settings.

## Run locally
1. Open this folder in VS Code.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open `http://localhost:5173`.

The Express API runs on `http://localhost:4000`.

## Current functionality
- Navigation between all main screens
- Editable pickup and destination
- Route option selection and route summary
- Google Maps and Waze external navigation links
- Demo ride confirmation and trip tracking screen
- Profile saved places and settings toggles
- Responsive desktop and mobile layout

## Important limitations
This is a student project prototype. Route metrics, fare amounts, map route drawing, and tracking progress are sample/demo data. Confirming a ride does not book a real cab. Google Maps and Waze links open external navigation apps/sites. Live routing, map embeds, traffic, tolls, provider fares, and cab booking require appropriate API configuration and authorized provider access.

Never commit real API keys or `.env` to GitHub.
