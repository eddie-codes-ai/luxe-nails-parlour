'use client'

import { useState, useEffect, useCallback } from 'react'

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
  photo_url?: string
  buffer_minutes: number
}

interface TimeSlot {
  start_time: string
  end_time: string
  display_time: string
  status: 'available' | 'taken' | 'late_night_request' | 'unavailable'
  is_late_night: boolean
}

interface BookingForm {
  customer_name: string
  customer_phone: string
  customer_email: string
  service_id: string
  artist_id: number | null
  booking_date: string
  start_time: string
  location_type: 'in_shop' | 'house_call'
  house_call_address: string
}

interface CreatedBooking {
  booking: { id: string; status: string }
  deposit_amount: number
  service_price: number
  travel_fee: number
  late_night_fee: number
  is_late_night: boolean
  expires_at: string
  message: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const KES = (n: number) => `KSh ${n.toLocaleString('en-KE', { minimumFractionDigits: 0 })}`

function formatDate(d: string) {
  if (!d) return ''
  return new Date(d + 'T00:00:00').toLocaleDateString('en-KE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function getNext60Days() {
  const days: Date[] = []
  const today = new Date(); today.setHours(0, 0, 0, 0)
  for (let i = 0; i < 60; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i); days.push(d)
  }
  return days
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

const css = {
  bg: '#F5F0E8',
  dark: '#2C1A0E',
  gold: '#B8962E',
  muted: '#7A6A50',
  border: '#D5C8B5',
  card: '#FDFAF5',
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: css.muted, fontWeight: 600, marginBottom: '0.5rem' }}>
      {children}{required && <span style={{ color: css.gold, marginLeft: 2 }}>*</span>}
    </label>
  )
}

function Input({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', padding: '0.75rem 1rem', background: css.card, border: `1px solid ${css.border}`, borderRadius: 2, fontSize: '0.95rem', color: css.dark, outline: 'none', boxSizing: 'border-box' as const }}
      onFocus={e => e.target.style.borderColor = css.gold}
      onBlur={e => e.target.style.borderColor = css.border}
    />
  )
}

function Btn({ children, onClick, disabled, ghost, full }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; ghost?: boolean; full?: boolean }) {
  const base: React.CSSProperties = {
    padding: '0.9rem 2.2rem', fontSize: '0.68rem', letterSpacing: '0.14em',
    textTransform: 'uppercase' as const, cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 600, borderRadius: 2, transition: 'all 0.2s', fontFamily: 'Georgia, serif',
    width: full ? '100%' : undefined,
  }
  const filled: React.CSSProperties = { ...base, background: disabled ? '#C8BBA8' : css.dark, color: css.bg, border: 'none' }
  const outline: React.CSSProperties = { ...base, background: 'transparent', color: css.muted, border: `1px solid ${css.border}` }
  return (
    <button onClick={onClick} disabled={disabled} style={ghost ? outline : filled}
      onMouseEnter={e => { if (!disabled && !ghost) (e.target as HTMLButtonElement).style.background = css.gold }}
      onMouseLeave={e => { if (!disabled && !ghost) (e.target as HTMLButtonElement).style.background = css.dark }}
    >{children}</button>
  )
}

