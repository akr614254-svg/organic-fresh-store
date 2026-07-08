import { useEffect, useState } from 'react'
import {
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
} from '../../services/adminService'
import { uploadProductImage } from '../../services/uploadService'

const CATEGORIES = ['leafy', 'root', 'fruits', 'herbs']
const EMPTY_FORM = {
  name: '',
  category: 'leafy',
  price: '',
  unit: '500 g',
  emoji: '🥬',
  imageUrl: '',
  badge: '',
  desc: '',
  stock: 100,
  isActive: true,
}

function ProductModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial || EMPTY_FORM)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const update = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [field]: val }))
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const url = await uploadProductImage(file)
      setForm((f) => ({ ...f, imageUrl: url }))
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) }
      const saved = initial
        ? await updateAdminProduct(initial._id, payload)
        : await createAdminProduct(payload)
      onSaved(saved)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-charcoal/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-cream rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-xl text-forest font-semibold mb-4">
          {initial ? 'Edit product' : 'Add product'}
        </h2>

        {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-3">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={update('name')}
            className="bg-white border border-forest/15 rounded-xl px-4 py-2.5 text-sm outline-none focus-visible:border-leaf"
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.category}
              onChange={update('category')}
              className="bg-white border border-forest/15 rounded-xl px-4 py-2.5 text-sm outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              placeholder="Unit (e.g. 500 g)"
              value={form.unit}
              onChange={update('unit')}
              className="bg-white border border-forest/15 rounded-xl px-4 py-2.5 text-sm outline-none focus-visible:border-leaf"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              required
              type="number"
              min="0"
              placeholder="Price (₹)"
              value={form.price}
              onChange={update('price')}
              className="bg-white border border-forest/15 rounded-xl px-4 py-2.5 text-sm outline-none focus-visible:border-leaf"
            />
            <input
              type="number"
              min="0"
              placeholder="Stock"
              value={form.stock}
              onChange={update('stock')}
              className="bg-white border border-forest/15 rounded-xl px-4 py-2.5 text-sm outline-none focus-visible:border-leaf"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Emoji (fallback icon)"
              value={form.emoji}
              onChange={update('emoji')}
              className="bg-white border border-forest/15 rounded-xl px-4 py-2.5 text-sm outline-none focus-visible:border-leaf"
            />
            <input
              placeholder="Badge (optional)"
              value={form.badge || ''}
              onChange={update('badge')}
              className="bg-white border border-forest/15 rounded-xl px-4 py-2.5 text-sm outline-none focus-visible:border-leaf"
            />
          </div>

          <textarea
            placeholder="Description"
            rows={2}
            value={form.desc}
            onChange={update('desc')}
            className="bg-white border border-forest/15 rounded-xl px-4 py-2.5 text-sm outline-none focus-visible:border-leaf resize-none"
          />

          <div className="flex items-center gap-3">
            {form.imageUrl ? (
              <img src={form.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover border border-forest/10" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-sprout/40 flex items-center justify-center text-2xl">
                {form.emoji}
              </div>
            )}
            <label className="text-sm text-leaf hover:text-forest cursor-pointer">
              {uploading ? 'Uploading…' : 'Upload photo'}
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" disabled={uploading} />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm text-charcoal/70">
            <input type="checkbox" checked={form.isActive} onChange={update('isActive')} />
            Active (visible to admin catalog queries)
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
              disabled={saving || uploading}
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

export default function AdminProducts() {
  const [products, setProducts] = useState(null)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null) // null | 'new' | product object

  const load = () => {
    fetchAdminProducts().then(setProducts).catch((err) => setError(err.message))
  }

  useEffect(load, [])

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.name}"? This can't be undone.`)) return
    try {
      await deleteAdminProduct(product._id)
      setProducts((prev) => prev.filter((p) => p._id !== product._id))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSaved = (saved) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p._id === saved._id)
      return exists ? prev.map((p) => (p._id === saved._id ? saved : p)) : [saved, ...prev]
    })
    setModal(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-forest font-semibold">Products</h1>
        <button
          onClick={() => setModal('new')}
          className="bg-forest text-cream text-sm font-medium px-4 py-2.5 rounded-full hover:bg-leaf transition-colors"
        >
          + Add Product
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

      <div className="bg-white border border-forest/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-sprout/20 text-left text-xs uppercase tracking-wide text-charcoal/50">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/5">
            {products?.map((p) => (
              <tr key={p._id}>
                <td className="px-4 py-3 flex items-center gap-3">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover" />
                  ) : (
                    <span className="w-9 h-9 rounded-lg bg-sprout/40 flex items-center justify-center">{p.emoji}</span>
                  )}
                  {p.name}
                </td>
                <td className="px-4 py-3 text-charcoal/60 capitalize">{p.category}</td>
                <td className="px-4 py-3 font-mono">₹{p.price}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${p.isActive ? 'bg-sprout/40 text-forest' : 'bg-charcoal/10 text-charcoal/50'}`}>
                    {p.isActive ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={() => setModal(p)} className="text-leaf hover:text-forest mr-3">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(p)} className="text-red-400 hover:text-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products?.length === 0 && <p className="text-sm text-charcoal/50 p-4">No products yet.</p>}
        {!products && !error && <p className="text-sm text-charcoal/50 p-4">Loading…</p>}
      </div>

      {modal && (
        <ProductModal
          initial={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
