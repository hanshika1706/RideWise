import { useEffect, useRef } from "react";

export default function RouteMap({ selectedRoute = 1, origin = "BML Munjal University", destination = "Ambience Mall", height = "340px" }) {
  const containerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polylineRef = useRef(null);

  // Highway Route Coordinates
  const BMU_COORDS = [28.2472, 76.8142];
  const AMBIENCE_COORDS = [28.5038, 77.0972];
  const TOLL_COORDS = [28.4055, 76.9935];

  const ROUTES_DATA = {
    1: {
      name: "Route A via NH-48 Express",
      color: "#2563eb",
      toll: "₹80 FASTag",
      time: "45 min",
      dist: "32 km",
      points: [
        BMU_COORDS,
        [28.2750, 76.8450],
        [28.3550, 76.9380], // Manesar
        TOLL_COORDS,        // Kherki Daula
        [28.4350, 77.0320], // Rajiv Chowk
        [28.4720, 77.0650], // IFFCO Chowk
        AMBIENCE_COORDS
      ]
    },
    2: {
      name: "Route B via Old Delhi Road",
      color: "#10b981",
      toll: "Toll-Free (₹0)",
      time: "58 min",
      dist: "28 km",
      points: [
        BMU_COORDS,
        [28.2910, 76.8380],
        [28.3450, 76.8920],
        [28.3980, 76.9610],
        [28.4480, 77.0210],
        [28.4820, 77.0650],
        AMBIENCE_COORDS
      ]
    },
    3: {
      name: "Route C via Cyber City Flyover",
      color: "#8b5cf6",
      toll: "₹50 Toll",
      time: "50 min",
      dist: "30 km",
      points: [
        BMU_COORDS,
        [28.3100, 76.8820],
        [28.3820, 76.9680],
        [28.4350, 77.0320],
        [28.4950, 77.0890], // Cyber City Flyover
        AMBIENCE_COORDS
      ]
    }
  };

  const activeRoute = ROUTES_DATA[selectedRoute] || ROUTES_DATA[1];

  useEffect(() => {
    let isCancelled = false;

    const initMap = async () => {
      // Ensure Leaflet CSS
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // Ensure Leaflet JS
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

      if (isCancelled || !containerRef.current) return;
      const L = window.L;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize clean, static route preview map
      const map = L.map(containerRef.current, {
        center: [28.3750, 76.9550],
        zoom: 11,
        zoomControl: false,
        attributionControl: false
      });
      mapInstanceRef.current = map;

      // 100% Free, Zero Key, No Watermark Esri World Street Map
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 18
      }).addTo(map);

      // Custom Pickup & Drop Markers
      const startIcon = L.divIcon({
        className: "route-marker-pin",
        html: `
          <div style="
            background: #10b981;
            color: #ffffff;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.25);
            font-weight: 800;
            font-size: 12px;
          ">
            A
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const endIcon = L.divIcon({
        className: "route-marker-pin",
        html: `
          <div style="
            background: #2563eb;
            color: #ffffff;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.25);
            font-weight: 800;
            font-size: 12px;
          ">
            B
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const tollIcon = L.divIcon({
        className: "route-marker-pin",
        html: `
          <div style="
            background: #f59e0b;
            color: #ffffff;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            font-weight: 800;
            font-size: 11px;
          ">
            ₹
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      // Add Start & End Markers
      L.marker(BMU_COORDS, { icon: startIcon }).addTo(map).bindPopup(`<b>${origin}</b><br><small>Pickup Hub</small>`);
      L.marker(AMBIENCE_COORDS, { icon: endIcon }).addTo(map).bindPopup(`<b>${destination}</b><br><small>Destination</small>`);

      // Add Toll Marker if on toll route
      if (selectedRoute === 1) {
        L.marker(TOLL_COORDS, { icon: tollIcon }).addTo(map).bindPopup(`<b>Kherki Daula Toll</b><br><small>₹80 FASTag</small>`);
      }

      // Draw active route polyline
      const polyline = L.polyline(activeRoute.points, {
        color: activeRoute.color,
        weight: 5,
        opacity: 0.9,
        lineCap: "round",
        lineJoin: "round"
      }).addTo(map);
      polylineRef.current = polyline;

      // Fit bounds to display the entire corridor cleanly
      map.fitBounds(polyline.getBounds(), { padding: [30, 30] });
    };

    initMap().catch(err => console.error("Route map init failed:", err));

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [selectedRoute, origin, destination]);

  return (
    <div 
      style={{ 
        position: "relative", 
        width: "100%", 
        height: height, 
        borderRadius: "14px", 
        overflow: "hidden", 
        border: "1px solid #cbd5e1",
        background: "#f1f5f9"
      }}
    >
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* Floating Route Info Badge */}
      <div 
        style={{
          position: "absolute",
          bottom: "12px",
          left: "12px",
          right: "12px",
          zIndex: 900,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(6px)",
          padding: "8px 14px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.12)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          border: "1px solid #e2e8f0",
          fontSize: "12px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span 
            style={{ 
              width: "10px", 
              height: "10px", 
              borderRadius: "50%", 
              background: activeRoute.color 
            }} 
          />
          <strong style={{ color: "#0f172a" }}>{activeRoute.name}</strong>
        </div>
        <div style={{ color: "#475569", fontWeight: "600" }}>
          <span>{activeRoute.dist} · {activeRoute.time}</span>
          <span style={{ marginLeft: "8px", color: selectedRoute === 2 ? "#10b981" : "#d97706" }}>
            ({activeRoute.toll})
          </span>
        </div>
      </div>
    </div>
  );
}