function Steps({ current }: { current: number }) {
  const steps = [{ n: 1, l: 'Service' }, { n: 2, l: 'Date & Time' }, { n: 3, l: 'Location' }, { n: 4, l: 'Details' }, { n: 5, l: 'Deposit' }]
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', marginBottom: '3rem', overflowX: 'auto' as const, paddingBottom: '0.25rem' }}>
      {steps.map((s, i) => (
        <div key={s.n} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '0.35rem', minWidth: 56 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: current === s.n ? css.gold : current > s.n ? css.dark : 'transparent',
              border: `1.5px solid ${current >= s.n ? (current === s.n ? css.gold : css.dark) : css.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: current >= s.n ? css.bg : '#A09070', fontSize: '0.72rem', fontWeight: 500,
            }}>
              {current > s.n ? '✓' : s.n}
            </div>
            <span style={{ fontSize: '0.55rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: current === s.n ? css.gold : current > s.n ? css.dark : '#A09070', whiteSpace: 'nowrap' as const, fontWeight: current === s.n ? 600 : 400 }}>{s.l}</span>
          </div>
          {i < steps.length - 1 && <div style={{ height: 1, width: 32, background: current > s.n ? css.dark : css.border, marginBottom: '1rem', flexShrink: 0 }} />}
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BookingClient() {
  const [step, setStep] = useState(1)
  const [services, setServices] = useState<Service[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [created, setCreated] = useState<CreatedBooking | null>(null)
  const [mpesaRef, setMpesaRef] = useState('')
  const [mpesaSubmitting, setMpesaSubmitting] = useState(false)
  const [mpesaError, setMpesaError] = useState('')
  const [mpesaDone, setMpesaDone] = useState(false)

  const [form, setForm] = useState<BookingForm>({
    customer_name: '', customer_phone: '', customer_email: '',
    service_id: '', artist_id: null,
    booking_date: '', start_time: '',
    location_type: 'in_shop', house_call_address: '',
  })

  const set = (k: keyof BookingForm, v: string | number | null) =>
    setForm(p => ({ ...p, [k]: v }))

  const svc = services.find(s => s.id === form.service_id)
  const art = artists.find(a => a.id === form.artist_id)
  const selSlot = slots.find(s => s.start_time === form.start_time)

  useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(d => setServices(d.services ?? d ?? []))
    fetch('/api/artists').then(r => r.json()).then(d => setArtists(d.artists ?? d ?? []))
  }, [])

  const fetchSlots = useCallback(async () => {
    if (!form.booking_date || !form.service_id) return
    setSlotsLoading(true); setSlotsError(''); setSlots([]); set('start_time', '')
    try {
      const artistParam = form.artist_id !== null ? form.artist_id : 'any'
      const r = await fetch(`/api/bookings/slots?artistId=${artistParam}&date=${form.booking_date}&serviceId=${form.service_id}`)
      const d = await r.json()
      if (!r.ok) { setSlotsError(d.error ?? 'Failed to load slots'); return }
      if (!d.is_artist_available) { setSlotsError(d.message ?? 'Artist unavailable'); return }
      setSlots(d.slots ?? [])
    } catch { setSlotsError('Could not load times. Please try again.') }
    finally { setSlotsLoading(false) }
  }, [form.artist_id, form.booking_date, form.service_id])

  useEffect(() => { fetchSlots() }, [fetchSlots])

  async function submitBooking() {
    setSubmitting(true); setSubmitError('')
    try {
      const r = await fetch('/api/bookings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.customer_name, customer_phone: form.customer_phone,
          customer_email: form.customer_email || undefined,
          service_id: form.service_id, artist_id: form.artist_id,
          booking_date: form.booking_date, start_time: form.start_time,
          location_type: form.location_type,
          house_call_address: form.location_type === 'house_call' ? form.house_call_address : undefined,
        }),
      })
      const d = await r.json()
      if (!r.ok) { setSubmitError(d.error ?? 'Something went wrong'); return }
      setCreated(d); setStep(5)
    } catch { setSubmitError('Network error. Please try again.') }
    finally { setSubmitting(false) }
  }

  async function submitMpesa() {
    if (!mpesaRef.trim() || !created) return
    setMpesaSubmitting(true); setMpesaError('')
    try {
      const r = await fetch(`/api/bookings/${created.booking.id}/payment`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mpesa_ref: mpesaRef.trim() }),
      })
      const d = await r.json()
      if (!r.ok) { setMpesaError(d.error ?? 'Failed to submit'); return }
      setMpesaDone(true)
    } catch { setMpesaError('Network error. Please try again.') }
    finally { setMpesaSubmitting(false) }
  }

  const days = getNext60Days()

  return (
    <div style={{ minHeight: '100vh', background: css.bg, fontFamily: 'Georgia, serif' }}>

      {/* Hero */}
      <div style={{ background: css.dark, padding: '4rem 2rem 3rem', textAlign: 'center' }}>
        <p style={{ color: css.gold, fontSize: '0.62rem', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.9rem' }}>Reserve Your Spot</p>
        <h1 style={{ color: css.bg, fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 400, margin: '0 0 1rem', lineHeight: 1.1 }}>Book an Appointment</h1>
        <p style={{ color: '#A09070', fontSize: '0.92rem', maxWidth: 460, margin: '0 auto', lineHeight: 1.7 }}>
          Select your service, pick your artist, and secure your slot with a deposit.
        </p>
      </div>

      <div style={{ maxWidth: 660, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
        <Steps current={step} />

        {/* ── STEP 1: Service & Artist ── */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.55rem', fontWeight: 400, color: css.dark, marginBottom: '0.4rem' }}>Choose Your Service</h2>
            <p style={{ color: css.muted, fontSize: '0.88rem', marginBottom: '2rem' }}>Select the service you'd like and your preferred artist.</p>

            <div style={{ marginBottom: '2.5rem' }}>
              <Label required>Service</Label>
              {services.length === 0
                ? <p style={{ color: '#A09070', fontSize: '0.85rem', fontStyle: 'italic' }}>Loading services...</p>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {services.map(s => (
                      <div key={s.id} onClick={() => { set('service_id', s.id); set('start_time', '') }}
                        style={{ padding: '1rem 1.25rem', border: `1.5px solid ${form.service_id === s.id ? css.gold : css.border}`, background: form.service_id === s.id ? '#FEFBF5' : css.card, borderRadius: 2, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s' }}>
                        <div>
                          <div style={{ fontSize: '0.95rem', color: css.dark, fontWeight: 500 }}>{s.name}</div>
                          <div style={{ fontSize: '0.78rem', color: css.muted, marginTop: 2 }}>
                            {s.duration_minutes} min
                            {s.house_call_available && <span style={{ marginLeft: 8, color: css.gold }}>· House call available</span>}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                          <div style={{ fontSize: '1rem', color: css.gold, fontWeight: 600 }}>{s.base_price ? KES(s.base_price) : 'Quoted'}</div>
                          {form.service_id === s.id && <div style={{ fontSize: '0.65rem', color: css.gold }}>✓ Selected</div>}
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <Label>Preferred Artist</Label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: '0.75rem' }}>
                <div onClick={() => set('artist_id', null)}
                  style={{ padding: '1rem', border: `1.5px solid ${form.artist_id === null ? css.gold : css.border}`, background: form.artist_id === null ? '#FEFBF5' : css.card, borderRadius: 2, cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>✦</div>
                  <div style={{ fontSize: '0.8rem', color: css.dark, fontWeight: 500 }}>No Preference</div>
                  <div style={{ fontSize: '0.68rem', color: css.muted, marginTop: 2 }}>Owner assigns</div>
                </div>
                {artists.map(a => (
                  <div key={a.id} onClick={() => set('artist_id', a.id)}
                    style={{ padding: '1rem', border: `1.5px solid ${form.artist_id === a.id ? css.gold : css.border}`, background: form.artist_id === a.id ? '#FEFBF5' : css.card, borderRadius: 2, cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                    {a.photo_url
                      ? <img src={a.photo_url} alt={a.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', marginBottom: 6 }} />
                      : <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#E8DFC8', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: css.gold }}>{a.name.charAt(0)}</div>
                    }
                    <div style={{ fontSize: '0.8rem', color: css.dark, fontWeight: 500 }}>{a.name}</div>
                    {form.artist_id === a.id && <div style={{ fontSize: '0.62rem', color: css.gold, marginTop: 2 }}>✓ Selected</div>}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Btn disabled={!form.service_id} onClick={() => setStep(2)}>Continue →</Btn>
            </div>
          </div>
        )}

        {/* ── STEP 2: Date & Time ── */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.55rem', fontWeight: 400, color: css.dark, marginBottom: '0.4rem' }}>Pick a Date & Time</h2>
            <p style={{ color: css.muted, fontSize: '0.88rem', marginBottom: '2rem' }}>
              {svc?.name} · {svc?.duration_minutes} min{art ? ` · ${art.name}` : ' · Any artist'}
            </p>

            {/* Date strip */}
            <div style={{ marginBottom: '2rem' }}>
              <Label required>Date</Label>
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {days.map(d => {
                  const iso = d.toISOString().split('T')[0]
                  const sel = form.booking_date === iso
                  return (
                    <div key={iso} onClick={() => set('booking_date', iso)}
                      style={{ minWidth: 52, padding: '0.7rem 0.4rem', border: `1.5px solid ${sel ? css.gold : css.border}`, background: sel ? css.dark : css.card, borderRadius: 2, cursor: 'pointer', textAlign: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                      <div style={{ fontSize: '0.55rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: sel ? css.gold : '#A09070' }}>{d.toLocaleDateString('en-KE', { weekday: 'short' })}</div>
                      <div style={{ fontSize: '1.15rem', color: sel ? css.bg : css.dark, fontWeight: 500, margin: '2px 0' }}>{d.getDate()}</div>
                      <div style={{ fontSize: '0.55rem', color: '#A09070', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d.toLocaleDateString('en-KE', { month: 'short' })}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Slot grid */}
            {form.booking_date && (
              <div style={{ marginBottom: '2rem' }}>
                <Label required>Preferred Time</Label>
                {slotsLoading && <p style={{ color: '#A09070', fontSize: '0.85rem', fontStyle: 'italic' }}>Loading available times...</p>}
                {slotsError && <div style={{ padding: '0.75rem 1rem', background: '#FEF6F0', border: `1px solid #F0C8A0`, borderRadius: 2, color: '#8B4513', fontSize: '0.85rem' }}>{slotsError}</div>}
                {!slotsLoading && !slotsError && slots.length > 0 && (
                  <>
                    {/* Normal slots */}
                    {slots.filter(s => !s.is_late_night).length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        {slots.filter(s => !s.is_late_night).map(sl => (
                          <div key={sl.start_time}
                            onClick={() => sl.status === 'available' && set('start_time', sl.start_time)}
                            style={{ padding: '0.75rem', border: `1.5px solid ${form.start_time === sl.start_time ? css.gold : css.border}`, background: form.start_time === sl.start_time ? css.dark : css.card, borderRadius: 2, textAlign: 'center', cursor: sl.status === 'available' ? 'pointer' : 'not-allowed', opacity: sl.status === 'taken' ? 0.4 : 1, transition: 'all 0.15s' }}>
                            <span style={{ fontSize: '0.85rem', color: form.start_time === sl.start_time ? css.bg : sl.status === 'taken' ? '#A09070' : css.dark, textDecoration: sl.status === 'taken' ? 'line-through' : 'none' }}>{sl.display_time}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Late night slots */}
                    {slots.filter(s => s.is_late_night).length > 0 && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
                          <div style={{ height: 1, flex: 1, background: css.border }} />
                          <span style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: css.gold }}>Late Night — Request Only</span>
                          <div style={{ height: 1, flex: 1, background: css.border }} />
                        </div>
                        <p style={{ fontSize: '0.76rem', color: css.muted, marginBottom: '0.75rem', fontStyle: 'italic' }}>
                          Not guaranteed — artist will confirm before payment is requested.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem' }}>
                          {slots.filter(s => s.is_late_night).map(sl => (
                            <div key={sl.start_time}
                              onClick={() => sl.status !== 'taken' && set('start_time', sl.start_time)}
                              style={{ padding: '0.75rem', border: `1.5px dashed ${form.start_time === sl.start_time ? css.gold : '#C8BBA8'}`, background: form.start_time === sl.start_time ? '#FDF5E0' : css.card, borderRadius: 2, textAlign: 'center', cursor: sl.status === 'taken' ? 'not-allowed' : 'pointer', opacity: sl.status === 'taken' ? 0.4 : 1, transition: 'all 0.15s' }}>
                              <span style={{ fontSize: '0.85rem', color: form.start_time === sl.start_time ? css.gold : css.muted }}>{sl.display_time}</span>
                              <div style={{ fontSize: '0.58rem', color: css.gold, marginTop: 2, letterSpacing: '0.06em' }}>request</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {slots.every(s => s.status === 'taken') && (
                      <p style={{ color: '#8B4513', fontSize: '0.85rem', fontStyle: 'italic' }}>No available slots on this date. Please try another day.</p>
                    )}
                  </>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <Btn ghost onClick={() => setStep(1)}>← Back</Btn>
              <Btn disabled={!form.booking_date || !form.start_time} onClick={() => setStep(3)}>Continue →</Btn>
            </div>
          </div>
        )}

        {/* ── STEP 3: Location ── */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '1.55rem', fontWeight: 400, color: css.dark, marginBottom: '0.4rem' }}>Service Location</h2>
            <p style={{ color: css.muted, fontSize: '0.88rem', marginBottom: '2rem' }}>Where would you like your appointment?</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { type: 'in_shop' as const, icon: '✦', title: 'At the Studio', desc: 'Visit us at our Nairobi studio', available: true },
                { type: 'house_call' as const, icon: '◎', title: 'House Call', desc: 'We come to you · Travel fee applies', available: !!svc?.house_call_available },
              ].map(opt => (
                <div key={opt.type} onClick={() => opt.available && set('location_type', opt.type)}
                  style={{ padding: '1.5rem 1.25rem', border: `1.5px solid ${form.location_type === opt.type ? css.gold : css.border}`, background: form.location_type === opt.type ? '#FEFBF5' : css.card, borderRadius: 2, cursor: opt.available ? 'pointer' : 'not-allowed', textAlign: 'center', opacity: opt.available ? 1 : 0.5, transition: 'all 0.15s' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{opt.icon}</div>
                  <div style={{ fontSize: '0.92rem', color: css.dark, fontWeight: 500, marginBottom: 4 }}>{opt.title}</div>
                  <div style={{ fontSize: '0.76rem', color: css.muted, lineHeight: 1.5 }}>{opt.desc}</div>
                  {!opt.available && <div style={{ fontSize: '0.68rem', color: '#A09070', marginTop: 6 }}>Not available for this service</div>}
                  {form.location_type === opt.type && <div style={{ fontSize: '0.65rem', color: css.gold, marginTop: 8 }}>✓ Selected</div>}
                </div>
              ))}
            </div>

            {form.location_type === 'house_call' && (
              <div style={{ marginBottom: '2rem' }}>
                <Label required>Your Address</Label>
                <textarea value={form.house_call_address} onChange={e => set('house_call_address', e.target.value)}
                  placeholder="e.g. 14 Westlands Road, Westlands, Nairobi" rows={3}
                  style={{ width: '100%', padding: '0.75rem 1rem', background: css.card, border: `1px solid ${css.border}`, borderRadius: 2, fontSize: '0.95rem', color: css.dark, outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'Georgia, serif', lineHeight: 1.6 }}
                  onFocus={e => e.target.style.borderColor = css.gold}
                  onBlur={e => e.target.style.borderColor = css.border}
                />
                <p style={{ fontSize: '0.73rem', color: css.muted, marginTop: '0.4rem' }}>Include estate/area and a landmark for easy navigation.</p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <Btn ghost onClick={() => setStep(2)}>← Back</Btn>
              <Btn disabled={form.location_type === 'house_call' && !form.house_call_address.trim()} onClick={() => setStep(4)}>Continue →</Btn>
            </div>
          </div>
        )}

        {/* ── STEP 4: Details ── */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: '1.55rem', fontWeight: 400, color: css.dark, marginBottom: '0.4rem' }}>Your Details</h2>
            <p style={{ color: css.muted, fontSize: '0.88rem', marginBottom: '2rem' }}>We'll use these to confirm your booking and send reminders.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
              <div><Label required>Full Name</Label><Input value={form.customer_name} onChange={v => set('customer_name', v)} placeholder="e.g. Jane Wanjiru" /></div>
              <div>
                <Label required>Phone Number (WhatsApp)</Label>
                <Input value={form.customer_phone} onChange={v => set('customer_phone', v)} placeholder="e.g. 0712 345 678" type="tel" />
                <p style={{ fontSize: '0.73rem', color: css.muted, marginTop: '0.35rem' }}>Booking confirmation and reminders will be sent here.</p>
              </div>
              <div><Label>Email Address (Optional)</Label><Input value={form.customer_email} onChange={v => set('customer_email', v)} placeholder="e.g. jane@email.com" type="email" /></div>
            </div>

            {/* Summary */}
            <div style={{ background: css.card, border: `1px solid ${css.border}`, borderRadius: 2, padding: '1.25rem', marginBottom: '2rem' }}>
              <p style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: css.muted, marginBottom: '0.75rem' }}>Booking Summary</p>
              {[
                ['Service', svc?.name],
                ['Artist', art?.name ?? 'Owner assigns'],
                ['Date', formatDate(form.booking_date)],
                ['Time', selSlot?.display_time],
                ['Location', form.location_type === 'in_shop' ? 'At the Studio' : 'House Call'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: css.muted }}>{label}</span>
                  <span style={{ color: css.dark }}>{value}</span>
                </div>
              ))}
            </div>

            {submitError && <div style={{ padding: '0.75rem 1rem', background: '#FEF0F0', border: '1px solid #F0B0B0', borderRadius: 2, color: '#8B1313', fontSize: '0.85rem', marginBottom: '1rem' }}>{submitError}</div>}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <Btn ghost onClick={() => setStep(3)}>← Back</Btn>
              <Btn disabled={!form.customer_name.trim() || !form.customer_phone.trim() || submitting} onClick={submitBooking}>
                {submitting ? 'Reserving...' : 'Reserve My Slot →'}
              </Btn>
            </div>
          </div>
        )}

        {/* ── STEP 5: Deposit ── */}
        {step === 5 && created && (
          <div>
            {created.is_late_night ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ fontSize: '2.5rem', color: css.gold, marginBottom: '1rem' }}>✦</div>
                <h2 style={{ fontSize: '1.55rem', fontWeight: 400, color: css.dark, marginBottom: '0.75rem' }}>Request Submitted</h2>
                <p style={{ color: css.muted, fontSize: '0.92rem', lineHeight: 1.7, maxWidth: 420, margin: '0 auto 1.5rem' }}>
                  Your late-night slot request has been sent. The artist will confirm availability and reach out on WhatsApp before requesting payment.
                </p>
                <div style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: '#FDF5E0', border: '1px solid #E8D090', borderRadius: 2, fontSize: '0.85rem', color: '#7A5A10' }}>
                  Deposit of <strong>{KES(created.deposit_amount)}</strong> will be collected upon confirmation
                </div>
              </div>
            ) : mpesaDone ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ fontSize: '2.5rem', color: css.gold, marginBottom: '1rem' }}>✓</div>
                <h2 style={{ fontSize: '1.55rem', fontWeight: 400, color: css.dark, marginBottom: '0.75rem' }}>Reference Received</h2>
                <p style={{ color: css.muted, fontSize: '0.92rem', lineHeight: 1.7, maxWidth: 420, margin: '0 auto 1.5rem' }}>
                  The owner will verify your M-Pesa payment and confirm your booking. You'll be notified on WhatsApp.
                </p>
                <p style={{ color: '#A09070', fontSize: '0.78rem' }}>Reference: <strong style={{ color: css.dark }}>{mpesaRef}</strong></p>
              </div>
            ) : (
              <div>
                <h2 style={{ fontSize: '1.55rem', fontWeight: 400, color: css.dark, marginBottom: '0.4rem' }}>Secure Your Slot</h2>
                <p style={{ color: css.muted, fontSize: '0.88rem', marginBottom: '2rem' }}>
                  Slot reserved for <strong style={{ color: css.dark }}>1 hour</strong>. Pay the deposit to confirm.
                </p>

                {/* Price breakdown */}
                <div style={{ background: css.card, border: `1px solid ${css.border}`, borderRadius: 2, padding: '1.25rem', marginBottom: '2rem' }}>
                  <p style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: css.muted, marginBottom: '0.75rem' }}>Payment Breakdown</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: css.muted }}>Service price</span><span style={{ color: css.dark }}>{KES(created.service_price)}</span></div>
                    {created.travel_fee > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: css.muted }}>Travel fee</span><span style={{ color: css.dark }}>{KES(created.travel_fee)}</span></div>}
                    {created.late_night_fee > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: css.muted }}>Late night surcharge</span><span style={{ color: css.dark }}>{KES(created.late_night_fee)}</span></div>}
                    <div style={{ height: 1, background: css.border, margin: '0.25rem 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: css.muted, fontWeight: 600 }}>Deposit due (30%)</span>
                      <span style={{ color: css.gold, fontSize: '1.1rem', fontWeight: 600 }}>{KES(created.deposit_amount)}</span>
                    </div>
                  </div>
                </div>

                {/* M-Pesa instructions */}
                <div style={{ background: '#F0FBF4', border: '1px solid #A8D8B8', borderRadius: 2, padding: '1.25rem', marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3A7A5A', marginBottom: '0.75rem', fontWeight: 600 }}>M-Pesa Payment Instructions</p>
                  <ol style={{ paddingLeft: '1.2rem', fontSize: '0.86rem', color: '#2C4A35', lineHeight: 2, margin: 0 }}>
                    <li>Open M-Pesa → <strong>Lipa na M-Pesa → Send Money</strong></li>
                    <li>Enter the business number provided</li>
                    <li>Amount: <strong>{KES(created.deposit_amount)}</strong></li>
                    <li>Confirm with your PIN</li>
                    <li>Copy the <strong>M-Pesa confirmation code</strong> from the SMS</li>
                    <li>Paste it in the field below</li>
                  </ol>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <Label required>M-Pesa Confirmation Code</Label>
                  <Input value={mpesaRef} onChange={setMpesaRef} placeholder="e.g. QGH7X2K3LP" />
                  <p style={{ fontSize: '0.73rem', color: css.muted, marginTop: '0.35rem' }}>10-character code from your M-Pesa SMS, starting with a letter.</p>
                </div>

                {mpesaError && <div style={{ padding: '0.75rem 1rem', background: '#FEF0F0', border: '1px solid #F0B0B0', borderRadius: 2, color: '#8B1313', fontSize: '0.85rem', marginBottom: '1rem' }}>{mpesaError}</div>}

                <Btn disabled={!mpesaRef.trim() || mpesaSubmitting} onClick={submitMpesa} full>
                  {mpesaSubmitting ? 'Submitting...' : 'Submit Payment Reference →'}
                </Btn>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}