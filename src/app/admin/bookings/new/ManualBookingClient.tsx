'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Service {
  id: string
  name: string
  base_price: number
  duration_minutes: number
  house_call_available: boolean
}

interface Artist {
  id: number
  name: string
  buffer_minutes: number
}

interface TimeSlot {
  start_time: string
  display_time: string
  status: 'available' | 'taken' | 'late_night_request'
  is_late_night: boolean
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const c = {
  bg:     '#F5F0E8',
  dark:   '#2C1A0E',
  gold:   '#B8963E',
  muted:  '#7A6A52',
  border: '#D8CCBA',
  card:   '#FFFFFF',
  cream:  '#FDFAF5',
}

const fonts = {
  heading: "'Cormorant Garamond', Georgia, serif",
  body:    "'Jost', 'Helvetica Neue', sans-serif",
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', fontSize: 13,
  border: `1px solid ${c.border}`, borderRadius: 4,
  fontFamily: fonts.body, background: c.cream,
  color: c.dark, outline: 'none', boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: c.muted,
  fontFamily: fonts.body, fontWeight: 500, marginBottom: 6,
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxe-nails-parlour.vercel.app'

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ManualBookingClient() {
  const router = useRouter()

  const [services, setServices] = useState<Service[]>([])
  const [artists, setArtists]   = useState<Artist[]>([])
  const [slots, setSlots]       = useState<TimeSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const [error, setError]               = useState('')

  // ── Success state ────────────────────────────────────────────────────────────
  const [createdBooking, setCreatedBooking] = useState<{
    id: string
    customerName: string
    customerPhone: string
    depositAmount: number
    sendPaymentLink: boolean
  } | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)

  const [form, setForm] = useState({
    customer_name:       '',
    customer_phone:      '',
    customer_email:      '',
    service_id:          '',
    artist_id:           null as number | null,
    booking_date:        '',
    start_time:          '',
    location_type:       'in_shop' as 'in_shop' | 'house_call',
    house_call_address:  '',
    booking_source:      'whatsapp' as 'whatsapp' | 'call' | 'walk_in',
    deposit_collection:  'collected_offline' as 'collected_offline' | 'payment_link',
    admin_notes:         '',
  })

  const today = new Date().toISOString().split('T')[0]
  const selectedService = services.find(s => s.id === form.service_id)

  // ── Load services + artists ──────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(d => setServices(d.services ?? []))
    fetch('/api/artists').then(r => r.json()).then(d => setArtists(d.artists ?? []))
  }, [])

  // ── Load slots ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!form.booking_date || !form.service_id) return
    setSlotsLoading(true)
    setSlots([])
    set('start_time', '')
    const artistParam = form.artist_id ?? 'any'
    fetch(`/api/bookings/slots?artistId=${artistParam}&date=${form.booking_date}&serviceId=${form.service_id}`)
      .then(r => r.json())
      .then(d => setSlots(d.slots ?? []))
      .finally(() => setSlotsLoading(false))
  }, [form.artist_id, form.booking_date, form.service_id])

  function set(field: keyof typeof form, value: any) {
    setForm(f => ({ ...f, [field]: value }))
    setError('')
  }

  const depositEstimate = selectedService
    ? Math.round(selectedService.base_price * 0.3)
    : 0

  // ── Submit ───────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!form.customer_name.trim())  { setError('Customer name is required'); return }
    if (!form.customer_phone.trim()) { setError('Customer phone is required'); return }
    if (!form.service_id)            { setError('Please select a service'); return }
    if (!form.booking_date)          { setError('Please select a date'); return }
    if (!form.start_time)            { setError('Please select a time slot'); return }
    if (form.location_type === 'house_call' && !form.house_call_address.trim()) {
      setError('Please enter the customer address'); return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/admin/bookings/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to create booking'); return }

      setCreatedBooking({
        id:              data.booking.id,
        customerName:    form.customer_name,
        customerPhone:   form.customer_phone,
        depositAmount:   data.deposit_amount,
        sendPaymentLink: form.deposit_collection === 'payment_link',
      })
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Copy link ────────────────────────────────────────────────────────────────
  function copyLink() {
    if (!createdBooking) return
    const url = `${SITE_URL}/pay/${createdBooking.id}`
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2500)
    })
  }

  // ── Open WhatsApp directly with pre-filled message ───────────────────────────
  function openWhatsApp() {
    if (!createdBooking) return
    const url  = `${SITE_URL}/pay/${createdBooking.id}`
    const msg  = `Hi ${createdBooking.customerName.split(' ')[0]} 👋\n\nThank you for booking with Luxe Nails Parlour!\n\nOpen the link below to choose your service and any extras, then pay your deposit to confirm:\n\n${url}\n\nOnly services that fit your reserved time are shown, and the deposit updates as you choose. Step-by-step M-Pesa instructions are on the page. Let me know once done! 💅`

    // Normalise phone: strip leading 0 and add 254 country code
    const rawPhone  = createdBooking.customerPhone.replace(/[\s\-]/g, '')
    const waPhone   = rawPhone.startsWith('0')
      ? '254' + rawPhone.slice(1)
      : rawPhone.startsWith('+')
      ? rawPhone.slice(1)
      : rawPhone

    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`
    window.open(waUrl, '_blank')
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (createdBooking) {
    const payUrl = `${SITE_URL}/pay/${createdBooking.id}`

    return (
      <div style={{ minHeight: '100vh', background: c.bg, fontFamily: fonts.body }}>
        <nav style={{ background: c.dark, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          <span style={{ fontSize: 16, fontWeight: 400, color: c.gold, fontFamily: fonts.heading }}>Luxe Nails</span>
          <button onClick={() => router.push('/admin/bookings')}
            style={{ background: 'none', border: '1px solid #5A4A3A', color: '#9A8A72', padding: '6px 16px', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: fonts.body, borderRadius: 2 }}>
            ← All Bookings
          </button>
        </nav>

        <div style={{ maxWidth: 560, margin: '0 auto', padding: '60px 24px' }}>

          {/* Success banner */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✅</div>
            <h1 style={{ fontFamily: fonts.heading, fontSize: 32, fontWeight: 400, color: c.dark, margin: '0 0 8px' }}>
              Booking Created!
            </h1>
            <p style={{ color: c.muted, fontSize: 14, margin: 0 }}>
              Booking for <strong>{createdBooking.customerName}</strong> has been saved.
            </p>
          </div>

          {/* Payment link card */}
          <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 6, padding: '24px', marginBottom: 16 }}>
            <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: c.gold, fontWeight: 600, margin: '0 0 6px' }}>
              Payment Link
            </p>
            <p style={{ fontSize: 13, color: c.muted, margin: '0 0 16px', lineHeight: 1.6 }}>
              Send this link to {createdBooking.customerName.split(' ')[0]} so they can pay the{' '}
              <strong style={{ color: c.dark }}>KSh {Number(createdBooking.depositAmount).toLocaleString()}</strong> deposit via M-Pesa.
            </p>

            {/* URL display + copy */}
            <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 4, padding: '10px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ fontSize: 12, color: c.dark, fontFamily: 'monospace', wordBreak: 'break-all' as const }}>
                {payUrl}
              </span>
              <button onClick={copyLink}
                style={{ background: linkCopied ? '#1A7A40' : c.dark, color: '#F5F0E8', border: 'none', borderRadius: 2, padding: '7px 14px', fontSize: 11, fontFamily: fonts.body, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s' }}>
                {linkCopied ? '✓ Copied' : 'Copy'}
              </button>
            </div>

            {/* Open WhatsApp directly */}
            <button onClick={openWhatsApp}
              style={{ width: '100%', padding: '13px', background: '#25D366', color: '#fff', border: 'none', borderRadius: 4, fontSize: 13, fontFamily: fonts.body, fontWeight: 600, letterSpacing: '0.06em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>💬</span>
              Send via WhatsApp
            </button>
            <p style={{ fontSize: 11, color: c.muted, margin: '8px 0 0', textAlign: 'center' }}>
              Opens WhatsApp with {createdBooking.customerName.split(' ')[0]}'s number and message pre-filled — just hit send.
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => {
                setCreatedBooking(null)
                setForm({
                  customer_name: '', customer_phone: '', customer_email: '',
                  service_id: '', artist_id: null, booking_date: '', start_time: '',
                  location_type: 'in_shop', house_call_address: '',
                  booking_source: 'whatsapp', deposit_collection: 'collected_offline', admin_notes: '',
                })
              }}
              style={{ flex: 1, padding: '11px', background: 'transparent', border: `1px solid ${c.border}`, borderRadius: 2, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: fonts.body, color: c.muted }}>
              + New Booking
            </button>
            <button onClick={() => router.push('/admin/bookings')}
              style={{ flex: 1, padding: '11px', background: c.dark, color: '#F5F0E8', border: 'none', borderRadius: 2, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: fonts.body, fontWeight: 600 }}>
              View All Bookings
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main form ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: c.bg, fontFamily: fonts.body }}>

      {/* Nav */}
      <nav style={{ background: c.dark, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <button onClick={() => router.push('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 400, color: c.gold, fontFamily: fonts.heading }}>Luxe Nails</span>
          <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#9A8A72', marginLeft: 8, fontFamily: fonts.body }}>Admin Panel</span>
        </button>
        <button onClick={() => router.push('/admin/bookings')}
          style={{ background: 'none', border: '1px solid #5A4A3A', color: '#9A8A72', padding: '6px 16px', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: fonts.body, borderRadius: 2 }}>
          ← All Bookings
        </button>
      </nav>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px 80px' }}>

        <h1 style={{ margin: '0 0 6px', fontSize: 36, fontWeight: 400, color: c.dark, fontFamily: fonts.heading }}>
          New Manual Booking
        </h1>
        <p style={{ margin: '0 0 32px', color: c.muted, fontSize: 14 }}>
          Create a booking for a customer who contacted you via WhatsApp, call, or walk-in.
        </p>

        {error && (
          <div style={{ background: '#FEF0EE', border: '1px solid #E8A89A', borderRadius: 4, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#8B3A2A' }}>
            {error}
          </div>
        )}

        {/* ── Booking Source ── */}
        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 6, padding: '20px 24px', marginBottom: 16 }}>
          <p style={{ margin: '0 0 12px', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: c.muted, fontFamily: fonts.body }}>
            How did they contact you?
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {([
              { value: 'whatsapp', label: '💬 WhatsApp' },
              { value: 'call',     label: '📞 Call' },
              { value: 'walk_in',  label: '🚶 Walk-in' },
            ] as const).map(opt => (
              <button key={opt.value} onClick={() => set('booking_source', opt.value)}
                style={{ flex: 1, padding: '10px 8px', borderRadius: 4, cursor: 'pointer', fontFamily: fonts.body, fontSize: 12, fontWeight: 500, border: `1.5px solid ${form.booking_source === opt.value ? c.dark : c.border}`, background: form.booking_source === opt.value ? c.dark : c.cream, color: form.booking_source === opt.value ? '#F5F0E8' : c.muted, transition: 'all 0.15s' }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Customer Details ── */}
        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 6, padding: '20px 24px', marginBottom: 16 }}>
          <p style={{ margin: '0 0 16px', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: c.muted, fontFamily: fonts.body }}>Customer Details</p>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input style={inputStyle} type="text" placeholder="e.g. Jane Wanjiru"
                value={form.customer_name} onChange={e => set('customer_name', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Phone Number *</label>
              <input style={inputStyle} type="tel" placeholder="e.g. 0712 345 678"
                value={form.customer_phone} onChange={e => set('customer_phone', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Email (optional)</label>
              <input style={inputStyle} type="email" placeholder="e.g. jane@email.com"
                value={form.customer_email} onChange={e => set('customer_email', e.target.value)} />
            </div>
          </div>
        </div>

        {/* ── Service + Artist ── */}
        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 6, padding: '20px 24px', marginBottom: 16 }}>
          <p style={{ margin: '0 0 16px', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: c.muted, fontFamily: fonts.body }}>Service & Artist</p>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
            <div>
              <label style={labelStyle}>Service *</label>
              <select style={inputStyle} value={form.service_id} onChange={e => set('service_id', e.target.value)}>
                <option value="">-- Select a service --</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name} — KSh {Number(s.base_price).toLocaleString()} ({s.duration_minutes} min)</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Artist</label>
              <select style={inputStyle} value={form.artist_id ?? ''} onChange={e => set('artist_id', e.target.value ? Number(e.target.value) : null)}>
                <option value="">Owner assigns</option>
                {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Date + Time ── */}
        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 6, padding: '20px 24px', marginBottom: 16 }}>
          <p style={{ margin: '0 0 16px', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: c.muted, fontFamily: fonts.body }}>Date & Time</p>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Date *</label>
            <input style={{ ...inputStyle, maxWidth: 240 }} type="date" min={today}
              value={form.booking_date} onChange={e => set('booking_date', e.target.value)} />
          </div>
          {form.booking_date && form.service_id && (
            <div>
              <label style={labelStyle}>Time Slot *</label>
              {slotsLoading && <p style={{ color: c.muted, fontSize: 13 }}>Loading slots...</p>}
              {!slotsLoading && slots.length === 0 && (
                <p style={{ color: c.muted, fontSize: 13 }}>No slots available on this date.</p>
              )}
              {!slotsLoading && slots.length > 0 && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                    {slots.filter(s => !s.is_late_night).map(slot => (
                      <button key={slot.start_time}
                        disabled={slot.status === 'taken'}
                        onClick={() => slot.status !== 'taken' && set('start_time', slot.start_time)}
                        style={{ padding: '10px 6px', borderRadius: 4, fontSize: 12, textAlign: 'center', cursor: slot.status === 'taken' ? 'not-allowed' : 'pointer', fontFamily: fonts.body, transition: 'all 0.15s', border: `1.5px solid ${form.start_time === slot.start_time ? c.dark : c.border}`, background: form.start_time === slot.start_time ? c.dark : slot.status === 'taken' ? '#EDE8DF' : c.cream, color: form.start_time === slot.start_time ? '#F5F0E8' : slot.status === 'taken' ? '#B0A090' : c.dark, textDecoration: slot.status === 'taken' ? 'line-through' : 'none' }}>
                        {slot.display_time}
                      </button>
                    ))}
                  </div>
                  {slots.filter(s => s.is_late_night).length > 0 && (
                    <>
                      <p style={{ fontSize: 11, color: c.gold, marginBottom: 8, fontFamily: fonts.body }}>🌙 Late night — request only</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                        {slots.filter(s => s.is_late_night).map(slot => (
                          <button key={slot.start_time}
                            onClick={() => set('start_time', slot.start_time)}
                            style={{ padding: '10px 6px', borderRadius: 4, fontSize: 12, textAlign: 'center', cursor: 'pointer', fontFamily: fonts.body, border: `1.5px dashed ${form.start_time === slot.start_time ? c.dark : c.gold}`, background: form.start_time === slot.start_time ? c.dark : 'transparent', color: form.start_time === slot.start_time ? '#F5F0E8' : c.gold, transition: 'all 0.15s' }}>
                            {slot.display_time}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Location ── */}
        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 6, padding: '20px 24px', marginBottom: 16 }}>
          <p style={{ margin: '0 0 12px', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: c.muted, fontFamily: fonts.body }}>Location</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {([
              { value: 'in_shop',    label: '🏠 At the Studio' },
              { value: 'house_call', label: '🚗 House Call', disabled: !selectedService?.house_call_available },
            ] as const).map(opt => (
              <button key={opt.value}
                disabled={'disabled' in opt && opt.disabled}
                onClick={() => set('location_type', opt.value)}
                style={{ padding: '12px', borderRadius: 4, cursor: 'disabled' in opt && opt.disabled ? 'not-allowed' : 'pointer', fontFamily: fonts.body, fontSize: 13, border: `1.5px solid ${form.location_type === opt.value ? c.dark : c.border}`, background: form.location_type === opt.value ? c.dark : c.cream, color: form.location_type === opt.value ? '#F5F0E8' : 'disabled' in opt && opt.disabled ? '#C0B8AC' : c.dark, transition: 'all 0.15s' }}>
                {opt.label}
              </button>
            ))}
          </div>
          {form.location_type === 'house_call' && (
            <div>
              <label style={labelStyle}>Customer Address *</label>
              <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2}
                placeholder="e.g. Apt 4B, Westlands, Nairobi"
                value={form.house_call_address} onChange={e => set('house_call_address', e.target.value)} />
            </div>
          )}
        </div>

        {/* ── Deposit ── */}
        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 6, padding: '20px 24px', marginBottom: 16 }}>
          <p style={{ margin: '0 0 12px', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: c.muted, fontFamily: fonts.body }}>Deposit</p>
          {selectedService && (
            <div style={{ background: c.bg, borderRadius: 4, padding: '10px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', fontSize: 13, fontFamily: fonts.body }}>
              <span style={{ color: c.muted }}>Estimated deposit (30%)</span>
              <span style={{ color: c.gold, fontWeight: 600 }}>KSh {depositEstimate.toLocaleString()}</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            {([
              { value: 'collected_offline', label: '✓ Already Collected', sub: 'Cash or M-Pesa done offline' },
              { value: 'payment_link',      label: '📤 Send Payment Link', sub: 'Customer pays via link' },
            ] as const).map(opt => (
              <div key={opt.value} onClick={() => set('deposit_collection', opt.value)}
                style={{ flex: 1, padding: '12px 14px', borderRadius: 4, cursor: 'pointer', border: `1.5px solid ${form.deposit_collection === opt.value ? c.dark : c.border}`, background: form.deposit_collection === opt.value ? c.dark : c.cream, transition: 'all 0.15s' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: form.deposit_collection === opt.value ? '#F5F0E8' : c.dark, fontFamily: fonts.body, marginBottom: 2 }}>{opt.label}</div>
                <div style={{ fontSize: 11, color: form.deposit_collection === opt.value ? '#9A8A72' : c.muted, fontFamily: fonts.body }}>{opt.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Admin Notes ── */}
        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 6, padding: '20px 24px', marginBottom: 24 }}>
          <label style={labelStyle}>Admin Notes (optional)</label>
          <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3}
            placeholder="Any notes about this booking, special requests, etc."
            value={form.admin_notes} onChange={e => set('admin_notes', e.target.value)} />
        </div>

        {/* ── Submit ── */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => router.push('/admin/bookings')}
            style={{ flex: 1, padding: '13px', background: 'transparent', border: `1px solid ${c.border}`, borderRadius: 2, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: fonts.body, color: c.muted }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            style={{ flex: 2, padding: '13px', background: c.dark, color: '#F5F0E8', border: 'none', borderRadius: 2, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: fonts.body, fontWeight: 600, opacity: submitting ? 0.7 : 1 }}>
            {submitting ? 'Creating Booking...' : 'Create Booking →'}
          </button>
        </div>
      </div>
    </div>
  )
}