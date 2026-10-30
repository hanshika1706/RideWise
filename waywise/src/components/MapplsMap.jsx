import { useEffect, useRef, useState } from "react";

export default function MapplsMap() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const key = import.meta.env.VITE_MAPPLS_KEY;

    if (!key) {
      setError("Mappls API key missing.");
      return;
    }

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

    const existingScript = document.querySelector(
      'script[data-mappls-sdk="true"]'
    );

    if (existingScript) {
      if (window.mappls?.Map) {
        initializeMap();
      } else {
        existingScript.addEventListener("load", initializeMap, {
          once: true,
        });
      }
    } else {
      const script = document.createElement("script");

      script.dataset.mapplsSdk = "true";
      script.src =
        `https://sdk.mappls.com/map/sdk/web?v=3.0&access_token=${encodeURIComponent(key)}`;

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
    <div style={{ width: "100%" }}>
      {error && (
        <p style={{ color: "red", padding: "12px" }}>
          {error}
        </p>
      )}

      <div
  id="mappls-map"
  ref={mapRef}
  style={{
    width: "100%",
    height: "500px",
          minHeight: "500px",
          backgroundColor: "#dce6ee",
          border: "2px solid #94a3b8",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      />
    </div>
  );
}