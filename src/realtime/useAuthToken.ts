import React, { useEffect, useState } from "react";

/**
 * Reads a JWT from localStorage and stays in sync after login/logout.
 * We also listen to a custom "auth-token" event you can dispatch after login.
 */
export default function useAuthToken(storageKey: string = "token") {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(storageKey)
  );

  useEffect(() => {
    const read = () => setToken(localStorage.getItem(storageKey));

    // update when other tabs change it
    window.addEventListener("storage", read);

    // update in the same tab right after login/logout
    window.addEventListener("auth-token", read as EventListener);

    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("auth-token", read as EventListener);
    };
  }, [storageKey]);

  return token;
}
