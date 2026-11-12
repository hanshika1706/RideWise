import { useEffect, useRef } from "react";

export default function RouteMap({ 
  selectedRoute = 1, 
  onSelectRoute, 
  origin = "BML Munjal University", 
  destination = "Ambience Mall", 
  height = "420px" 
}) {
  const containerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routesLayerRef = useRef(null);

  // Highway Route Coordinates
  const BMU_COORDS = [28.2472, 76.8142];
  const AMBIENCE_COORDS = [28.5038, 77.0972];
  const TOLL_COORDS = [28.4055, 76.9935];

  const ALL_ROUTES = [
    {
      id: 1,
      name: "Via NH-48 Express (Fastest)",
      tag: "45 min · 32 km",
      time: "45 min",
      dist: "32 km",
      toll: "₹80 FASTag",
      badgePoint: [28.3550, 76.9380], // Manesar highway stretch
      points: [
        BMU_COORDS,
        [28.2610, 76.8280],
        [28.2750, 76.8450],
        [28.3100, 76.8850],
        [28.3550, 76.9380], // Manesar
        [28.3850, 76.9700],
        TOLL_COORDS,        // Kherki Daula
        [28.4350, 77.0320], // Rajiv Chowk
        [28.4720, 77.0650], // IFFCO Chowk
        AMBIENCE_COORDS
      ]
    },
    {
      id: 2,
      name: "Via Old Delhi Road (Toll-Free)",
      tag: "58 min · 28 km",
      time: "58 min",
      dist: "28 km",
      toll: "Free (₹0)",
      badgePoint: [28.3950, 76.9200], // Old road western bypass
      points: [
        BMU_COORDS,
        [28.2850, 76.8320],
        [28.3320, 76.8750],
        [28.3750, 76.9120],
        [28.4200, 76.9700],
        [28.4550, 77.0150],
        [28.4850, 77.0620],
        AMBIENCE_COORDS
      ]
    },
    {
      id: 3,
      name: "Via Cyber City Flyover (Scenic)",
      tag: "50 min · 30 km",
      time: "50 min",
      dist: "30 km",
      toll: "₹50 Toll",
      badgePoint: [28.4650, 77.0580], // Cyber City elevated
      points: [
        BMU_COORDS,
        [28.2950, 76.8650],
        [28.3600, 76.9450],
        [28.4100, 77.0050],
        [28.4450, 77.0420],
        [28.4850, 77.0780],
        AMBIENCE_COORDS
      ]
    }
  ];

  // 1. Initialize Map ONCE
  useEffect(() => {
    let isCancelled = false;

    const setupMap = async () => {
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

      if (!mapInstanceRef.current) {
        if (containerRef.current._leaflet_id) {
          containerRef.current._leaflet_id = null;
        }

        const map = L.map(containerRef.current, {
          center: [28.3750, 76.9550],
          zoom: 11,
          zoomControl: false,
          attributionControl: false
        });

        // Fast, 100% free Esri World Street tiles (no watermark, no api keys required)
        L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
          maxZoom: 18
        }).addTo(map);

        routesLayerRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;

        setTimeout(() => {
          if (!isCancelled && mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 200);

        // Initial render of routes
        renderRoutes(map, routesLayerRef.current, L);
      }
    };

    setupMap().catch(err => console.error("Map initialization failed:", err));

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        routesLayerRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current._leaflet_id = null;
      }
    };
  }, []);

  // 2. Render / Update Routes whenever selection changes (smooth, NO map teardown)
  const renderRoutes = (map, layerGroup, L) => {
    if (!map || !layerGroup || !L) return;
    layerGroup.clearLayers();

    const allBounds = L.latLngBounds([]);

    // Draw Inactive Routes First (so active route appears on top)
    ALL_ROUTES.forEach(route => {
      const isSelected = selectedRoute === route.id;
      if (!isSelected) {
        const polyline = L.polyline(route.points, {
          color: "#94a3b8",
          weight: 5,
          opacity: 0.7,
          dashArray: "6, 6",
          lineCap: "round",
          lineJoin: "round"
        }).addTo(layerGroup);

        polyline.on("click", () => {
          if (onSelectRoute) onSelectRoute(route.id);
        });

        // Clickable Pill Badge for Inactive Route
        const badgeIcon = L.divIcon({
          className: "route-alt-badge",
          html: `
            <div style="
              background: #ffffff;
              color: #475569;
              border: 1.5px solid #cbd5e1;
              border-radius: 14px;
              padding: 3px 8px;
              font-size: 11px;
              font-weight: 700;
              white-space: nowrap;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 4px;
              transition: transform 0.15s ease;
            ">
              🚗 ${route.time}
            </div>
          `,
          iconSize: [80, 24],
          iconAnchor: [40, 12]
        });

        const badgeMarker = L.marker(route.badgePoint, { icon: badgeIcon }).addTo(layerGroup);
        badgeMarker.on("click", () => {
          if (onSelectRoute) onSelectRoute(route.id);
        });

        allBounds.extend(polyline.getBounds());
      }
    });

    // Draw Active Selected Route (Bold Blue)
    const activeObj = ALL_ROUTES.find(r => r.id === selectedRoute) || ALL_ROUTES[0];
    const activePolyline = L.polyline(activeObj.points, {
      color: "#2563eb",
      weight: 6,
      opacity: 0.95,
      lineCap: "round",
      lineJoin: "round"
    }).addTo(layerGroup);

    // Active Route Duration Pill (Matching Mappls)
    const activeBadgeIcon = L.divIcon({
      className: "route-active-badge",
      html: `
        <div style="
          background: #2563eb;
          color: #ffffff;
          border: 2px solid #ffffff;
          border-radius: 16px;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
          box-shadow: 0 4px 14px rgba(37,99,235,0.4);
          display: flex;
          align-items: center;
          gap: 5px;
        ">
          🚗 ${activeObj.time} · ${activeObj.dist}
        </div>
      `,
      iconSize: [110, 26],
      iconAnchor: [55, 13]
    });

    L.marker(activeObj.badgePoint, { icon: activeBadgeIcon, zIndexOffset: 500 }).addTo(layerGroup);
    allBounds.extend(activePolyline.getBounds());

    // Start Marker (Green Pin A)
    const startIcon = L.divIcon({
      className: "route-start-pin",
      html: `
        <div style="
          background: #10b981;
          color: #ffffff;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          font-weight: 800;
          font-size: 13px;
        ">
          A
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
    L.marker(BMU_COORDS, { icon: startIcon, zIndexOffset: 600 })
      .addTo(layerGroup)
      .bindPopup(`<b>${origin}</b><br><small>Pickup Location</small>`);

    // Destination Marker (Red Pin B)
    const endIcon = L.divIcon({
      className: "route-end-pin",
      html: `
        <div style="
          background: #ef4444;
          color: #ffffff;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          font-weight: 800;
          font-size: 13px;
        ">
          B
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
    L.marker(AMBIENCE_COORDS, { icon: endIcon, zIndexOffset: 600 })
      .addTo(layerGroup)
      .bindPopup(`<b>${destination}</b><br><small>Destination Hub</small>`);

    // Toll Plaza Marker (on Route 1)
    if (selectedRoute === 1) {
      const tollIcon = L.divIcon({
        className: "route-toll-pin",
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
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            font-weight: 800;
            font-size: 11px;
          ">
            ₹
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      L.marker(TOLL_COORDS, { icon: tollIcon, zIndexOffset: 400 })
        .addTo(layerGroup)
        .bindPopup(`<b>Kherki Daula Toll Plaza</b><br><small>₹80 FASTag</small>`);
    }

    if (allBounds.isValid()) {
      map.fitBounds(allBounds, { padding: [35, 35] });
    }
  };

  // Re-render routes cleanly when props update without tearing down the Leaflet map
  useEffect(() => {
    if (mapInstanceRef.current && routesLayerRef.current && window.L) {
      renderRoutes(mapInstanceRef.current, routesLayerRef.current, window.L);
    }
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

      {/* Floating Alternative Route Switcher Bar (Matching Mappls UX) */}
      <div 
        style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          zIndex: 900,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(6px)",
          padding: "4px 8px",
          borderRadius: "20px",
          boxShadow: "0 2px 10px rgba(15, 23, 42, 0.12)",
          display: "flex",
          gap: "6px",
          border: "1px solid #e2e8f0"
        }}
      >
        {ALL_ROUTES.map(r => (
          <button
            key={r.id}
            type="button"
            onClick={() => onSelectRoute && onSelectRoute(r.id)}
            style={{
              border: 0,
              background: selectedRoute === r.id ? "#2563eb" : "transparent",
              color: selectedRoute === r.id ? "#ffffff" : "#475569",
              padding: "4px 10px",
              borderRadius: "14px",
              fontSize: "11px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            {r.id === 1 ? "Route 1 (NH-48)" : r.id === 2 ? "Route 2 (Toll-Free)" : "Route 3 (Flyover)"}
          </button>
        ))}
      </div>

      {/* Corridor Legend Pill */}
      <div 
        style={{
          position: "absolute",
          bottom: "12px",
          right: "12px",
          zIndex: 900,
          background: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(6px)",
          padding: "6px 12px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          fontSize: "11px",
          color: "#475569",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ width: "12px", height: "4px", background: "#2563eb", borderRadius: "2px" }} />
          <b>Selected</b>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ width: "12px", height: "3px", background: "#94a3b8", borderRadius: "2px" }} />
          Alternative
        </span>
      </div>
    </div>
  );
}
