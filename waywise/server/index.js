import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import fsSync from 'fs';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');

const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const PLACES_FILE = path.join(DATA_DIR, 'places.json');
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback.json');
const PROFILE_FILE = path.join(DATA_DIR, 'profile.json');

// Enable CORS for all origins and methods
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (_req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

// Default Initial Seed Data
const defaultPlaces = [
  { name: 'Home', address: 'Palam Vihar, Gurugram, Haryana', type: 'Home' },
  { name: 'BMU Campus', address: 'Kapriwas, District Rewari, Haryana', type: 'College' },
  { name: 'Ambience Mall', address: 'NH-8, DLF Phase 3, Gurugram', type: 'Shopping' },
  { name: 'Fitness Gym', address: 'Sector 14, Gurugram', type: 'Fitness' }
];

const defaultProfile = {
  name: 'Suhani Jain',
  email: 'suhani.jain@example.com',
  phone: '+91 98765 43210',
  city: 'Gurugram (Delhi NCR)',
  role: 'Student / Daily Commuter',
  verified: true
};

const defaultRoutes = [
  { id: 1, name: 'Route A via NH-48 Express', tag: 'Fastest', time: '45 min', distanceKm: 32, fare: 600, toll: 100, color: 'blue', detail: 'Highway driving with express lanes and automated toll plaza.' },
  { id: 2, name: 'Route B via Old Delhi Road', tag: 'Cheapest', time: '58 min', distanceKm: 28, fare: 490, toll: 0, color: 'green', detail: 'Avoids all toll booths using local arterial roads with moderate traffic.' },
  { id: 3, name: 'Route C via Cyber City Flyover', tag: 'Scenic', time: '50 min', distanceKm: 30, fare: 540, toll: 50, color: 'blue', detail: 'Smooth flyover bypass with minimal signals and one minor toll.' }
];

const defaultVehicles = [
  { id: 'bike', name: 'Bike', description: 'Quick and affordable solo rides', seats: 1, fare: 249, arrival: '3 min' },
  { id: 'auto', name: 'Auto', description: 'Budget-friendly city travel', seats: 3, fare: 399, arrival: '5 min' },
  { id: 'mini', name: 'Mini Cab', description: 'Comfortable everyday rides', seats: 4, fare: 599, arrival: '6 min' },
  { id: 'sedan', name: 'Sedan', description: 'Extra comfort for your journey', seats: 4, fare: 749, arrival: '7 min' },
  { id: 'suv', name: 'SUV', description: 'Spacious rides for groups', seats: 6, fare: 999, arrival: '9 min' }
];

// Generic JSON Read/Write Helpers
async function readJsonFile(filePath, defaultValue) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    if (!fsSync.existsSync(filePath)) {
      await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
      return defaultValue;
    }
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data || JSON.stringify(defaultValue));
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultValue;
  }
}

async function writeJsonFile(filePath, data) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ================= SYSTEM & HEALTH =================

app.get('/api/health', async (_req, res) => {
  const bookings = await readJsonFile(BOOKINGS_FILE, []);
  const places = await readJsonFile(PLACES_FILE, defaultPlaces);
  const feedback = await readJsonFile(FEEDBACK_FILE, []);

  res.json({
    status: 'ok',
    service: 'WayWise Backend Mobility API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    databaseStats: {
      bookingsCount: bookings.length,
      placesCount: places.length,
      feedbackCount: feedback.length
    }
  });
});

