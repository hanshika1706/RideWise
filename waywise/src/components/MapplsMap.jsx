import { useEffect, useRef, useState } from "react";
import { 
  MapPin, Navigation, Layers, Compass, ZoomIn, ZoomOut, 
  Play, Pause, RotateCcw, CarFront, ShieldCheck, Clock, Gauge, AlertCircle
} from "lucide-react";

export default function MapplsMap() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({});
  const polylineRef = useRef(null);
  const trafficPolylinesRef = useRef([]);
  const markersRef = useRef({});
  const carMarkerRef = useRef(null);
  const animFrameRef = useRef(null);

  const [activeLayer, setActiveLayer] = useState("voyager"); // 'voyager', 'streets', 'satellite'
  const [activeLocation, setActiveLocation] = useState("route");
  const [showTraffic, setShowTraffic] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0); // 0 to 1
  const [simSpeed, setSimSpeed] = useState(62); // km/h
  const [currentMilestone, setCurrentMilestone] = useState("At BML Munjal University");

  // Real Key Waypoints along the NH-48 Corridor
  const WAYPOINTS = [
    {
      id: "bmu",
      name: "BML Munjal University",
      subtitle: "Kapriwas, Rewari / Gurugram border",
      badge: "Pickup Hub (Start)",
      badgeColor: "#10b981",
      coords: [28.2472, 76.8142],
      km: "0.0 km",
      eta: "Start Point",
      description: "University main gate pick-up zone, connected directly to NH-48 Service Lane."
    },
    {
      id: "bilaspur",
      name: "Bilaspur Chowk",
      subtitle: "NH-48 Corridor Junction",
      badge: "Highway Junction",
      badgeColor: "#3b82f6",
      coords: [28.2750, 76.8450],
      km: "5.8 km",
      eta: "+7 min",
      description: "Major flyover connecting Pataudi & Tauru roads into the expressway."
    },
    {
      id: "manesar",
      name: "IMT Manesar Hub",
      subtitle: "Industrial & Tech Corridor",
      badge: "Commercial Cluster",
      badgeColor: "#8b5cf6",
      coords: [28.3550, 76.9380],
      km: "15.2 km",
      eta: "+20 min",
      description: "Automobile and manufacturing hub with wide 8-lane expressway access."
    },
    {
      id: "toll",
      name: "Kherki Daula Toll Plaza",
      subtitle: "NH-48 FASTag Toll Barrier",
      badge: "₹80 Toll Checkpoint",
      badgeColor: "#f59e0b",
      coords: [28.4055, 76.9935],
      km: "21.6 km",
      eta: "+28 min",
      description: "100% automated FASTag cashless toll plaza. Cab toll: ₹80 per passage."
    },
    {
      id: "rajiv",
      name: "Rajiv Chowk (Gurugram)",
      subtitle: "Sohna Road & Medanta Exit",
      badge: "City Interchange",
      badgeColor: "#3b82f6",
      coords: [28.4350, 77.0320],
      km: "26.0 km",
      eta: "+34 min",
      description: "Central Gurugram junction offering underpass bypass to bypass inner traffic."
    },
    {
      id: "iffco",
      name: "IFFCO Chowk",
      subtitle: "MG Road & Yellow Line Metro",
      badge: "Metro Hub",
      badgeColor: "#3b82f6",
      coords: [28.4720, 77.0650],
      km: "29.4 km",
      eta: "+39 min",
      description: "Major transit point connecting Delhi Metro Line 2 and Gurgaon city center."
    },
    {
      id: "cyber",
      name: "DLF Cyber City / Cyber Hub",
      subtitle: "DLF Phase 2 / Rapid Metro",
      badge: "IT Tech Park",
      badgeColor: "#06b6d4",
      coords: [28.4950, 77.0890],
      km: "31.1 km",
      eta: "+42 min",
      description: "Premier corporate center with express elevated corridor over the highway."
    },
    {
      id: "ambience",
      name: "Ambience Mall Gurugram",
      subtitle: "NH-48, Delhi-Gurugram Border",
      badge: "Destination Hub (End)",
      badgeColor: "#2563eb",
      coords: [28.5038, 77.0972],
      km: "32.4 km",
      eta: "+45 min",
      description: "Iconic shopping and entertainment destination right next to Delhi Rajokri border."
    }
  ];

  // Full detailed polyline points along the road curves
  const FULL_ROUTE_COORDS = [
    [28.2472, 76.8142],
    [28.2610, 76.8280],
    [28.2750, 76.8450],
    [28.2980, 76.8720],
    [28.3240, 76.9040],
    [28.3550, 76.9380],
    [28.3810, 76.9670],
    [28.4055, 76.9935], // Toll
    [28.4210, 77.0120],
    [28.4350, 77.0320], // Rajiv Chowk
    [28.4550, 77.0510],
    [28.4720, 77.0650], // IFFCO Chowk
    [28.4890, 77.0810],
    [28.4950, 77.0890], // Cyber City
    [28.5038, 77.0972]  // Ambience Mall
  ];

  // Calculate position along route given progress (0 to 1)
  const getPositionAtProgress = (progress) => {
    const totalSegments = FULL_ROUTE_COORDS.length - 1;
    const scaled = Math.max(0, Math.min(1, progress)) * totalSegments;
    const index = Math.floor(scaled);
    const remainder = scaled - index;

    if (index >= totalSegments) return FULL_ROUTE_COORDS[totalSegments];

    const p1 = FULL_ROUTE_COORDS[index];
    const p2 = FULL_ROUTE_COORDS[index + 1];

    const lat = p1[0] + (p2[0] - p1[0]) * remainder;
    const lng = p1[1] + (p2[1] - p1[1]) * remainder;
    return [lat, lng];
  };

  // Determine current active milestone based on progress
  const getMilestoneName = (progress) => {
    if (progress < 0.12) return "Departing BML Munjal University (Kapriwas)";
    if (progress < 0.28) return "Cruising past Bilaspur Flyover";
    if (progress < 0.48) return "Passing IMT Manesar Industrial Hub";
    if (progress < 0.62) return "At Kherki Daula FASTag Toll Plaza (₹80 Paid)";
    if (progress < 0.76) return "Clearing Rajiv Chowk / Medanta Underpass";
    if (progress < 0.88) return "Bypassing IFFCO Chowk Metro Interchange";
    if (progress < 0.98) return "Approaching DLF Cyber City elevated stretch";
    return "Arrived at Ambience Mall, Gurugram! 🎉";
  };

  useEffect(() => {
    let isCancelled = false;

    const loadLeaflet = async () => {
      // 1. Inject Leaflet CSS
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // 2. Inject Leaflet JS
      if (!window.L) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.id = "leaflet-js";
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      if (isCancelled || !mapContainerRef.current) return;

      const L = window.L;

      // Clean up previous instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Center around middle of the corridor
      const map = L.map(mapContainerRef.current, {
        center: [28.3750, 76.9550],
        zoom: 11,
        zoomControl: false,
      });
      mapInstanceRef.current = map;

      // High-performance Open GIS Tile Layers (Zero keys required)
      const voyager = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19
      });

      const streets = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      });

      const satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics',
        maxZoom: 18
      });

      layersRef.current = { voyager, streets, satellite };
      voyager.addTo(map);

      // Main Corridor Route Glow Polyline
      const mainPolyline = L.polyline(FULL_ROUTE_COORDS, {
        color: "#2563eb",
        weight: 6,
        opacity: 0.85,
        lineCap: "round",
        lineJoin: "round"
      }).addTo(map);
      polylineRef.current = mainPolyline;

      // Build Real-Time Highway Traffic Density Segments
      const trafficSegments = [
        { coords: FULL_ROUTE_COORDS.slice(0, 5), color: "#10b981", label: "Smooth (68 km/h)" }, // BMU to Manesar
        { coords: FULL_ROUTE_COORDS.slice(4, 8), color: "#f59e0b", label: "Moderate near Toll (32 km/h)" }, // Manesar to Toll
        { coords: FULL_ROUTE_COORDS.slice(7, 11), color: "#10b981", label: "Smooth Express (62 km/h)" }, // Toll to Rajiv Chowk
        { coords: FULL_ROUTE_COORDS.slice(10, 15), color: "#3b82f6", label: "City Flow (45 km/h)" }, // IFFCO Chowk to Ambience
      ];

      trafficPolylinesRef.current = trafficSegments.map(seg => {
        return L.polyline(seg.coords, {
          color: seg.color,
          weight: 4,
          opacity: 0.9,
          dashArray: "8, 8"
        }).addTo(map);
      });

      // Custom HTML Marker Helper
      const makeMarker = (wp) => {
        const icon = L.divIcon({
          className: "interactive-waypoint-marker",
          html: `
            <div style="
              background: ${wp.badgeColor};
              color: #ffffff;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 3px solid #ffffff;
              box-shadow: 0 4px 14px rgba(0,0,0,0.3);
              font-weight: 800;
              font-size: 13px;
              cursor: pointer;
              transition: transform 0.2s ease;
            ">
              ${wp.id === "bmu" ? "A" : wp.id === "ambience" ? "B" : wp.id === "toll" ? "₹" : "•"}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -18]
        });

        const marker = L.marker(wp.coords, { icon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: inherit; min-width: 210px; padding: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
              <strong style="color: #0f172a; font-size: 14px;">${wp.name}</strong>
              <span style="font-size: 10px; font-weight: 800; background: ${wp.badgeColor}22; color: ${wp.badgeColor}; padding: 2px 6px; border-radius: 8px;">
                ${wp.badge}
              </span>
            </div>
            <p style="color: #64748b; font-size: 12px; margin: 0 0 6px;">${wp.subtitle}</p>
            <p style="color: #334155; font-size: 11px; line-height: 1.4; margin: 0 0 8px;">${wp.description}</p>
            <div style="display: flex; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 6px; font-size: 11px; font-weight: 700; color: #475569;">
              <span>Corridor: ${wp.km}</span>
              <span>ETA: ${wp.eta}</span>
            </div>
          </div>
        `);

        return marker;
      };

      // Add markers for all key waypoints
      WAYPOINTS.forEach(wp => {
        markersRef.current[wp.id] = makeMarker(wp);
      });

      // Create Simulated Live Cab Vehicle Marker
      const cabIcon = L.divIcon({
        className: "simulated-cab-marker",
        html: `
          <div style="
            position: relative;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              position: absolute;
              inset: 2px;
              border-radius: 50%;
              background: rgba(37, 99, 235, 0.25);
              animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              position: relative;
              background: #2563eb;
              color: #ffffff;
              width: 34px;
              height: 34px;
              border-radius: 50%;
              border: 3px solid #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 14px rgba(37, 99, 235, 0.6);
              font-size: 16px;
            ">
              🚖
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const initialPos = FULL_ROUTE_COORDS[0];
      const carMarker = L.marker(initialPos, { icon: cabIcon, zIndexOffset: 1000 }).addTo(map);
      carMarkerRef.current = carMarker;

      // Fit whole route into view with comfortable padding
      map.fitBounds(mainPolyline.getBounds(), { padding: [50, 50] });
    };

    loadLeaflet().catch(err => {
      console.error("Map initialization failed:", err);
    });

    return () => {
      isCancelled = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Animation Loop for Simulated Ride
  useEffect(() => {
    if (!isSimulating) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let lastTimestamp = performance.now();

    const step = (now) => {
      const delta = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      setSimProgress((prev) => {
        // Full route takes ~30 seconds for demo visualization
        const next = prev + (delta / 32);

        if (next >= 1) {
          setIsSimulating(false);
          setSimSpeed(0);
          setCurrentMilestone("Arrived at Ambience Mall, Gurugram! 🎉");
          if (carMarkerRef.current) {
            carMarkerRef.current.setLatLng(FULL_ROUTE_COORDS[FULL_ROUTE_COORDS.length - 1]);
          }
          return 1;
        }

        const newPos = getPositionAtProgress(next);
        if (carMarkerRef.current) {
          carMarkerRef.current.setLatLng(newPos);
        }

        // Adjust speed dynamically based on checkpoint
        let speed = 64;
        if (next >= 0.55 && next <= 0.65) {
          speed = 22; // Slowing down for Toll Plaza
        } else if (next >= 0.85) {
          speed = 46; // City approach
        }
        setSimSpeed(speed);
        setCurrentMilestone(getMilestoneName(next));

        return next;
      });

      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isSimulating]);

  // Handle Layer switching (Voyager, Streets, Satellite)
  const switchLayer = (type) => {
    const map = mapInstanceRef.current;
    if (!map || !layersRef.current[type]) return;

    Object.values(layersRef.current).forEach(layer => {
      if (map.hasLayer(layer)) map.removeLayer(layer);
    });

    layersRef.current[type].addTo(map);
    setActiveLayer(type);
  };

  // Toggle Traffic Heatmap
  const toggleTrafficOverlay = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const nextState = !showTraffic;
    setShowTraffic(nextState);

    trafficPolylinesRef.current.forEach(poly => {
      if (nextState) {
        poly.addTo(map);
      } else {
        map.removeLayer(poly);
      }
    });
  };

  // Fly Camera to Waypoint
  const focusLocation = (wpId) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    setActiveLocation(wpId);

    if (wpId === "route" && polylineRef.current) {
      map.fitBounds(polylineRef.current.getBounds(), { padding: [50, 50] });
    } else {
      const wp = WAYPOINTS.find(w => w.id === wpId);
      if (wp) {
        map.flyTo(wp.coords, 14, { duration: 1.2 });
        if (markersRef.current[wpId]) {
          setTimeout(() => markersRef.current[wpId].openPopup(), 1250);
        }
      }
    }
  };

  // Reset Simulation
  const resetSimulation = () => {
    setIsSimulating(false);
    setSimProgress(0);
    setSimSpeed(0);
    setCurrentMilestone("At BML Munjal University");
    if (carMarkerRef.current) {
      carMarkerRef.current.setLatLng(FULL_ROUTE_COORDS[0]);
    }
    if (polylineRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(polylineRef.current.getBounds(), { padding: [50, 50] });
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "1150px", margin: "0 auto" }}>
      {/* 1. Header Toolbar */}
      <div 
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          padding: "16px 20px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div 
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "#ffffff",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
            }}
          >
            <Compass size={22} />
          </div>
          <div>
            <strong style={{ display: "block", fontSize: "16px", color: "#0f172a", fontWeight: "800" }}>
              Delhi–NCR Highway Corridor (NH-48)
            </strong>
            <span style={{ fontSize: "13px", color: "#64748b" }}>
              BML Munjal University ➔ Ambience Mall, Gurugram (32.4 km · ~45 min)
            </span>
          </div>
        </div>

        {/* Quick Checkpoint Navigation Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <button 
            type="button"
            className="btn"
            style={{
              height: "34px",
              fontSize: "12px",
              borderRadius: "20px",
              background: activeLocation === "route" ? "#2563eb" : "#f1f5f9",
              color: activeLocation === "route" ? "#ffffff" : "#475569",
              border: 0,
              fontWeight: "600"
            }}
            onClick={() => focusLocation("route")}
          >
            Full Corridor
          </button>
          <button 
            type="button"
            className="btn"
            style={{
              height: "34px",
              fontSize: "12px",
              borderRadius: "20px",
              background: activeLocation === "bmu" ? "#10b981" : "#f1f5f9",
              color: activeLocation === "bmu" ? "#ffffff" : "#475569",
              border: 0,
              fontWeight: "600"
            }}
            onClick={() => focusLocation("bmu")}
          >
            🎓 BMU Campus
          </button>
          <button 
            type="button"
            className="btn"
            style={{
              height: "34px",
              fontSize: "12px",
              borderRadius: "20px",
              background: activeLocation === "manesar" ? "#8b5cf6" : "#f1f5f9",
              color: activeLocation === "manesar" ? "#ffffff" : "#475569",
              border: 0,
              fontWeight: "600"
            }}
            onClick={() => focusLocation("manesar")}
          >
            🏭 Manesar
          </button>
          <button 
            type="button"
            className="btn"
            style={{
              height: "34px",
              fontSize: "12px",
              borderRadius: "20px",
              background: activeLocation === "toll" ? "#f59e0b" : "#f1f5f9",
              color: activeLocation === "toll" ? "#ffffff" : "#475569",
              border: 0,
              fontWeight: "600"
            }}
            onClick={() => focusLocation("toll")}
          >
            🛣️ Kherki Daula Toll
          </button>
          <button 
            type="button"
            className="btn"
            style={{
              height: "34px",
              fontSize: "12px",
              borderRadius: "20px",
              background: activeLocation === "cyber" ? "#06b6d4" : "#f1f5f9",
              color: activeLocation === "cyber" ? "#ffffff" : "#475569",
              border: 0,
              fontWeight: "600"
            }}
            onClick={() => focusLocation("cyber")}
          >
            🏢 Cyber City
          </button>
          <button 
            type="button"
            className="btn"
            style={{
              height: "34px",
              fontSize: "12px",
              borderRadius: "20px",
              background: activeLocation === "ambience" ? "#2563eb" : "#f1f5f9",
              color: activeLocation === "ambience" ? "#ffffff" : "#475569",
              border: 0,
              fontWeight: "600"
            }}
            onClick={() => focusLocation("ambience")}
          >
            🛍️ Ambience Mall
          </button>
        </div>
      </div>

      {/* 2. Live Ride Telemetry Bar (Interactive Moving Cab Simulation) */}
      <div 
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
          borderRadius: "16px",
          padding: "16px 20px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          boxShadow: "0 10px 20px -5px rgba(15, 23, 42, 0.25)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div 
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: isSimulating ? "#10b981" : "#3b82f6",
              display: "grid",
              placeItems: "center",
              fontSize: "20px"
            }}
          >
            🚖
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px", color: isSimulating ? "#34d399" : "#94a3b8" }}>
                {isSimulating ? "● LIVE RIDE IN PROGRESS" : simProgress >= 1 ? "● TRIP COMPLETED" : "○ SIMULATION READY"}
              </span>
              <span style={{ fontSize: "11px", color: "#64748b" }}>•</span>
              <span style={{ fontSize: "12px", color: "#cbd5e1" }}>Toyota Etios (DL 01 AB 4291)</span>
            </div>
            <strong style={{ display: "block", fontSize: "15px", marginTop: "2px", color: "#f8fafc" }}>
              {currentMilestone}
            </strong>
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div>
            <span style={{ display: "block", fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" }}>CURRENT SPEED</span>
            <strong style={{ fontSize: "16px", color: "#38bdf8" }}>{isSimulating ? `${simSpeed} km/h` : "--"}</strong>
          </div>
          <div>
            <span style={{ display: "block", fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" }}>REMAINING</span>
            <strong style={{ fontSize: "16px", color: "#f8fafc" }}>
              {(32.4 * (1 - simProgress)).toFixed(1)} km
            </strong>
          </div>
          <div>
            <span style={{ display: "block", fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" }}>EST. TIME</span>
            <strong style={{ fontSize: "16px", color: "#facc15" }}>
              {Math.max(1, Math.round(45 * (1 - simProgress)))} min
            </strong>
          </div>

          {/* Simulation Action Buttons */}
          <div style={{ display: "flex", gap: "8px", marginLeft: "10px" }}>
            <button
              type="button"
              className="btn"
              onClick={() => setIsSimulating(!isSimulating)}
              style={{
                height: "38px",
                padding: "0 16px",
                background: isSimulating ? "#ef4444" : "#10b981",
                color: "#ffffff",
                borderRadius: "10px",
                border: 0,
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer"
              }}
            >
              {isSimulating ? <><Pause size={15} /> Pause</> : <><Play size={15} /> {simProgress > 0 && simProgress < 1 ? "Resume" : "Track Ride"}</>}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={resetSimulation}
              style={{
                height: "38px",
                width: "38px",
                padding: 0,
                display: "grid",
                placeItems: "center",
                borderRadius: "10px",
                color: "#cbd5e1",
                borderColor: "#475569"
              }}
              title="Reset Trip"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Real Interactive Map Canvas */}
      <div 
        style={{
          position: "relative",
          width: "100%",
          height: "580px",
          minHeight: "580px",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid #cbd5e1",
          boxShadow: "0 10px 25px -3px rgba(15, 23, 42, 0.12)"
        }}
      >
        <div 
          ref={mapContainerRef} 
          style={{ width: "100%", height: "100%", background: "#f8fafc" }} 
        />

        {/* Floating Layer Switcher & Traffic Control */}
        <div 
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "8px"
          }}
        >
          <div 
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(8px)",
              padding: "4px",
              borderRadius: "30px",
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
              display: "flex",
              gap: "4px",
              border: "1px solid #e2e8f0"
            }}
          >
            {[
              { id: "voyager", label: "Clean Map" },
              { id: "streets", label: "OpenStreetMap" },
              { id: "satellite", label: "Satellite View" }
            ].map(style => (
              <button
                type="button"
                key={style.id}
                onClick={() => switchLayer(style.id)}
                style={{
                  border: 0,
                  background: activeLayer === style.id ? "#2563eb" : "transparent",
                  color: activeLayer === style.id ? "#ffffff" : "#475569",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                {style.label}
              </button>
            ))}
          </div>

          {/* Traffic Overlay Toggle Button */}
          <button
            type="button"
            onClick={toggleTrafficOverlay}
            style={{
              background: showTraffic ? "#10b981" : "rgba(255, 255, 255, 0.95)",
              color: showTraffic ? "#ffffff" : "#475569",
              border: "1px solid #e2e8f0",
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <span>🚦</span>
            {showTraffic ? "Live Traffic Layer: ON" : "Live Traffic Layer: OFF"}
          </button>
        </div>

        {/* Floating Zoom Controls */}
        <div 
          style={{
            position: "absolute",
            bottom: "24px",
            right: "16px",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}
        >
          <button 
            type="button" 
            style={{
              width: "42px",
              height: "42px",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              color: "#0f172a"
            }}
            onClick={() => mapInstanceRef.current?.zoomIn()}
            title="Zoom in"
          >
            <ZoomIn size={20} />
          </button>
          <button 
            type="button" 
            style={{
              width: "42px",
              height: "42px",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              color: "#0f172a"
            }}
            onClick={() => mapInstanceRef.current?.zoomOut()}
            title="Zoom out"
          >
            <ZoomOut size={20} />
          </button>
        </div>

        {/* Live Map Legend Pill */}
        <div 
          style={{
            position: "absolute",
            bottom: "24px",
            left: "16px",
            zIndex: 1000,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(8px)",
            padding: "8px 16px",
            borderRadius: "30px",
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.12)",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            fontSize: "12px",
            fontWeight: "600",
            color: "#334155",
            border: "1px solid #e2e8f0"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "16px", height: "4px", background: "#2563eb", borderRadius: "4px" }} />
            NH-48 Route
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "10px", height: "10px", background: "#10b981", borderRadius: "50%" }} />
            Pickup
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "10px", height: "10px", background: "#2563eb", borderRadius: "50%" }} />
            Destination
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "10px", height: "10px", background: "#f59e0b", borderRadius: "50%" }} />
            FASTag Toll
          </div>
        </div>
      </div>

      {/* 4. Corridor Milestone Progress Tracker */}
      <div 
        style={{
          marginTop: "16px",
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          padding: "16px 20px",
          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <strong style={{ fontSize: "14px", color: "#0f172a" }}>Route Progress & Checkpoints</strong>
            <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>
              Click any stop to center and inspect live waypoint details
            </span>
          </div>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#2563eb" }}>
            {Math.round(simProgress * 100)}% Traversed
          </span>
        </div>

        {/* Progress bar line */}
        <div style={{ width: "100%", height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden", marginBottom: "14px" }}>
          <div 
            style={{ 
              width: `${Math.max(4, Math.round(simProgress * 100))}%`, 
              height: "100%", 
              background: "linear-gradient(90deg, #2563eb 0%, #10b981 100%)",
              transition: "width 0.3s ease" 
            }} 
          />
        </div>

        {/* Checkpoint Pills */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
          {WAYPOINTS.map((wp, idx) => {
            const isPassed = simProgress >= (idx / (WAYPOINTS.length - 1));
            return (
              <div 
                key={wp.id}
                onClick={() => focusLocation(wp.id)}
                style={{
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: isPassed ? "1px solid #bbf7d0" : "1px solid #f1f5f9",
                  background: isPassed ? "#f0fdf4" : "#ffffff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  transition: "all 0.15s ease"
                }}
              >
                <div 
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: isPassed ? "#10b981" : "#e2e8f0",
                    color: isPassed ? "#ffffff" : "#64748b",
                    fontSize: "11px",
                    fontWeight: "800",
                    display: "grid",
                    placeItems: "center"
                  }}
                >
                  {idx + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ display: "block", fontSize: "12px", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {wp.name}
                  </strong>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                    {wp.km} · {wp.eta}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Summary Metrics Grid */}
      <div 
        style={{
          marginTop: "16px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "14px"
        }}
      >
        <div style={{ background: "#ffffff", padding: "14px 18px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <small style={{ color: "#64748b", textTransform: "uppercase", fontSize: "11px", fontWeight: "700" }}>TOTAL DISTANCE</small>
          <strong style={{ display: "block", fontSize: "18px", color: "#0f172a", marginTop: "2px" }}>32.4 km</strong>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Express corridor via NH-48</span>
        </div>

        <div style={{ background: "#ffffff", padding: "14px 18px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <small style={{ color: "#64748b", textTransform: "uppercase", fontSize: "11px", fontWeight: "700" }}>TRAVEL DURATION</small>
          <strong style={{ display: "block", fontSize: "18px", color: "#2563eb", marginTop: "2px" }}>~45 minutes</strong>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Highway traffic flow</span>
        </div>

        <div style={{ background: "#ffffff", padding: "14px 18px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <small style={{ color: "#64748b", textTransform: "uppercase", fontSize: "11px", fontWeight: "700" }}>TOLL CHECKPOINT</small>
          <strong style={{ display: "block", fontSize: "18px", color: "#d97706", marginTop: "2px" }}>₹80 FASTag</strong>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Kherki Daula Plaza (1 toll)</span>
        </div>

        <div style={{ background: "#ffffff", padding: "14px 18px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <small style={{ color: "#64748b", textTransform: "uppercase", fontSize: "11px", fontWeight: "700" }}>MAP PLATFORM</small>
          <strong style={{ display: "block", fontSize: "18px", color: "#10b981", marginTop: "2px" }}>100% Free GIS</strong>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Leaflet + OpenStreetMap</span>
        </div>
      </div>
    </div>
  );
}
