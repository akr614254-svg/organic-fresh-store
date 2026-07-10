import { useEffect, useState } from 'react'
import { fetchCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../services/adminService'

const EMPTY_FORM = {
  code: '',
  type: 'flat',
  value: '',
  minOrderValue: '',
  maxDiscount: '',
  expiresAt: '',
  usageLimit: '',
  isActive: true,
}

function CouponModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(
    initial
      ? {
          ...initial,
          expiresAt: initial.expiresAt ? initial.expiresAt.slice(0, 10) : '',
          minOrderValue: initial.minOrderValue ?? '',
          maxDiscount: initial.maxDiscount ?? '',
          usageLimit: initial.usageLimit ?? '',
        }
      : EMPTY_FORM,
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const update = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [field]: val }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value),
        minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        expiresAt: form.expiresAt || null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        isActive: form.isActive,
      }
      const saved = initial ? await updateCoupon(initial._id, payload) : await createCoupon(payload)
      onSaved(saved)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-charcoal/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cream rounded-3xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-xl text-forest font-semibold mb-4">
          {initial ? 'Edit coupon' : 'New coupon'}
        </h2>

        {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-3">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            required
            placeholder="CODE (e.g. FRESH10)"
            value={form.code}
            onChange={update('code')}
            className="bg-white border border-forest/15 rounded-xl px-4 py-2.5 text-sm outline-none focus-visible:border-leaf uppercase"
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.type}
              onChange={update('type')}
              className="bg-white border border-forest/15 rounded-xl px-4 py-2.5 text-sm outline-none"
            >
              <option value="flat">Flat ₹ off</option>
              <option value="percent">% off</option>
            </select>
            <input
              required
              type="number"
              min="0"
              placeholder={form.type === 'percent' ? 'Value (%)' : 'Value (₹)'}
              value={form.value}
              onChange={update('value')}
              className="bg-white border border-forest/15 rounded-xl px-4 py-2.5 text-sm outline-none focus-visible:border-leaf"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min="0"
              placeholder="Min order value (₹)"
              value={form.minOrderValue}
              onChange={update('minOrderValue')}
              className="bg-white border border-forest/15 rounded-xl px-4 py-2.5 text-sm outline-none focus-visible:border-leaf"
            />
            {form.type === 'percent' && (
              <input
                type="number"
                min="0"
                placeholder="Max discount (₹, optional)"
                value={form.maxDiscount}
                onChange={update('maxDiscount')}
                className="bg-white border border-forest/15 rounded-xl px-4 py-2.5 text-sm outline-none focus-visible:border-leaf"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={form.expiresAt}
              onChange={update('expiresAt')}
              className="bg-white border border-forest/15 rounded-xl px-4 py-2.5 text-sm outline-none focus-visible:border-leaf"
            />
            <input
              type="number"
              min="0"
              placeholder="Usage limit (optional)"
              value={form.usageLimit}
              onChange={update('usageLimit')}
              className="bg-white border border-forest/15 rounded-xl px-4 py-2.5 text-sm outline-none focus-visible:border-leaf"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-charcoal/70">
            <input type="checkbox" checked={form.isActive} onChange={update('isActive')} />
            Active
          </label>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-forest/15 text-charcoal/70 font-medium py-2.5 rounded-full hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-forest text-cream font-medium py-2.5 rounded-full hover:bg-leaf transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState(null)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null) // null | 'new' | coupon object

  const load = () => {
    fetchCoupons().then(setCoupons).catch((err) => setError(err.message))
  }

  useEffect(load, [])

  const handleDelete = async (coupon) => {
    if (!confirm(`Delete coupon "${coupon.code}"?`)) return
    try {
      await deleteCoupon(coupon._id)
      setCoupons((prev) => prev.filter((c) => c._id !== coupon._id))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSaved = (saved) => {
    setCoupons((prev) => {
      const exists = prev.some((c) => c._id === saved._id)
      return exists ? prev.map((c) => (c._id === saved._id ? saved : c)) : [saved, ...prev]
    })
    setModal(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-forest font-semibold">Coupons</h1>
        <button
          onClick={() => setModal('new')}
          className="bg-forest text-cream text-sm font-medium px-4 py-2.5 rounded-full hover:bg-leaf transition-colors"
        >
          + New Coupon
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

      <div className="bg-white border border-forest/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-sprout/20 text-left text-xs uppercase tracking-wide text-charcoal/50">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Min order</th>
              <th className="px-4 py-3">Used</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/5">
            {coupons?.map((c) => (
              <tr key={c._id}>
                <td className="px-4 py-3 font-mono font-medium text-forest">{c.code}</td>
                <td className="px-4 py-3">
                  {c.type === 'percent' ? `${c.value}%${c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ''}` : `₹${c.value}`}
                </td>
                <td className="px-4 py-3 text-charcoal/60">₹{c.minOrderValue}</td>
                <td className="px-4 py-3 text-charcoal/60">
                  {c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}
                </td>
                <td className="px-4 py-3 text-charcoal/60">
                  {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${c.isActive ? 'bg-sprout/40 text-forest' : 'bg-charcoal/10 text-charcoal/50'}`}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={() => setModal(c)} className="text-leaf hover:text-forest mr-3">Edit</button>
                  <button onClick={() => handleDelete(c)} className="text-red-400 hover:text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons?.length === 0 && <p className="text-sm text-charcoal/50 p-4">No coupons yet.</p>}
        {!coupons && !error && <p className="text-sm text-charcoal/50 p-4">Loading…</p>}
      </div>

      {modal && (
        <CouponModal initial={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSaved={handleSaved} />
      )}
    </div>
  )
}
