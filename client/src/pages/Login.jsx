import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)
    try {
      await login(form)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="max-w-md mx-auto px-5 py-16">
      <h1 className="font-display text-3xl text-forest font-semibold mb-2">Welcome back</h1>
      <p className="text-sm text-charcoal/60 mb-8">Sign in to check out and see your orders.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={update('email')}
          className="bg-white border border-forest/15 rounded-xl px-4 py-3 text-sm outline-none focus-visible:border-leaf"
        />
        <input
          required
          type="password"
          placeholder="Password"
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
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-sm text-charcoal/60 mt-6 text-center">
        New to Organic Fresh?{' '}
        <Link to="/signup" className="text-leaf font-medium hover:underline">
          Create an account
        </Link>
      </p>
    </section>
  )
}