app.get('/api/config', (_req, res) => {
  res.json({
    googleMapsConfigured: Boolean(process.env.GOOGLE_MAPS_API_KEY),
    mapplsConfigured: Boolean(process.env.VITE_MAPPLS_KEY),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ================= ROUTE PLANNER & VEHICLES =================

app.get('/api/routes', (_req, res) => {
  res.json({ success: true, count: defaultRoutes.length, routes: defaultRoutes });
});

app.get('/api/vehicles', (_req, res) => {
  res.json({ success: true, count: defaultVehicles.length, vehicles: defaultVehicles });
});

app.post('/api/estimate', (req, res) => {
  const { distanceKm, tolls = 0 } = req.body || {};
  const distance = Number(distanceKm);
  const toll = Number(tolls);
  if (!Number.isFinite(distance) || distance <= 0 || distance > 1000 ||
      !Number.isFinite(toll) || toll < 0 || toll > 10000) {
    return res.status(400).json({ error: 'Provide a valid distanceKm and tolls value.' });
  }
  const base = 35;
  const perKm = 13;
  const estimate = Math.round(base + distance * perKm + toll);
  res.json({
    currency: 'INR',
    estimate,
    breakdown: { baseFare: base, distanceFare: Math.round(distance * perKm), tolls: Math.round(toll) },
    note: 'Sample estimate based on Delhi NCR corridor mobility tariff.'
  });
});

// ================= CAB BOOKINGS API =================

app.get('/api/bookings', async (_req, res) => {
  try {
    const bookings = await readJsonFile(BOOKINGS_FILE, []);
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve bookings from database.' });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { pickup, destination, vehicle, fare, paymentMethod, arrival, id } = req.body || {};

    if (!pickup?.trim() || !destination?.trim()) {
      return res.status(400).json({ error: 'Pickup and destination are required.' });
    }

    if (pickup.trim().toLowerCase() === destination.trim().toLowerCase()) {
      return res.status(400).json({ error: 'Pickup and destination cannot be identical.' });
    }

    const newBooking = {
      id: id || `RW-${Date.now().toString().slice(-8)}`,
      pickup: pickup.trim(),
      destination: destination.trim(),
      vehicle: vehicle || 'Mini Cab',
      fare: Number(fare) || 599,
      paymentMethod: paymentMethod || 'cash',
      arrival: arrival || '5 min',
      status: 'Confirmed',
      submittedAt: new Date().toISOString()
    };

    const bookings = await readJsonFile(BOOKINGS_FILE, []);
    bookings.unshift(newBooking);
    await writeJsonFile(BOOKINGS_FILE, bookings);

    res.status(201).json({
      success: true,
      message: 'Booking successfully saved to server/data/bookings.json',
      booking: newBooking
    });
  } catch (err) {
    console.error('Failed to save booking:', err);
    res.status(500).json({ error: 'Server error: could not write booking to file.' });
  }
});

app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let bookings = await readJsonFile(BOOKINGS_FILE, []);
    const initialLength = bookings.length;
    bookings = bookings.filter(b => b.id !== id);

    if (bookings.length === initialLength) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    await writeJsonFile(BOOKINGS_FILE, bookings);
    res.json({ success: true, message: `Booking ${id} deleted from database.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete booking from file.' });
  }
});

// ================= SAVED PLACES API =================

app.get('/api/places', async (_req, res) => {
  try {
    const places = await readJsonFile(PLACES_FILE, defaultPlaces);
    res.json({ success: true, places });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve places.' });
  }
});

app.post('/api/places', async (req, res) => {
  try {
    const { name, address, type } = req.body || {};
    if (!name?.trim() || !address?.trim()) {
      return res.status(400).json({ error: 'Place name and address are required.' });
    }

    const places = await readJsonFile(PLACES_FILE, defaultPlaces);
    const newPlace = {
      name: name.trim(),
      address: address.trim(),
      type: type?.trim() || 'Custom',
      addedAt: new Date().toISOString()
    };
    places.push(newPlace);
    await writeJsonFile(PLACES_FILE, places);

    res.status(201).json({ success: true, message: 'Place saved to server/data/places.json', place: newPlace, places });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save place.' });
  }
});

app.delete('/api/places/:index', async (req, res) => {
  try {
    const idx = parseInt(req.params.index, 10);
    const places = await readJsonFile(PLACES_FILE, defaultPlaces);
    if (isNaN(idx) || idx < 0 || idx >= places.length) {
      return res.status(400).json({ error: 'Invalid place index.' });
    }
    places.splice(idx, 1);
    await writeJsonFile(PLACES_FILE, places);
    res.json({ success: true, message: 'Place removed from database.', places });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove place.' });
  }
});

// ================= FEEDBACK & REVIEWS API =================

app.get('/api/feedback', async (_req, res) => {
  try {
    const feedback = await readJsonFile(FEEDBACK_FILE, []);
    res.json({ success: true, count: feedback.length, feedback });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve feedback.' });
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const { name, email, category, rating, comments } = req.body || {};
    if (!comments?.trim() || comments.trim().length < 5) {
      return res.status(400).json({ error: 'Comments must be at least 5 characters long.' });
    }

    const feedbackList = await readJsonFile(FEEDBACK_FILE, []);
    const entry = {
      id: `FB-${Date.now().toString().slice(-6)}`,
      name: name?.trim() || 'Anonymous Commuter',
      email: email?.trim() || 'Not provided',
      category: category || 'Route Accuracy',
      rating: Number(rating) || 5,
      comments: comments.trim(),
      submittedAt: new Date().toISOString()
    };

    feedbackList.unshift(entry);
    await writeJsonFile(FEEDBACK_FILE, feedbackList);

    res.status(201).json({
      success: true,
      message: 'Feedback saved to server/data/feedback.json',
      entry
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit feedback.' });
  }
});

// ================= USER PROFILE & AUTH API =================

app.get('/api/profile', async (_req, res) => {
  try {
    const profile = await readJsonFile(PROFILE_FILE, defaultProfile);
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load profile.' });
  }
});

app.post('/api/profile', async (req, res) => {
  try {
    const current = await readJsonFile(PROFILE_FILE, defaultProfile);
    const updated = { ...current, ...(req.body || {}) };
    await writeJsonFile(PROFILE_FILE, updated);
    res.json({ success: true, message: 'Profile saved to server/data/profile.json', profile: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  const profile = await readJsonFile(PROFILE_FILE, defaultProfile);
  res.json({
    success: true,
    message: 'Authentication successful.',
    user: {
      name: profile.name,
      email: email.trim(),
      token: `ww-token-${Date.now()}`
    }
  });
});

// ================= DATA BUNDLE & EXPORT API =================

app.get('/api/data/export', async (_req, res) => {
  try {
    const bookings = await readJsonFile(BOOKINGS_FILE, []);
    const places = await readJsonFile(PLACES_FILE, defaultPlaces);
    const feedback = await readJsonFile(FEEDBACK_FILE, []);
    const profile = await readJsonFile(PROFILE_FILE, defaultProfile);

    res.json({
      database: 'WayWise Local JSON Database',
      exportedAt: new Date().toISOString(),
      data: {
        bookings,
        places,
        feedback,
        profile
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not export database.' });
  }
});

// Generic 404 for unknown API routes
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error('Express error:', err);
  res.status(500).json({ error: err.message || 'Server Internal Error' });
});

const server = app.listen(PORT, () => {
  console.log(`WayWise Backend API is active at http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`Port ${PORT} is in use. An active instance is already running.`);
  } else {
    console.error('Server error:', err);
  }
});
