import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Layers, Compass, ZoomIn, ZoomOut, ShieldCheck, ExternalLink, RefreshCw } from "lucide-react";

export default function MapplsMap() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({});
  const polylineRef = useRef(null);

  const [activeLayer, setActiveLayer] = useState("voyager"); // 'voyager', 'streets', 'satellite'
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeLocation, setActiveLocation] = useState("route");

  // Real coordinates for the corridor
  const BMU_COORDS = [28.2472, 76.8142]; // BML Munjal University, Kapriwas
  const TOLL_COORDS = [28.4055, 76.9935]; // Kherki Daula Toll Plaza
  const AMBIENCE_COORDS = [28.5038, 77.0972]; // Ambience Mall, Gurugram

  // Realistic highway coordinates route along NH-48
  const ROUTE_POINTS = [
    BMU_COORDS,
    [28.2650, 76.8320],
    [28.2950, 76.8650],
    [28.3280, 76.9020],
    [28.3550, 76.9380], // Manesar
    TOLL_COORDS,        // Kherki Daula Toll
    [28.4350, 77.0320], // Rajiv Chowk Gurugram
    [28.4720, 77.0650], // IFFCO Chowk
    [28.4950, 77.0890], // Cyber City
    AMBIENCE_COORDS     // Ambience Mall
  ];

  useEffect(() => {
    let isCancelled = false;

    // Dynamically inject Leaflet CSS & JS
    const loadLeaflet = async () => {
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

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

      // Clean up previous instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize map centered between BMU and Ambience Mall
      const map = L.map(mapContainerRef.current, {
        center: [28.3750, 76.9550],
        zoom: 11,
        zoomControl: false,
      });
      mapInstanceRef.current = map;

      // Define real tile layers (100% Free, Zero API Keys required)
      const voyager = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19
      });

      const streets = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      });

      const satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, USGS, NOAA',
        maxZoom: 18
      });

      layersRef.current = { voyager, streets, satellite };
      voyager.addTo(map);

      // Custom marker icon helper
      const createIcon = (color, label) => L.divIcon({
        className: "custom-map-marker",
        html: `
          <div style="
            background: ${color};
            color: #ffffff;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-weight: bold;
            font-size: 13px;
          ">
            ${label}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      // 1. BMU Marker
      const bmuMarker = L.marker(BMU_COORDS, { icon: createIcon("#10b981", "A") }).addTo(map);
      bmuMarker.bindPopup(`
        <div style="font-family: inherit; padding: 4px;">
          <strong style="color: #065f46; font-size: 14px; display: block; margin-bottom: 2px;">BML Munjal University</strong>
          <span style="color: #64748b; font-size: 12px; display: block;">Kapriwas, Rewari / Gurugram</span>
          <span style="display: inline-block; background: #ecfdf5; color: #047857; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 12px; margin-top: 6px;">
            Pickup Hub
          </span>
        </div>
      `);

      // 2. Ambience Mall Marker
      const ambienceMarker = L.marker(AMBIENCE_COORDS, { icon: createIcon("#2563eb", "B") }).addTo(map);
      ambienceMarker.bindPopup(`
        <div style="font-family: inherit; padding: 4px;">
          <strong style="color: #1e40af; font-size: 14px; display: block; margin-bottom: 2px;">Ambience Mall</strong>
          <span style="color: #64748b; font-size: 12px; display: block;">NH-8, DLF Phase 3, Gurugram</span>
          <span style="display: inline-block; background: #eff6ff; color: #1d4ed8; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 12px; margin-top: 6px;">
            Destination Hub
          </span>
        </div>
      `);

      // 3. Toll Plaza Marker
      const tollMarker = L.marker(TOLL_COORDS, { icon: createIcon("#f59e0b", "₹") }).addTo(map);
      tollMarker.bindPopup(`
        <div style="font-family: inherit; padding: 4px;">
          <strong style="color: #92400e; font-size: 13px; display: block; margin-bottom: 2px;">Kherki Daula Toll Plaza</strong>
          <span style="color: #64748b; font-size: 11px; display: block;">NH-48 FASTag automated toll plaza</span>
          <strong style="color: #b45309; font-size: 12px; display: block; margin-top: 4px;">Car / Cab Toll: ₹80</strong>
        </div>
      `);

      // 4. Glowing Blue Route Polyline
      const routePolyline = L.polyline(ROUTE_POINTS, {
        color: "#2563eb",
        weight: 6,
        opacity: 0.85,
        lineCap: "round",
        lineJoin: "round"
      }).addTo(map);
      polylineRef.current = routePolyline;

      // Fit map view to encompass the entire journey
      map.fitBounds(routePolyline.getBounds(), { padding: [50, 50] });

      setMapLoaded(true);
    };

    loadLeaflet().catch(err => {
      console.error("Leaflet load error:", err);
    });

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Map Style switching (Voyager, Streets, Satellite)
  const switchLayer = (type) => {
    const map = mapInstanceRef.current;
    if (!map || !layersRef.current[type]) return;

    Object.values(layersRef.current).forEach(layer => {
      if (map.hasLayer(layer)) map.removeLayer(layer);
    });

    layersRef.current[type].addTo(map);
    setActiveLayer(type);
  };

  // Focus Navigation
  const focusLocation = (loc) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    setActiveLocation(loc);

    if (loc === "route" && polylineRef.current) {
      map.fitBounds(polylineRef.current.getBounds(), { padding: [50, 50] });
    } else if (loc === "bmu") {
      map.flyTo(BMU_COORDS, 14, { duration: 1.2 });
    } else if (loc === "ambience") {
      map.flyTo(AMBIENCE_COORDS, 14, { duration: 1.2 });
    } else if (loc === "toll") {
      map.flyTo(TOLL_COORDS, 15, { duration: 1.2 });
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "1150px", margin: "0 auto" }}>
      {/* Route & Status Header Bar */}
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
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "#ffffff",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)"
            }}
          >
            <Compass size={22} />
          </div>
          <div>
            <strong style={{ display: "block", fontSize: "16px", color: "#0f172a", fontWeight: "800" }}>
              Delhi–NCR Highway Corridor (NH-48)
            </strong>
            <span style={{ fontSize: "13px", color: "#64748b" }}>
              BML Munjal University ➔ Ambience Mall, Gurugram (32 km · ~45 min)
            </span>
          </div>
        </div>

        {/* Quick Hub Navigation Pills */}
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
              border: 0
            }}
            onClick={() => focusLocation("route")}
          >
            Full Route
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
              border: 0
            }}
            onClick={() => focusLocation("bmu")}
          >
            📍 BMU Campus
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
              border: 0
            }}
            onClick={() => focusLocation("ambience")}
          >
            📍 Ambience Mall
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
              border: 0
            }}
            onClick={() => focusLocation("toll")}
          >
            🛣️ Kherki Daula Toll
          </button>
        </div>
      </div>

      {/* Real Live Map Container */}
      <div 
        style={{
          position: "relative",
          width: "100%",
          height: "560px",
          minHeight: "560px",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid #cbd5e1",
          boxShadow: "0 10px 25px -3px rgba(15, 23, 42, 0.1)"
        }}
      >
        <div 
          ref={mapContainerRef} 
          style={{ width: "100%", height: "100%", background: "#f8fafc" }} 
        />

        {/* Floating Layer Switcher (Streets, Satellite, Voyager) */}
        <div 
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            zIndex: 1000,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(6px)",
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
            backdropFilter: "blur(6px)",
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
            NH-48 Express Route
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "10px", height: "10px", background: "#10b981", borderRadius: "50%" }} />
            Pickup
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "10px", height: "10px", background: "#2563eb", borderRadius: "50%" }} />
            Destination
          </div>
        </div>
      </div>

      {/* Corridor Summary Metrics */}
      <div 
        style={{
          marginTop: "16px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "14px"
        }}
      >
        <div style={{ background: "#ffffff", padding: "14px 18px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <small style={{ color: "#64748b", textTransform: "uppercase", fontSize: "11px", fontWeight: "700" }}>TOTAL DISTANCE</small>
          <strong style={{ display: "block", fontSize: "18px", color: "#0f172a", marginTop: "2px" }}>32.4 km</strong>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Via NH-48 Express Highway</span>
        </div>

        <div style={{ background: "#ffffff", padding: "14px 18px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <small style={{ color: "#64748b", textTransform: "uppercase", fontSize: "11px", fontWeight: "700" }}>TRAVEL DURATION</small>
          <strong style={{ display: "block", fontSize: "18px", color: "#2563eb", marginTop: "2px" }}>~45 minutes</strong>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Moderate highway traffic</span>
        </div>

        <div style={{ background: "#ffffff", padding: "14px 18px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <small style={{ color: "#64748b", textTransform: "uppercase", fontSize: "11px", fontWeight: "700" }}>TOLL CHECKPOINT</small>
          <strong style={{ display: "block", fontSize: "18px", color: "#d97706", marginTop: "2px" }}>₹80 FASTag</strong>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Kherki Daula Plaza (1 toll)</span>
        </div>
      </div>
    </div>
  );
}
