import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, ZoomIn, ZoomOut, Layers, ExternalLink, Info } from "lucide-react";

export default function MapplsMap() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [hasKey, setHasKey] = useState(false);
  const [error, setError] = useState("");
  const [zoomLevel, setZoomLevel] = useState(12);
  const [mapStyle, setMapStyle] = useState("Standard");

  useEffect(() => {
    const key = import.meta.env.VITE_MAPPLS_KEY;

    if (!key) {
      setHasKey(false);
      return;
    }

    setHasKey(true);
    let cancelled = false;

    function initializeMap() {
      if (cancelled || !mapRef.current) return;

      if (!window.mappls?.Map) {
        setError("Mappls SDK did not initialize.");
        return;
      }

      try {
        console.log("Initializing Mappls map...");
        mapInstance.current = new window.mappls.Map("mappls-map", {
          center: [28.4595, 77.0266],
          zoom: 12,
        });
        console.log("Mappls map initialized.");
      } catch (err) {
        console.error("Mappls initialization failed:", err);
        setError(err.message || "Map initialization failed.");
      }
    }

    const existingScript = document.querySelector('script[data-mappls-sdk="true"]');

    if (existingScript) {
      if (window.mappls?.Map) {
        initializeMap();
      } else {
        existingScript.addEventListener("load", initializeMap, { once: true });
      }
    } else {
      const script = document.createElement("script");
      script.dataset.mapplsSdk = "true";
      script.src = `https://sdk.mappls.com/map/sdk/web?v=3.0&access_token=${encodeURIComponent(key)}`;
      script.async = true;
      script.onload = initializeMap;
      script.onerror = () => {
        setError("Failed to download Mappls SDK.");
      };
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (mapInstance.current?.remove) {
        mapInstance.current.remove();
      }
      mapInstance.current = null;
    };
  }, []);

  return (
    <div style={{ width: "100%", maxWidth: "1150px", margin: "0 auto" }}>
      {/* Information Header */}
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
          gap: "12px",
          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div 
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "#dbeafe",
              color: "#2563eb",
              display: "grid",
              placeItems: "center"
            }}
          >
            <MapPin size={20} />
          </div>
          <div>
            <strong style={{ display: "block", fontSize: "15px", color: "#0f172a" }}>
              Delhi NCR Highway Corridor (NH-48)
            </strong>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              BML Munjal University (Rewari) ➔ Ambience Mall (Gurugram)
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span 
            style={{
              fontSize: "12px",
              fontWeight: "700",
              padding: "4px 10px",
              borderRadius: "20px",
              background: hasKey ? "#ecfdf5" : "#eff6ff",
              color: hasKey ? "#059669" : "#2563eb",
              border: hasKey ? "1px solid #a7f3d0" : "1px solid #bfdbfe"
            }}
          >
            {hasKey ? "● Mappls SDK Active" : "● Interactive Live Simulation"}
          </span>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div
        id="mappls-map"
        ref={mapRef}
        style={{
          width: "100%",
          height: "560px",
          minHeight: "560px",
          backgroundColor: "#e2e8f0",
          border: "1px solid #cbd5e1",
          borderRadius: "16px",
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 10px 25px -3px rgba(15, 23, 42, 0.1)"
        }}
      >
        {/* Fallback interactive simulation if Mappls key is not present */}
        {!hasKey && (
          <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <svg 
              style={{ width: "100%", height: "100%", background: mapStyle === "Satellite" ? "#1e293b" : "#e2e8f0" }} 
              viewBox="0 0 900 560" 
              preserveAspectRatio="none"
            >
              {/* Roads network grid */}
              <g stroke={mapStyle === "Satellite" ? "#334155" : "#cbd5e1"} strokeWidth="10" fill="none">
                <path d="M-50 120 L950 360" />
                <path d="M-50 420 L950 100" />
                <path d="M150 -50 L350 600" />
                <path d="M450 -50 L580 600" />
                <path d="M750 -50 L650 600" />
                <path d="M-50 260 L950 260" />
              </g>

              {/* Highway NH-48 Glowing Route */}
              <path 
                d="M120 400 C 260 360, 360 220, 520 260 S 740 340, 800 130" 
                stroke="#3b82f6" 
                strokeWidth="8" 
                strokeLinecap="round" 
                fill="none" 
                filter="drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))"
              />
              <path 
                d="M120 400 C 260 360, 360 220, 520 260 S 740 340, 800 130" 
                stroke="#ffffff" 
                strokeWidth="2.5" 
                strokeDasharray="6 6" 
                fill="none"
              />
            </svg>

            {/* Origin Pin */}
            <div 
              style={{
                position: "absolute",
                left: "14%",
                bottom: "26%",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#ffffff",
                padding: "8px 14px",
                borderRadius: "30px",
                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
                border: "2px solid #10b981",
                fontSize: "13px",
                fontWeight: "700",
                color: "#0f172a"
              }}
            >
              <div 
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "#ecfdf5",
                  color: "#10b981",
                  display: "grid",
                  placeItems: "center"
                }}
              >
                <MapPin size={14} />
              </div>
              BML Munjal University
            </div>

            {/* Destination Pin */}
            <div 
              style={{
                position: "absolute",
                right: "12%",
                top: "20%",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#ffffff",
                padding: "8px 14px",
                borderRadius: "30px",
                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
                border: "2px solid #2563eb",
                fontSize: "13px",
                fontWeight: "700",
                color: "#0f172a"
              }}
            >
              <div 
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "#dbeafe",
                  color: "#2563eb",
                  display: "grid",
                  placeItems: "center"
                }}
              >
                <Navigation size={14} />
              </div>
              Ambience Mall, Gurugram
            </div>

            {/* Kherki Daula Toll Booth Marker */}
            <div 
              style={{
                position: "absolute",
                left: "56%",
                top: "46%",
                background: "#ffffff",
                border: "1px solid #f59e0b",
                borderRadius: "8px",
                padding: "5px 10px",
                fontSize: "11px",
                fontWeight: "700",
                color: "#b45309",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)"
              }}
            >
              🛣️ Kherki Daula Toll Plaza (₹80)
            </div>

            {/* Floating Map Controls */}
            <div 
              style={{
                position: "absolute",
                right: "20px",
                bottom: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}
            >
              <button 
                type="button" 
                style={{
                  width: "40px",
                  height: "40px",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer"
                }}
                onClick={() => setZoomLevel(z => Math.min(z + 1, 18))}
                title="Zoom In"
              >
                <ZoomIn size={18} />
              </button>
              <button 
                type="button" 
                style={{
                  width: "40px",
                  height: "40px",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer"
                }}
                onClick={() => setZoomLevel(z => Math.max(z - 1, 6))}
                title="Zoom Out"
              >
                <ZoomOut size={18} />
              </button>
            </div>

            {/* Map Style Selector Pills */}
            <div 
              style={{
                position: "absolute",
                left: "20px",
                bottom: "20px",
                display: "flex",
                gap: "8px",
                background: "rgba(255, 255, 255, 0.95)",
                padding: "6px 10px",
                borderRadius: "30px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e2e8f0"
              }}
            >
              {["Standard", "Satellite", "Terrain"].map(style => (
                <button
                  type="button"
                  key={style}
                  onClick={() => setMapStyle(style)}
                  style={{
                    border: 0,
                    background: mapStyle === style ? "#2563eb" : "transparent",
                    color: mapStyle === style ? "#ffffff" : "#475569",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Note about API key */}
      <div 
        style={{
          marginTop: "14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "12px",
          color: "#64748b"
        }}
      >
        <Info size={15} style={{ color: "#2563eb", flexShrink: 0 }} />
        <span>
          To connect live satellite tiles directly from Mappls, provide your access key as <code>VITE_MAPPLS_KEY=your_key</code> in <code>.env</code>.
        </span>
      </div>
    </div>
  );
}
