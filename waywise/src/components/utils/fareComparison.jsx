import { useState } from "react";
import {
  ArrowLeft,
  Bike,
  CarFront,
  MapPin,
  Navigation,
  Clock3,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  Route,
  Calculator,
} from "lucide-react";

import MapplsMap from "./MapplsMap";
import { calculateAllFares } from "./utils/fareCalculator";
import "../fareComparison.css";

const vehicleIcons = {
  hatchback: CarFront,
  sedan: CarFront,
  auto: CarFront,
  bike: Bike,
};

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

export default function FareComparison({ onBack = () => {} }) {
  const [origin, setOrigin] = useState({
    longitude: "77.0266",
    latitude: "28.4595",
  });

  const [destination, setDestination] = useState({
    longitude: "77.0880",
    latitude: "28.4590",
  });

  const [tolls, setTolls] = useState("0");
  const [route, setRoute] = useState(null);
  const [fares, setFares] = useState([]);
  const [expandedFare, setExpandedFare] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateCoordinate(setter, field, value) {
    setter((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function calculateRoute() {
    setError("");
    setRoute(null);
    setFares([]);

    const startLng = Number(origin.longitude);
    const startLat = Number(origin.latitude);
    const endLng = Number(destination.longitude);
    const endLat = Number(destination.latitude);
    const tollAmount = Number(tolls);

    const values = [startLng, startLat, endLng, endLat];

    if (values.some((value) => !Number.isFinite(value))) {
      setError("Please enter valid coordinates.");
      return;
    }

    if (
      startLng < -180 || startLng > 180 ||
      endLng < -180 || endLng > 180 ||
      startLat < -90 || startLat > 90 ||
      endLat < -90 || endLat > 90
    ) {
      setError("Coordinates are outside the valid range.");
      return;
    }

    if (!Number.isFinite(tollAmount) || tollAmount < 0) {
      setError("Please enter a valid non-negative toll amount.");
      return;
    }

    if (startLng === endLng && startLat === endLat) {
      setError("Pickup and destination cannot be the same.");
      return;
    }

    const key = import.meta.env.VITE_MAPPLS_KEY;

    if (!key) {
      setError("Mappls API key is missing. Check your .env.local file.");
      return;
    }

    setLoading(true);

    try {
      const coordinates =
        `${startLng},${startLat};${endLng},${endLat}`;

      const url =
        `https://route.mappls.com/route/direction/route_eta/driving/${coordinates}` +
        `?steps=false&rtype=0&region=ind&access_token=${encodeURIComponent(key)}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Mappls request failed (${response.status}). Check API access and key restrictions.`
        );
      }

      const data = await response.json();

      if (
        !data.routes ||
        !data.routes.length ||
        !Number.isFinite(data.routes[0].distance) ||
        !Number.isFinite(data.routes[0].duration)
      ) {
        throw new Error("Mappls did not return a valid route.");
      }

      const distanceKm = data.routes[0].distance / 1000;
      const durationMinutes = data.routes[0].duration / 60;

      const routeDetails = {
        distance: distanceKm,
        duration: durationMinutes,
        tollRoad: Boolean(
          data.routes[0].routeClasses?.toll
        ),
      };

      setRoute(routeDetails);
      setFares(calculateAllFares(distanceKm, tollAmount));
    } catch (err) {
      console.error("Route calculation error:", err);
      setError(
        err.message ||
        "Unable to calculate route. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="fare-page">
      <div className="fare-heading">
        <button
          type="button"
          className="fare-back-button"
          onClick={onBack}
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <span className="fare-eyebrow">
          WAYWISE FARE ENGINE
        </span>

        <h1>Compare Travel Fares</h1>

        <p>
          Calculate estimated travel costs across different
          vehicle categories using route distance from Mappls.
        </p>
      </div>

      <div className="fare-layout">
        <div className="fare-left">
          <div className="fare-card">
            <h2>
              <Route size={20} />
              Your Journey
            </h2>

            <p className="fare-help">
              Enter coordinates in longitude, latitude format.
              For example, Gurugram's approximate coordinates are
              77.0266, 28.4595.
            </p>

            <div className="fare-coordinate-group">
              <label>Pickup longitude</label>
              <input
                value={origin.longitude}
                onChange={(event) =>
                  updateCoordinate(
                    setOrigin,
                    "longitude",
                    event.target.value
                  )
                }
                placeholder="e.g. 77.0266"
              />

              <label>Pickup latitude</label>
              <input
                value={origin.latitude}
                onChange={(event) =>
                  updateCoordinate(
                    setOrigin,
                    "latitude",
                    event.target.value
                  )
                }
                placeholder="e.g. 28.4595"
              />
            </div>

            <div className="fare-coordinate-group">
              <label>Destination longitude</label>
              <input
                value={destination.longitude}
                onChange={(event) =>
                  updateCoordinate(
                    setDestination,
                    "longitude",
                    event.target.value
                  )
                }
                placeholder="e.g. 77.0880"
              />

              <label>Destination latitude</label>
              <input
                value={destination.latitude}
                onChange={(event) =>
                  updateCoordinate(
                    setDestination,
                    "latitude",
                    event.target.value
                  )
                }
                placeholder="e.g. 28.4590"
              />
            </div>

            <div className="fare-coordinate-group">
              <label htmlFor="fare-tolls">
                Toll amount (₹)
              </label>

              <input
                id="fare-tolls"
                type="number"
                min="0"
                step="0.01"
                value={tolls}
                onChange={(event) => setTolls(event.target.value)}
              />

              <p className="fare-help">
                Enter the toll amount manually. Mappls route
                classification does not itself confirm the exact
                toll price.
              </p>
            </div>

            {error && (
              <div className="fare-error">
                {error}
              </div>
            )}

            <button
              type="button"
              className="fare-primary-button"
              onClick={calculateRoute}
              disabled={loading}
            >
              <Calculator size={18} />
              {loading ? "Calculating route..." : "Calculate Fares"}
            </button>
          </div>

          <div className="fare-card">
            <h2>
              <MapPin size={20} />
              Map View
            </h2>
            <MapplsMap />
          </div>
        </div>

        <div className="fare-right">
          {route ? (
            <>
              <div className="fare-card route-summary">
                <h2>Route Summary</h2>

                <div className="route-metric">
                  <Route size={19} />
                  <div>
                    <span>Distance</span>
                    <strong>{route.distance.toFixed(2)} km</strong>
                  </div>
                </div>

                <div className="route-metric">
                  <Clock3 size={19} />
                  <div>
                    <span>Estimated duration</span>
                    <strong>
                      {Math.round(route.duration)} minutes
                    </strong>
                  </div>
                </div>

                <div className="route-metric">
                  <IndianRupee size={19} />
                  <div>
                    <span>Toll road classification</span>
                    <strong>
                      {route.tollRoad
                        ? "Toll road detected"
                        : "No toll road flagged"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="fare-card">
                <h2>Vehicle Fare Comparison</h2>

                <p className="fare-help">
                  Select a vehicle to see its fare breakdown.
                </p>

                <div className="fare-vehicle-list">
                  {fares.map((fare) => {
                    const Icon = vehicleIcons[fare.id];
                    const expanded = expandedFare === fare.id;

                    return (
                      <article
                        className="fare-vehicle"
                        key={fare.id}
                      >
                        <button
                          type="button"
                          className="fare-vehicle-button"
                          onClick={() =>
                            setExpandedFare(
                              expanded ? null : fare.id
                            )
                          }
                        >
                          <span className="fare-vehicle-icon">
                            <Icon size={24} />
                          </span>

                          <span className="fare-vehicle-name">
                            <strong>{fare.vehicle}</strong>
                            <small>Estimated trip fare</small>
                          </span>

                          <strong className="fare-vehicle-total">
                            {money(fare.totalFare)}
                          </strong>

                          {expanded
                            ? <ChevronUp size={18} />
                            : <ChevronDown size={18} />}
                        </button>

                        {expanded && (
                          <div className="fare-breakdown">
                            <div>
                              <span>Base fare</span>
                              <strong>{money(fare.baseFare)}</strong>
                            </div>

                            <div>
                              <span>Distance fare</span>
                              <strong>{money(fare.distanceFare)}</strong>
                            </div>

                            <div>
                              <span>Tolls entered</span>
                              <strong>{money(fare.tolls)}</strong>
                            </div>

                            <div className="fare-breakdown-total">
                              <span>Total estimate</span>
                              <strong>{money(fare.totalFare)}</strong>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="fare-card fare-empty">
              <Navigation size={38} />
              <h2>Your fare estimates will appear here</h2>
              <p>
                Enter your pickup and destination coordinates,
                then select Calculate Fares.
              </p>
            </div>
          )}
        </div>
      </div>

      <p className="fare-disclaimer">
        WayWise fare estimates use sample rates for demonstration.
        They are not official fares or live quotes from cab providers.
        Actual fares may vary.
      </p>
    </section>
  );
}