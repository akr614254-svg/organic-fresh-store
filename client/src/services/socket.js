import { io } from 'socket.io-client'

let socket = null

// The API URL is like http://localhost:5000/api — sockets connect to the
// bare origin (no /api path), so strip it off.
function socketOrigin() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  return apiUrl.replace(/\/api\/?$/, '')
}

// Lazily creates (or reuses) a socket connected to the /admin namespace,
// authenticated with the same JWT used for REST calls. Only call this for
// logged-in admins — the server rejects everyone else during the handshake.
export function getAdminSocket() {
  if (socket) return socket

  const token = localStorage.getItem('of_token')
  socket = io(`${socketOrigin()}/admin`, {
    auth: { token },
    autoConnect: true,
    withCredentials: true,
  })

  return socket
}

export function disconnectAdminSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
