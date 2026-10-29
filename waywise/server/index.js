import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'WayWise API', timestamp: new Date().toISOString() });
});

// Safe demo estimate. This is not a live Uber/Rapido quote.
// Replace this with an authorized provider integration when credentials/access are approved.
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
    note: 'Illustrative estimate only. Not a live quote from Uber, Rapido, or another provider.'
  });
});

app.get('/api/config', (_req, res) => {
  res.json({ googleMapsConfigured: Boolean(process.env.GOOGLE_MAPS_API_KEY) });
});

app.listen(PORT, () => {
  console.log(`WayWise API running at http://localhost:${PORT}`);
});
