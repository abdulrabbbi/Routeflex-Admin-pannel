import { useEffect, useState } from "react";

declare global {
  interface Window {
    google?: any;
  }
}

let loaderPromise: Promise<any> | null = null;

function loadGoogleMaps(apiKey: string) {
  if (window.google && window.google.maps) return Promise.resolve(window.google);
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });

  return loaderPromise;
}

export default function useGoogleMaps(apiKey?: string | null) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!apiKey) return;
    let mounted = true;
    loadGoogleMaps(apiKey)
      .then(() => mounted && setReady(true))
      .catch((e) => mounted && setError(e));
    return () => {
      mounted = false;
    };
  }, [apiKey]);

  return { ready, error };
}

