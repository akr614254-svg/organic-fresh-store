import api from './api'

export async function register({ name, email, password, phone }) {
  const { data } = await api.post('/auth/register', { name, email, password, phone })
  return data
}

export async function login({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

export async function fetchProfile() {
  const { data } = await api.get('/auth/me')
  return data.user
}

export async function updateProfile(updates) {
  const { data } = await api.put('/auth/me', updates)
  return data.user
}
