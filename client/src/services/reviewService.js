import api from './api'

export async function fetchReviews(productId) {
  const { data } = await api.get(`/reviews/${productId}`)
  return data // { reviews, summary: { avgRating, count } }
}

export async function submitReview(productId, { rating, comment }) {
  const { data } = await api.post(`/reviews/${productId}`, { rating, comment })
  return data
}

export async function deleteMyReview(productId) {
  const { data } = await api.delete(`/reviews/${productId}`)
  return data
}
