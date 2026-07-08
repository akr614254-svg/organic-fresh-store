import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (form.password.length < 6) {
      setFormError('Password must be at least 6 characters')
      return
    }

    setSubmitting(true)
    try {
      await register(form)
      navigate('/', { replace: true })
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="max-w-md mx-auto px-5 py-16">
      <h1 className="font-display text-3xl text-forest font-semibold mb-2">Create your account</h1>
      <p className="text-sm text-charcoal/60 mb-8">
        Save your addresses and track orders from farm to door.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          required
          placeholder="Full name"
          value={form.name}
          onChange={update('name')}
          className="bg-white border border-forest/15 rounded-xl px-4 py-3 text-sm outline-none focus-visible:border-leaf"
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={update('email')}
          className="bg-white border border-forest/15 rounded-xl px-4 py-3 text-sm outline-none focus-visible:border-leaf"
        />
        <input
          type="tel"
          placeholder="Phone number (optional)"
          value={form.phone}
          onChange={update('phone')}
          className="bg-white border border-forest/15 rounded-xl px-4 py-3 text-sm outline-none focus-visible:border-leaf"
        />
        <input
          required
          type="password"
          placeholder="Password (min. 6 characters)"
          value={form.password}
          onChange={update('password')}
          className="bg-white border border-forest/15 rounded-xl px-4 py-3 text-sm outline-none focus-visible:border-leaf"
        />

        {formError && <p className="text-sm text-red-600">{formError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 bg-forest text-cream font-medium py-3 rounded-full hover:bg-leaf transition-colors disabled:opacity-50"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-charcoal/60 mt-6 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-leaf font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </section>
  )
}
