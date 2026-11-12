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

const VEHICLE_CONFIGS = {
  sedan: {
    id: 'sedan',
    name: 'Cab Sedan',
    category: 'Cab',
    capacity: '4 seats',
    baseFare: 50,
    includedKm: 1.5,
    perKmRate: 14.0,
    platformFee: 15,
    taxRate: 0.05,
    appliesTolls: true
  },
  mini: {
    id: 'mini',
    name: 'Cab Mini',
    category: 'Cab',
    capacity: '4 seats',
    baseFare: 40,
    includedKm: 1.5,
    perKmRate: 11.5,
    platformFee: 12,
    taxRate: 0.05,
    appliesTolls: true
  },
  auto: {
    id: 'auto',
    name: 'Auto Rickshaw',
    category: 'Auto',
    capacity: '3 seats',
    baseFare: 30,
    includedKm: 1.5,
    perKmRate: 10.0,
    platformFee: 5,
    taxRate: 0.0,
    appliesTolls: false
  },
  bike: {
    id: 'bike',
    name: 'Bike Taxi',
    category: 'Bike',
    capacity: '1 seat',
    baseFare: 20,
    includedKm: 2.0,
    perKmRate: 6.0,
    platformFee: 5,
    taxRate: 0.0,
    appliesTolls: false
  }
};

function computeFare(vehicleId, distanceKm, tolls = 0, surgeMultiplier = 1.0) {
  const cfg = VEHICLE_CONFIGS[vehicleId] || VEHICLE_CONFIGS.sedan;
  const dist = Math.max(0, Number(distanceKm) || 0);
  const tollVal = Math.max(0, Number(tolls) || 0);

  const billableKm = Math.max(0, dist - cfg.includedKm);
  const distanceFare = Math.round(billableKm * cfg.perKmRate);
  const subtotal = Math.round((cfg.baseFare + distanceFare) * surgeMultiplier);
  const taxAmount = Math.round(subtotal * cfg.taxRate);
  const appliedTolls = cfg.appliesTolls ? tollVal : 0;
  const total = subtotal + appliedTolls + cfg.platformFee + taxAmount;

  return {
    vehicleId: cfg.id,
    vehicleName: cfg.name,
    category: cfg.category,
    capacity: cfg.capacity,
    totalFare: total,
    currency: 'INR',
    breakdown: {
      baseFare: cfg.baseFare,
      includedKm: cfg.includedKm,
      billableKm: Number(billableKm.toFixed(1)),
      perKmRate: cfg.perKmRate,
      distanceFare,
      appliedTolls,
      platformFee: cfg.platformFee,
      taxAmount,
      surgeMultiplier
    }
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'WayWise API', timestamp: new Date().toISOString() });
});

// Calculate single vehicle fare (backward-compatible with existing /api/estimate)
app.post('/api/estimate', (req, res) => {
  const { distanceKm, tolls = 0, vehicle = 'sedan', surge = 1.0 } = req.body || {};
  const distance = Number(distanceKm);
  const toll = Number(tolls);
  if (!Number.isFinite(distance) || distance <= 0 || distance > 1000 ||
      !Number.isFinite(toll) || toll < 0 || toll > 10000) {
    return res.status(400).json({ error: 'Provide a valid distanceKm and tolls value.' });
  }

  const result = computeFare(vehicle, distance, toll, Number(surge) || 1.0);
  res.json({
    currency: 'INR',
    estimate: result.totalFare,
    vehicle: result.vehicleName,
    breakdown: result.breakdown,
    note: 'Fare calculated using RideWise fare engine based on route distance and toll data.'
  });
});

// Calculate multi-vehicle fare comparison (Sedan, Mini, Auto, Bike) for Mappls route metrics
app.post('/api/fares/compare', (req, res) => {
  const { distanceKm, tolls = 0, surge = 1.0 } = req.body || {};
  const distance = Number(distanceKm);
  const toll = Number(tolls);
  if (!Number.isFinite(distance) || distance <= 0 || distance > 1000) {
    return res.status(400).json({ error: 'Provide a valid distanceKm value.' });
  }

  const comparisons = Object.keys(VEHICLE_CONFIGS).map(vId =>
    computeFare(vId, distance, toll, Number(surge) || 1.0)
  );

  res.json({
    distanceKm: distance,
    tolls: toll,
    currency: 'INR',
    vehicles: comparisons
  });
});

app.get('/api/config', (_req, res) => {
  res.json({
    googleMapsConfigured: Boolean(process.env.GOOGLE_MAPS_API_KEY),
    mapplsConfigured: Boolean(process.env.MAPPLS_MAP_KEY || process.env.MAPPLS_CLIENT_ID)
  });
});

app.listen(PORT, () => {
  console.log(`WayWise API running at http://localhost:${PORT}`);
});
