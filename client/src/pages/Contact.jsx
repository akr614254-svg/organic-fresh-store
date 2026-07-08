import { useState } from 'react'
import emailjs from '@emailjs/browser'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      setStatus('error')
      return
    }

    setStatus('sending')
    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        { from_name: form.name, from_email: form.email, message: form.message },
        { publicKey: PUBLIC_KEY },
      )
      setStatus('sent')
      setForm({ name: '', email: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="max-w-xl mx-auto px-5 py-16">
      <div className="text-center mb-8">
        <span className="text-3xl">📮</span>
        <h1 className="font-display text-3xl text-forest font-semibold mt-2">Get in touch</h1>
        <p className="text-charcoal/50 text-sm mt-1">
          Questions about an order, a delivery slot, or bulk purchases? Send us a note.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          required
          placeholder="Your name"
          value={form.name}
          onChange={update('name')}
          className="bg-white border border-forest/15 rounded-xl px-4 py-3 text-sm outline-none focus-visible:border-leaf"
        />
        <input
          required
          type="email"
          placeholder="Your email"
          value={form.email}
          onChange={update('email')}
          className="bg-white border border-forest/15 rounded-xl px-4 py-3 text-sm outline-none focus-visible:border-leaf"
        />
        <textarea
          required
          rows={5}
          placeholder="How can we help?"
          value={form.message}
          onChange={update('message')}
          className="bg-white border border-forest/15 rounded-xl px-4 py-3 text-sm outline-none focus-visible:border-leaf resize-none"
        />

        {status === 'sent' && (
          <div className="bg-sprout/30 text-forest text-sm rounded-xl px-4 py-3">
            Message sent — we'll get back to you soon.
          </div>
        )}
        {status === 'error' && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
            Couldn't send that. Double-check the EmailJS keys in <code>client/.env</code>, or try again shortly.
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'sending'}
          className="bg-forest text-cream font-medium py-3 rounded-full hover:bg-leaf transition-colors disabled:opacity-50"
        >
          {status === 'sending' ? 'Sending…' : 'Send Message'}
        </button>
      </form>
    </section>
  )
}
