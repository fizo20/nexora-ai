// frontend/lib/socket.ts
//
// BEFORE (broken): io() was called at module import time, meaning the socket
// tried to connect to the backend immediately on every page load — before the
// user had authenticated. This produced two WebSocket "closed before
// connection established" errors on every route and created unnecessary server
// load.
//
// AFTER (fixed): The socket is created lazily — only when connect() is
// explicitly called (e.g. after a successful login). Call disconnect() on
// logout. The rest of the codebase that imported `socket` directly can now
// import `getSocket()` instead, which safely returns the instance after it
// has been initialised.

import { io, Socket } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

let _socket: Socket | null = null;

/**
 * Returns the active socket instance.
 * Throws if called before connect() has been invoked so callers know they
 * have a lifecycle ordering problem rather than silently getting null.
 */
export function getSocket(): Socket {
  if (!_socket) {
    throw new Error(
      "[socket] getSocket() called before connect(). " +
        "Call connect() after the user logs in.",
    );
  }
  return _socket;
}

/**
 * Creates and connects the socket. Safe to call multiple times — subsequent
 * calls while already connected are no-ops.
 */
export function connect(): Socket {
  if (_socket?.connected) return _socket;

  _socket = io(API_URL, {
    // Prefer polling first so the handshake succeeds even in environments
    // where WebSocket upgrades are blocked, then upgrades automatically.
    transports: ["polling", "websocket"],
    withCredentials: true,
    autoConnect: true,
  });

  _socket.on("connect_error", (err) => {
    console.warn("[socket] Connection error:", err.message);
  });

  return _socket;
}

/**
 * Disconnects and destroys the socket instance. Call this on logout.
 */
export function disconnect(): void {
  if (_socket) {
    _socket.disconnect();
    _socket = null;
    //tttytt
  }
}
