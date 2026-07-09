import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateProfile } from '../services/authService'
import AddressPicker from '../components/AddressPicker'

export default function Account() {
  const { user, updateUser } = useAuth()
  const [addresses, setAddresses] = useState(user?.addresses || [])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ label: 'Home', line: '', phone: user?.phone || '', lat: null, lng: null })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const saveAddresses = async (next) => {
    setSaving(true)
    setError('')
    try {
      const updated = await updateProfile({ addresses: next })
      setAddresses(updated.addresses || [])
      updateUser(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.line.trim() || !form.phone.trim()) {
      setError('Address and phone are required.')
      return
    }
    const next = [...addresses, form]
    await saveAddresses(next)
    setForm({ label: 'Home', line: '', phone: user?.phone || '', lat: null, lng: null })
    setShowForm(false)
  }

  const handleDelete = (index) => {
    const next = addresses.filter((_, i) => i !== index)
    saveAddresses(next)
  }

  return (
    <section className="max-w-2xl mx-auto px-5 md:px-8 py-10">
      <h1 className="font-display text-3xl text-forest font-semibold mb-2">Your account</h1>
      <p className="text-sm text-charcoal/50 mb-8">{user?.name} · {user?.email}</p>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium text-forest">Saved addresses</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm font-medium text-leaf hover:text-forest"
          >
            + Add address
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <div className="flex flex-col gap-3 mb-6">
        {addresses.length === 0 && !showForm && (
          <p className="text-sm text-charcoal/40">No saved addresses yet — add one to check out faster next time.</p>
        )}
        {addresses.map((a, i) => (
          <div key={i} className="bg-white border border-forest/10 rounded-2xl p-4 flex items-start justify-between gap-4">
            <div>
              <span className="inline-block bg-sprout/30 text-forest text-xs font-medium px-2 py-0.5 rounded-full mb-1.5">
                {a.label}
              </span>
              <p className="text-sm text-charcoal/70">{a.line}</p>
              <p className="text-xs text-charcoal/40 mt-1">{a.phone}</p>
            </div>
            <button
              onClick={() => handleDelete(i)}
              disabled={saving}
              className="text-xs text-red-500 hover:underline shrink-0"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white border border-forest/10 rounded-2xl p-5 flex flex-col gap-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <select
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              className="bg-cream/50 border border-forest/15 rounded-xl px-4 py-2.5 text-sm outline-none"
            >
              <option>Home</option>
              <option>Work</option>
              <option>Other</option>
            </select>
            <input
              required
              type="tel"
              placeholder="Phone number"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="bg-cream/50 border border-forest/15 rounded-xl px-4 py-2.5 text-sm outline-none focus-visible:border-leaf"
            />
          </div>
          <AddressPicker
            value={form.line}
            onChange={({ address, lat, lng }) => setForm((f) => ({ ...f, line: address, lat, lng }))}
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-forest text-cream text-sm font-medium px-5 py-2 rounded-full hover:bg-leaf transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save address'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-charcoal/50 hover:text-charcoal"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
