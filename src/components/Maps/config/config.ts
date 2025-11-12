// Resolve Google Maps key across common env styles (Next.js, Vite, CRA)
function resolvePublicMapsKey(): string {
  try {
    // Next.js (build-time injected)
    const next = (typeof process !== "undefined" && (process as any).env?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) ||
      (typeof import.meta !== "undefined" && (import.meta as any).env?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
    if (next) return String(next);

    // Vite
    const vite = typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;
    if (vite) return String(vite);

    // CRA
    const cra = typeof process !== "undefined" && (process as any).env?.REACT_APP_GOOGLE_MAPS_API_KEY;
    if (cra) return String(cra);
  } catch {
    // ignore
  }
  return "";
}

type GoogleMapsLibraries = ("drawing" | "geometry" | "places" | "visualization")[];

const LIBRARIES: GoogleMapsLibraries = ["geometry", "places"];

export const MAPS_LOADER_OPTIONS: {
  id: string;
  googleMapsApiKey: string;
  libraries: GoogleMapsLibraries;
  language: string;
  region: string;
  version: string;
} = {
  id: "routeflex-maps",
  googleMapsApiKey: resolvePublicMapsKey(),
  libraries: LIBRARIES,
  language: "en",
  region: "GB",
  version: "weekly",
};
