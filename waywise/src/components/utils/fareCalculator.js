export const fareRates = {
  hatchback: {
    name: "Hatchback",
    baseFare: 50,
    perKm: 12,
  },
  sedan: {
    name: "Sedan",
    baseFare: 80,
    perKm: 15,
  },
  auto: {
    name: "Auto Rickshaw",
    baseFare: 30,
    includedKm: 1.5,
    perKm: 11,
  },
  bike: {
    name: "Bike Taxi",
    baseFare: 20,
    perKm: 6,
  },
};

export function calculateFare(vehicleType, distance, tolls = 0) {
  const vehicle = fareRates[vehicleType];

  if (!vehicle) {
    throw new Error("Invalid vehicle type");
  }

  if (!Number.isFinite(distance) || distance < 0) {
    throw new Error("Distance must be a valid non-negative number");
  }

  if (!Number.isFinite(tolls) || tolls < 0) {
    throw new Error("Tolls must be a valid non-negative number");
  }

  let distanceFare;

  if (vehicleType === "auto") {
    const extraDistance = Math.max(0, distance - vehicle.includedKm);
    distanceFare = extraDistance * vehicle.perKm;
  } else {
    distanceFare = distance * vehicle.perKm;
  }

  return {
    id: vehicleType,
    vehicle: vehicle.name,
    baseFare: vehicle.baseFare,
    distanceFare: Number(distanceFare.toFixed(2)),
    tolls: Number(tolls.toFixed(2)),
    totalFare: Number(
      (vehicle.baseFare + distanceFare + tolls).toFixed(2)
    ),
  };
}

export function calculateAllFares(distance, tolls = 0) {
  return Object.keys(fareRates).map((vehicleType) =>
    calculateFare(vehicleType, distance, tolls)
  );
}