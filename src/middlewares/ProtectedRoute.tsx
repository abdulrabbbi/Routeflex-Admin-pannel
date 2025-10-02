// src/middlewares/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import apiClient from "../api/api";

/* ------------------------------ utils ------------------------------ */

function getStored(key: string): string | null {
  const a = typeof window !== "undefined" ? localStorage.getItem(key) : null;
  if (a) return a;
  const b = typeof window !== "undefined" ? sessionStorage.getItem(key) : null;
  return b ?? null;
}

function safeParseUser(raw: string | null): any | null {
  if (!raw) return null;
  const v = raw.trim().toLowerCase();
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

/* ------------------------------ types ------------------------------ */

type ApiUser = {
  _id: string;
  id?: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  profilePicture?: string;
  isVerified?: boolean;
  permissions?: string[] | string;
  createdAt?: string;
};

type MeResponse = {
  status: "success";
  data: { user: ApiUser };
};

/* --------------------------- UI helpers ---------------------------- */

function GuardSpinner() {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="flex items-center gap-3 text-gray-600">
        <span className="h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <span>Verifying your session...</span>
      </div>
    </div>
  );
}

function GuardError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="max-w-md w-full space-y-4 text-center">
        <p className="text-gray-700">{message}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Retry
          </button>
          <a
            href="/auth/login"
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Go to Login
          </a>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- ProtectedRoute --------------------------- */

type ProtectedProps = {
  allowedRoles?: string[];
};

const ProtectedRoute = ({ allowedRoles = ["admin"] }: ProtectedProps) => {
  const location = useLocation();
  const [status, setStatus] = useState<
    "checking" | "ok" | "redirect" | "error"
  >("checking");
  const [redirectTo, setRedirectTo] = useState<string>("/auth/login");
  const didStart = useRef(false);
  const lastError = useRef<string | null>(null);

  const token = useMemo(() => {
    const t = getStored("token");
    if (!t) return null;
    const v = t.trim().toLowerCase();
    if (!t || v === "" || v === "null" || v === "undefined") return null;
    return t;
  }, []);

  const verify = useCallback(async () => {
    // No token at all -> go to login
    if (!token) {
      clearAuth();
      setRedirectTo("/auth/login");
      setStatus("redirect");
      return;
    }

    try {
      setStatus("checking");
      const res = await apiClient.get<MeResponse>("/users/me");

      const apiUser = res?.data?.data?.user;
      if (!apiUser) throw new Error("Invalid /users/me response");

      // Role authorization gate
      const role = (apiUser.role || "").toString().toLowerCase();
      const allowed = allowedRoles.map((r) => r.toLowerCase());
      if (!allowed.includes(role)) {
        clearAuth();
        setRedirectTo("/auth/login");
        setStatus("redirect");
        return;
      }

      // Persist freshest profile
      try {
        const serialized = JSON.stringify(apiUser);
        localStorage.setItem("user", serialized);
      } catch {}

      setStatus("ok");
    } catch (err: any) {
      const code = err?.response?.status as number | undefined;
      // Token invalid/expired
      if (code === 401 || code === 403) {
        clearAuth();
        setRedirectTo("/auth/login");
        setStatus("redirect");
        return;
      }
      // Too many requests – ask user to wait/retry
      if (code === 429) {
        lastError.current = "Too many attempts. Please wait a moment and retry.";
        setStatus("error");
        return;
      }
      // Server or network error – don’t assume logout; allow retry
      lastError.current =
        (err?.response?.data?.message as string) ||
        (err?.message as string) ||
        "We couldn't verify your session due to a connection issue.";
      setStatus("error");
    }
  }, [token, allowedRoles]);

  useEffect(() => {
    if (didStart.current) return;
    didStart.current = true;
    void verify();
  }, [verify]);

  // While we're verifying the token/role, show a minimal spinner
  if (status === "checking") {
    return <GuardSpinner />;
  }

  // If check failed, send to login and remember where they were going
  if (status === "redirect") {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  // Network or other retryable error
  if (status === "error") {
    return (
      <GuardError
        message={lastError.current || "Couldn't verify your session."}
        onRetry={() => void verify()}
      />
    );
  }

  // All good -> render children (Dashboard layout tree)
  return <Outlet />;
};

export default ProtectedRoute;
