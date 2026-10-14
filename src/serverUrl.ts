// Prod: frontend served by same server (same origin). Dev: game server on :8000.
export const SERVER_URL: string = import.meta.env.PROD
  ? window.location.origin
  : "http://localhost:8000";
