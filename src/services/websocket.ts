import { io } from "socket.io-client";

// Derive socket URL from the same base as the API (strip /api suffix)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const WS_URL = API_URL.replace(/\/api$/, "");

export const socket = io(WS_URL, {
  path: "/ws",
  autoConnect: true,
  transports: ["polling", "websocket"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10,
});

export const connectWebSocket = () => {
  if (!socket.connected) socket.connect();
};

export const disconnectWebSocket = () => {
  if (socket.connected) socket.disconnect();
};
