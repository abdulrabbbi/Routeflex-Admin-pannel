import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import Router from "./routes/router";
import { SocketProvider } from "./realtime/SocketProvider";
import useAuthToken from "./realtime/useAuthToken";
import apiClient from "./api/api";

// Prefer a dedicated WS URL; fallback to your API base
// CRA uses REACT_APP_* env vars at build-time
// Example .env:
//   REACT_APP_WS_URL=https://api.routeflex.co.uk
//   REACT_APP_API_BASE=https://api.routeflex.co.uk
const WS_BASE =
  process.env.REACT_APP_WS_URL ||
  process.env.REACT_APP_API_BASE ||
  "http://localhost:5000";
  // "https://api.routeflex.co.uk";

const App: React.FC = () => {
  const router = Router();
  const token = useAuthToken("token"); 

  // Keep Axios auth header in sync with the current token
  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common["Authorization"];
    }
  }, [token]);

  return (
    <SocketProvider accessToken={token} baseUrl={WS_BASE}>
      <RouterProvider router={router} />
    </SocketProvider>
  );
};

export default App;
