'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

interface Booking {
  id: string
  customer_name: string
  customer_phone: string
  service_price: number
  deposit_amount: number
  booking_date: string
  start_time: string
  status: string
  location_type: 'in_shop' | 'house_call'
  is_late_night: boolean
  services?: { name: string }
  artists?: { name: string }
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-KE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hh = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hh}:${String(m).padStart(2, '0')} ${suffix}`
}

function kes(n: number) {
  return `KSh ${Number(n).toLocaleString()}`
}

function getCancellationTier(bookingDate: string, startTime: string, isLateNight: boolean): {
  tier: 'early' | 'mid' | 'late'
  hoursNotice: number
  refundLabel: string
  refundDetail: string
  canChoose: boolean
} {
  const now = new Date()
  const appointmentDateTime = new Date(`${bookingDate}T${startTime}`)
  const hoursNotice = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (isLateNight) {
    if (hoursNotice >= 4) {
      return { tier: 'early', hoursNotice, refundLabel: 'Full refund', refundDetail: 'Your deposit will be refunded in full within 2-3 business days.', canChoose: false }
    }
    return { tier: 'late', hoursNotice, refundLabel: 'No refund', refundDetail: 'Late night cancellations within 4 hours are non-refundable.', canChoose: false }
  }

  if (hoursNotice >= 48) {
    return { tier: 'early', hoursNotice, refundLabel: 'Full refund or credit', refundDetail: 'You qualify for a full refund or credit toward your next booking - your choice.', canChoose: true }
  }
  if (hoursNotice >= 24) {
    return { tier: 'mid', hoursNotice, refundLabel: 'Credit only', refundDetail: 'Your deposit will be held as credit toward your next booking. Cash refunds are not available with less than 48 hours notice.', canChoose: false }
  }
  return { tier: 'late', hoursNotice, refundLabel: 'No refund', refundDetail: 'Cancellations within 24 hours are non-refundable. Your deposit will be kept by the salon.', canChoose: false }
}

const c = {
  bg:     '#F5F0E8',
  dark:   '#2C1A0E',
  gold:   '#B8963E',
  muted:  '#7A6A52',
  border: '#D8CCBA',
  card:   '#FFFFFF',
}

const fonts = {
  heading: "'Cormorant Garamond', Georgia, serif",
  body:    "'Jost', 'Helvetica Neue', sans-serif",
}

export default function CancelClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookingId = searchParams.get('id')

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [action, setAction] = useState<'choose' | 'cancel' | 'reschedule' | 'done'>('choose')
  const [refundChoice, setRefundChoice] = useState<'refund' | 'credit'>('refund')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ message: string; refundLabel: string } | null>(null)

  useEffect(() => {
    if (!bookingId) { setError('No booking ID provided.'); setLoading(false); return }
    fetch(`/api/bookings?id=${bookingId}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return }
        setBooking(d.booking)
      })
      .catch(() => setError('Failed to load booking.'))
      .finally(() => setLoading(false))
  }, [bookingId])

  async function handleCancel() {
    if (!booking) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/bookings/cancel?id=${booking.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refund_choice: refundChoice }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to cancel booking'); return }
      setResult({ message: data.message, refundLabel: data.refund_label })
      setAction('done')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const policy = booking
    ? getCancellationTier(booking.booking_date, booking.start_time, booking.is_late_night)
    : null

  const canCancel = booking && ['confirmed', 'pending_payment', 'payment_submitted', 'pending_approval'].includes(booking.status)

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.body }}>
        <p style={{ color: c.muted, fontSize: 14 }}>Loading your booking...</p>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.body, padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>😕</div>
          <h2 style={{ fontFamily: fonts.heading, fontSize: 28, fontWeight: 400, color: c.dark, marginBottom: 12 }}>Booking Not Found</h2>
          <p style={{ color: c.muted, fontSize: 14, marginBottom: 24 }}>{error || 'We could not find this booking.'}</p>
          <button onClick={() => router.push('/')} style={{ background: c.dark, color: '#F5F0E8', border: 'none', padding: '12px 24px', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: fonts.body }}>
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: c.bg, fontFamily: fonts.body }}>
      <div style={{ background: c.dark, padding: '48px 24px 40px', textAlign: 'center' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: c.gold, marginBottom: 12, fontFamily: fonts.body }}>
          LuxeNails Parlour
        </p>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 400, color: '#F5F0E8', margin: 0, fontFamily: fonts.heading }}>
          {action === 'done' ? 'All Done' : 'Manage Your Booking'}
        </h1>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 6, padding: '20px 24px', marginBottom: 24 }}>
          <p style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: c.muted, marginBottom: 12, fontFamily: fonts.body }}>
            Your Appointment
          </p>
          {[
            ['Service',  booking.services?.name ?? '-'],
            ['Artist',   booking.artists?.name ?? 'Owner assigns'],
            ['Date',     formatDate(booking.booking_date)],
            ['Time',     formatTime(booking.start_time)],
            ['Location', booking.location_type === 'house_call' ? 'House call' : 'At the studio'],
            ['Deposit',  kes(booking.deposit_amount)],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #EDE8DF', fontSize: 13, fontFamily: fonts.body }}>
              <span style={{ color: c.muted }}>{label}</span>
              <span style={{ color: c.dark, fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>

        {action === 'done' && result && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#EDF7F0', border: '2px solid #4A9A70', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 20px' }}>✓</div>
            <h2 style={{ fontFamily: fonts.heading, fontSize: 26, fontWeight: 400, color: c.dark, marginBottom: 10 }}>Booking Cancelled</h2>
            <p style={{ color: c.muted, fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>{result.message}</p>
            <p style={{ color: c.gold, fontSize: 13, fontWeight: 600, marginBottom: 28 }}>{result.refundLabel}</p>
            <button onClick={() => router.push('/booking')} style={{ background: c.dark, color: '#F5F0E8', border: 'none', padding: '13px 28px', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: fonts.body, borderRadius: 2 }}>
              Book Again
            </button>
          </div>
        )}

        {!canCancel && action !== 'done' && (
          <div style={{ background: '#FEF0EE', border: '1px solid #E8A89A', borderRadius: 6, padding: '16px 20px', textAlign: 'center' }}>
            <p style={{ color: '#8B3A2A', fontSize: 14, margin: 0 }}>
              This booking cannot be cancelled - it is already <strong>{booking.status}</strong>.
            </p>
          </div>
        )}

        {canCancel && action === 'choose' && (
          <div>
            <h2 style={{ fontFamily: fonts.heading, fontSize: 26, fontWeight: 400, color: c.dark, marginBottom: 8 }}>
              What would you like to do?
            </h2>
            <p style={{ color: c.muted, fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
              Choose to cancel your appointment or reschedule it to a different time.
            </p>
            {policy && (
              <div style={{
                background: policy.tier === 'early' ? '#EDF7F0' : policy.tier === 'mid' ? '#FFF8EC' : '#FEF0EE',
                border: `1px solid ${policy.tier === 'early' ? '#A8D5B5' : policy.tier === 'mid' ? '#F0C878' : '#E8A89A'}`,
                borderRadius: 6, padding: '14px 16px', marginBottom: 24,
              }}>
                <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: policy.tier === 'early' ? '#1A7A40' : policy.tier === 'mid' ? '#8B6A00' : '#8B3A2A', fontFamily: fonts.body }}>
                  Cancellation Policy - {policy.refundLabel}
                </p>
                <p style={{ margin: 0, fontSize: 13, color: c.muted, lineHeight: 1.6 }}>{policy.refundDetail}</p>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button onClick={() => setAction('cancel')}
                style={{ padding: '16px', background: 'transparent', border: '1.5px solid #C0402A', borderRadius: 4, cursor: 'pointer', fontFamily: fonts.body }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>✕</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#C0402A', marginBottom: 4 }}>Cancel Booking</div>
                <div style={{ fontSize: 12, color: c.muted }}>{policy?.refundLabel}</div>
              </button>
              <button onClick={() => router.push('/booking')}
                style={{ padding: '16px', background: c.dark, border: `1.5px solid ${c.dark}`, borderRadius: 4, cursor: 'pointer', fontFamily: fonts.body }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>📅</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#F5F0E8', marginBottom: 4 }}>Reschedule</div>
                <div style={{ fontSize: 12, color: '#9A8A72' }}>Book a new slot</div>
              </button>
            </div>
          </div>
        )}

        {canCancel && action === 'cancel' && (
          <div>
            <h2 style={{ fontFamily: fonts.heading, fontSize: 26, fontWeight: 400, color: c.dark, marginBottom: 8 }}>
              Confirm Cancellation
            </h2>
            <p style={{ color: c.muted, fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              Are you sure you want to cancel this appointment?
            </p>
            {policy?.canChoose && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: c.muted, marginBottom: 10 }}>
                  How would you like your deposit back?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                  {[
                    { value: 'refund', label: 'Full refund', sub: 'Returned to your M-Pesa within 2-3 days' },
                    { value: 'credit', label: 'Credit toward next booking', sub: 'Stored against your phone number' },
                  ].map(opt => (
                    <div key={opt.value} onClick={() => setRefundChoice(opt.value as any)}
                      style={{ padding: '14px 16px', background: refundChoice === opt.value ? '#EDF7F0' : c.card, border: `1.5px solid ${refundChoice === opt.value ? '#4A9A70' : c.border}`, borderRadius: 4, cursor: 'pointer' }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: c.dark, marginBottom: 2 }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: c.muted }}>{opt.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {error && (
              <div style={{ background: '#FEF0EE', border: '1px solid #E8A89A', borderRadius: 4, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#8B3A2A' }}>
                {error}
              </div>
            )}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setAction('choose')}
                style={{ flex: 1, padding: '13px', background: 'transparent', border: `1px solid ${c.border}`, borderRadius: 2, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: fonts.body, color: c.muted }}>
                Back
              </button>
              <button onClick={handleCancel} disabled={submitting}
                style={{ flex: 2, padding: '13px', background: '#C0402A', color: '#fff', border: 'none', borderRadius: 2, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: fonts.body, fontWeight: 600, opacity: submitting ? 0.6 : 1 }}>
                {submitting ? 'Cancelling...' : 'Yes, Cancel My Booking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}