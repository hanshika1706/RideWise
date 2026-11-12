/**
 * Fare Calculation Engine for RideWise / WayWise
 * Designed to consume distance (km) and tolls (INR) from Mappls (MapmyIndia) Routing & Toll APIs.
 * Calculates transparent, multi-vehicle commuter fares with itemized breakdowns.
 */

export const VEHICLE_CONFIGS = {
  sedan: {
    id: 'sedan',
    name: 'Cab Sedan',
    category: 'Cab',
    description: 'Comfortable 4-seater sedan, best for highway commutes',
    capacity: '4 seats',
    icon: 'CarFront',
    baseFare: 50,
    includedKm: 1.5,
    perKmRate: 14.0,
    platformFee: 15,
    taxRate: 0.05, // 5% GST
    appliesTolls: true,
    nightSurgeMultiplier: 1.15
  },
  mini: {
    id: 'mini',
    name: 'Cab Mini',
    category: 'Cab',
    description: 'Pocket-friendly compact hatchback for up to 4 passengers',
    capacity: '4 seats',
    icon: 'Car',
    baseFare: 40,
    includedKm: 1.5,
    perKmRate: 11.5,
    platformFee: 12,
    taxRate: 0.05,
    appliesTolls: true,
    nightSurgeMultiplier: 1.15
  },
  auto: {
    id: 'auto',
    name: 'Auto Rickshaw',
    category: 'Auto',
    description: 'Affordable metered 3-wheeler for quick city transfers',
    capacity: '3 seats',
    icon: 'Zap',
    baseFare: 30,
    includedKm: 1.5,
    perKmRate: 10.0,
    platformFee: 5,
    taxRate: 0.0, // No GST on metered autos
    appliesTolls: false, // Autos generally use service/local lanes or toll-free
    nightSurgeMultiplier: 1.25
  },
  bike: {
    id: 'bike',
    name: 'Bike Taxi',
    category: 'Bike',
    description: 'Fastest single-rider commute to zip through traffic',
    capacity: '1 seat',
    icon: 'Bike',
    baseFare: 20,
    includedKm: 2.0,
    perKmRate: 6.0,
    platformFee: 5,
    taxRate: 0.0, // Exempt
    appliesTolls: false, // 2-wheelers are toll-exempt across Indian National Highways
    nightSurgeMultiplier: 1.1
  }
};

/**
 * Calculate fare for a specific vehicle mode.
 * @param {string} vehicleId - 'sedan' | 'mini' | 'auto' | 'bike'
 * @param {number} distanceKm - Route distance in kilometers (e.g. from Mappls route response)
 * @param {number} tolls - Toll cost in INR (e.g. from Mappls toll API)
 * @param {object} options - Optional overrides (isNight, surgeMultiplier)
 */
export function calculateFare(vehicleId = 'sedan', distanceKm = 0, tolls = 0, options = {}) {
  const config = VEHICLE_CONFIGS[vehicleId] || VEHICLE_CONFIGS.sedan;
  const validDistance = Math.max(0, Number(distanceKm) || 0);
  const validTolls = Math.max(0, Number(tolls) || 0);
  
  const surgeMultiplier = options.surgeMultiplier || (options.isNight ? config.nightSurgeMultiplier : 1.0);

  // Distance beyond base included distance
  const billableKm = Math.max(0, validDistance - config.includedKm);
  const distanceFare = Math.round(billableKm * config.perKmRate);
  
  // Subtotal before tolls and taxes
  const basePlusDistance = config.baseFare + distanceFare;
  const surgedRideFare = Math.round(basePlusDistance * surgeMultiplier);
  const surgeAmount = surgedRideFare - basePlusDistance;

  // Taxes (GST)
  const taxAmount = Math.round(surgedRideFare * config.taxRate);

  // Tolls applied if vehicle is subject to tolls
  const appliedTolls = config.appliesTolls ? validTolls : 0;

  // Final Total
  const totalFare = surgedRideFare + appliedTolls + config.platformFee + taxAmount;

  return {
    vehicleId: config.id,
    vehicleName: config.name,
    category: config.category,
    description: config.description,
    capacity: config.capacity,
    distanceKm: validDistance,
    tolls: appliedTolls,
    breakdown: {
      baseFare: config.baseFare,
      includedKm: config.includedKm,
      billableKm: Number(billableKm.toFixed(1)),
      perKmRate: config.perKmRate,
      distanceFare,
      surgeMultiplier,
      surgeAmount,
      platformFee: config.platformFee,
      taxAmount,
      taxRatePercent: config.taxRate * 100,
      tolls: appliedTolls
    },
    totalFare,
    formattedFare: `₹${totalFare}`,
    currency: 'INR'
  };
}

/**
 * Calculates fares for all available vehicle modes simultaneously for comparison.
 * Useful for Mappls route summary cards.
 */
export function calculateAllVehicleFares(distanceKm = 0, tolls = 0, options = {}) {
  return Object.keys(VEHICLE_CONFIGS).map(id => calculateFare(id, distanceKm, tolls, options));
}

/**
 * Helper to parse distance strings (e.g., "32 km", "32.4 km", 32000 meters) into pure km number.
 */
export function parseDistanceKm(val) {
  if (typeof val === 'number') {
    // If value is in meters (> 500), convert to km
    return val > 500 ? Number((val / 1000).toFixed(1)) : val;
  }
  if (!val) return 0;
  const match = String(val).match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

/**
 * Helper to parse toll strings (e.g., "₹100", "100", 100) into pure number.
 */
export function parseTollAmount(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}
