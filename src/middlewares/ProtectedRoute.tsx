import { Navigate, Outlet, useLocation } from "react-router-dom";

function getStored(key: string): string | null {
  const a = localStorage.getItem(key);
  if (a) return a;
  const b = sessionStorage.getItem(key);
  return b ?? null;
}

function safeParseUser(raw: string | null): any | null {
  if (!raw) return null;
  const v = raw.trim().toLowerCase();
  // guard against strings "null" / "undefined" / empty
  if (!raw || v === "null" || v === "undefined" || v === "") return null;
  try {
    const obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? obj : null;
  } catch {
    return null;
  }
}

function clearAuth() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  } catch {}
}

const ProtectedRoute = () => {
  const location = useLocation();

  const token = getStored("token");
  const tokenBad =
    !token ||
    token.trim() === "" ||
    token.trim().toLowerCase() === "null" ||
    token.trim().toLowerCase() === "undefined";

  const user = safeParseUser(getStored("user"));
  const role = (user?.role ?? "").toString().toLowerCase();

  // not logged in
  if (tokenBad || !user) {
    clearAuth();
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  // logged in but not admin
  if (role !== "admin") {
    clearAuth();
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
