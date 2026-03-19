'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

type BookingStatus =
  | 'pending_approval'
  | 'pending_payment'
  | 'payment_submitted'
  | 'confirmed'
  | 'declined'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'expired'

interface Booking {
  id: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  service_id: string
  artist_id: number | null
  booking_date: string
  start_time: string
  end_time: string
  location_type: 'in_shop' | 'house_call'
  house_call_address: string | null
  service_price: number
  travel_fee: number
  late_night_surcharge: number
  deposit_amount: number
  is_late_night: boolean
  status: BookingStatus
  booking_source: string
  deposit_mpesa_ref: string | null
  deposit_paid_at: string | null
  admin_notes: string | null
  expires_at: string
  created_at: string
  services?: { name: string }
  artists?: { name: string }
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

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<BookingStatus, { label: string; bg: string; color: string }> = {
  pending_approval:  { label: 'Pending Approval',  bg: '#FFF8EC', color: '#B8963E' },
  pending_payment:   { label: 'Pending Payment',   bg: '#EFF7FF', color: '#2563A8' },
  payment_submitted: { label: 'Payment Submitted', bg: '#FFF0F9', color: '#9333A8' },
  confirmed:         { label: 'Confirmed',          bg: '#EDF7F0', color: '#1A7A40' },
  declined:          { label: 'Declined',           bg: '#FEF0EE', color: '#C0402A' },
  completed:         { label: 'Completed',          bg: '#F0F0F0', color: '#555555' },
  cancelled:         { label: 'Cancelled',          bg: '#FEF0EE', color: '#C0402A' },
  no_show:           { label: 'No Show',            bg: '#FEF0EE', color: '#C0402A' },
  expired:           { label: 'Expired',            bg: '#F5F5F5', color: '#999999' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-KE', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
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

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, bg: '#F0F0F0', color: '#555' }
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
      background: cfg.bg, color: cfg.color,
      fontFamily: fonts.body,
    }}>
      {cfg.label}
    </span>
  )
}

// ─── Booking Detail Modal ─────────────────────────────────────────────────────

function BookingModal({
  booking,
  onClose,
  onAction,
  actionLoading,
}: {
  booking: Booking
  onClose: () => void
  onAction: (action: string, bookingId: string, notes?: string) => void
  actionLoading: string | null
}) {
  const [notes, setNotes] = useState(booking.admin_notes ?? '')
  const total = Number(booking.service_price) + Number(booking.travel_fee) + Number(booking.late_night_surcharge)

  const waPhone = booking.customer_phone.replace(/^0/, '254').replace(/[\s\-]/g, '')

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(44,26,14,0.5)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: c.card, borderRadius: 8, width: '100%', maxWidth: 560,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(44,26,14,0.2)',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: c.dark, padding: '20px 24px', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: 0, fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: c.gold, fontFamily: fonts.body }}>
              Booking Details
            </p>
            <h3 style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 400, color: '#F5F0E8', fontFamily: fonts.heading }}>
              {booking.customer_name}
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <StatusBadge status={booking.status} />
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9A8A72', cursor: 'pointer', fontSize: 20, padding: 4 }}>✕</button>
          </div>
        </div>

        <div style={{ padding: '24px' }}>

          {/* Customer info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <a href={`tel:${booking.customer_phone}`} style={{ display: 'block', padding: '12px 14px', background: c.bg, borderRadius: 6, textDecoration: 'none' }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: c.muted, fontFamily: fonts.body, marginBottom: 4 }}>Phone</div>
              <div style={{ fontSize: 14, color: c.dark, fontFamily: fonts.body, fontWeight: 500 }}>{booking.customer_phone}</div>
            </a>
            <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noreferrer"
              style={{ display: 'block', padding: '12px 14px', background: '#EDF7F0', borderRadius: 6, textDecoration: 'none' }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1A7A40', fontFamily: fonts.body, marginBottom: 4 }}>WhatsApp</div>
              <div style={{ fontSize: 14, color: '#1A7A40', fontFamily: fonts.body, fontWeight: 500 }}>Open Chat →</div>
            </a>
          </div>

          {/* Booking details */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
            {[
              ['Service',  booking.services?.name ?? '—'],
              ['Artist',   booking.artists?.name ?? 'Owner assigns'],
              ['Date',     formatDate(booking.booking_date)],
              ['Time',     formatTime(booking.start_time)],
              ['Location', booking.location_type === 'house_call'
                ? `House call — ${booking.house_call_address}`
                : 'At the studio'],
              ['Source',   booking.booking_source],
              ...(booking.is_late_night ? [['Type', '🌙 Late night']] : []),
            ].map(([label, value]) => (
              <tr key={label}>
                <td style={{ padding: '8px 0', borderBottom: `1px solid ${c.border}`, fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: c.muted, fontFamily: fonts.body, width: '35%' }}>{label}</td>
                <td style={{ padding: '8px 0', borderBottom: `1px solid ${c.border}`, fontSize: 13, color: c.dark, fontFamily: fonts.body }}>{value}</td>
              </tr>
            ))}
          </table>

          {/* Pricing */}
          <div style={{ background: c.bg, borderRadius: 6, padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: c.muted, fontFamily: fonts.body, marginBottom: 10 }}>Pricing</div>
            {[
              ['Service price', kes(booking.service_price)],
              ...(Number(booking.travel_fee) > 0 ? [['Travel fee', kes(booking.travel_fee)]] : []),
              ...(Number(booking.late_night_surcharge) > 0 ? [['Late night', kes(booking.late_night_surcharge)]] : []),
              ['Total', kes(total)],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, fontFamily: fonts.body }}>
                <span style={{ color: c.muted }}>{label}</span>
                <span style={{ color: c.dark }}>{value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${c.border}`, paddingTop: 8, marginTop: 4 }}>
              <span style={{ fontSize: 13, fontFamily: fonts.body, color: c.muted }}>Deposit (30%)</span>
              <span style={{ fontSize: 15, fontFamily: fonts.body, color: c.gold, fontWeight: 600 }}>{kes(booking.deposit_amount)}</span>
            </div>
          </div>

          {/* M-Pesa ref */}
          {booking.deposit_mpesa_ref && (
            <div style={{ background: '#EDF7F0', border: '1px solid #A8D5B5', borderRadius: 6, padding: '12px 16px', marginBottom: 20 }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1A7A40', fontFamily: fonts.body, marginBottom: 4 }}>M-Pesa Reference</div>
              <div style={{ fontSize: 16, fontFamily: 'monospace', color: c.dark, letterSpacing: '0.05em', fontWeight: 600 }}>{booking.deposit_mpesa_ref}</div>
              {booking.deposit_paid_at && (
                <div style={{ fontSize: 11, color: '#1A7A40', marginTop: 4, fontFamily: fonts.body }}>
                  Confirmed {new Date(booking.deposit_paid_at).toLocaleString('en-KE')}
                </div>
              )}
            </div>
          )}

          {/* Admin notes */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: c.muted, fontFamily: fonts.body, marginBottom: 6 }}>
              Admin Notes
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add internal notes..."
              rows={3}
              style={{ width: '100%', padding: '10px 12px', border: `1px solid ${c.border}`, borderRadius: 4, fontSize: 13, fontFamily: fonts.body, color: c.dark, background: c.cream, resize: 'vertical', boxSizing: 'border-box' as const, outline: 'none' }}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {booking.status === 'payment_submitted' && (
              <>
                <button
                  onClick={() => onAction('confirm', booking.id, notes)}
                  disabled={actionLoading === booking.id}
                  style={{ flex: 1, minWidth: 140, padding: '11px 16px', background: '#1A7A40', color: '#fff', border: 'none', borderRadius: 4, fontSize: 11, fontFamily: fonts.body, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer' }}>
                  {actionLoading === booking.id ? 'Confirming...' : '✓ Confirm Booking'}
                </button>
                <button
                  onClick={() => onAction('confirm-payment', booking.id, notes)}
                  disabled={actionLoading === booking.id}
                  style={{ flex: 1, minWidth: 140, padding: '11px 16px', background: c.gold, color: '#fff', border: 'none', borderRadius: 4, fontSize: 11, fontFamily: fonts.body, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer' }}>
                  ✓ Verify Payment
                </button>
              </>
            )}
            {booking.status === 'pending_approval' && (
              <button
                onClick={() => onAction('confirm', booking.id, notes)}
                disabled={actionLoading === booking.id}
                style={{ flex: 1, padding: '11px 16px', background: c.gold, color: '#fff', border: 'none', borderRadius: 4, fontSize: 11, fontFamily: fonts.body, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer' }}>
                {actionLoading === booking.id ? 'Approving...' : '✓ Approve Late Request'}
              </button>
            )}
            {booking.status === 'confirmed' && (
              <button
                onClick={() => onAction('complete', booking.id, notes)}
                disabled={actionLoading === booking.id}
                style={{ flex: 1, padding: '11px 16px', background: c.dark, color: '#F5F0E8', border: 'none', borderRadius: 4, fontSize: 11, fontFamily: fonts.body, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer' }}>
                {actionLoading === booking.id ? 'Updating...' : '✓ Mark Completed'}
              </button>
            )}
            {['confirmed', 'pending_payment', 'payment_submitted', 'pending_approval'].includes(booking.status) && (
              <>
                <button
                  onClick={() => onAction('no-show', booking.id, notes)}
                  disabled={actionLoading === booking.id}
                  style={{ flex: 1, minWidth: 120, padding: '11px 16px', background: 'transparent', color: '#C0402A', border: '1px solid #C0402A', borderRadius: 4, fontSize: 11, fontFamily: fonts.body, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer' }}>
                  No Show
                </button>
                <button
                  onClick={() => onAction('decline', booking.id, notes)}
                  disabled={actionLoading === booking.id}
                  style={{ flex: 1, minWidth: 120, padding: '11px 16px', background: 'transparent', color: c.muted, border: `1px solid ${c.border}`, borderRadius: 4, fontSize: 11, fontFamily: fonts.body, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, cursor: 'pointer' }}>
                  Decline
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BookingsClient() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/bookings')
      if (res.status === 401) { router.push('/admin/login'); return }
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to load bookings'); return }
      setBookings(data.bookings ?? [])
    } catch {
      setError('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  async function handleAction(action: string, bookingId: string, notes?: string) {
    setActionLoading(bookingId)
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/${action}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: notes }),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.error ?? 'Action failed'); return }
      setSelectedBooking(null)
      await fetchBookings()
    } catch {
      alert('Something went wrong')
    } finally {
      setActionLoading(null)
    }
  }

  // ── Filter bookings ──────────────────────────────────────────────────────────
  const filtered = bookings.filter(b => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter
    const matchesSearch = !search || [b.customer_name, b.customer_phone, b.services?.name ?? '']
      .some(v => v.toLowerCase().includes(search.toLowerCase()))
    return matchesStatus && matchesSearch
  })

  // ── Count by status for filter badges ────────────────────────────────────────
  const counts: Record<string, number> = { all: bookings.length }
  bookings.forEach(b => { counts[b.status] = (counts[b.status] ?? 0) + 1 })

  const needsAttention = (counts['payment_submitted'] ?? 0) + (counts['pending_approval'] ?? 0)

  return (
    <div style={{ minHeight: '100vh', background: c.bg, fontFamily: fonts.body }}>

      {/* ── Nav ── */}
      <nav style={{ background: c.dark, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => router.push('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <span style={{ fontSize: 16, fontWeight: 400, color: c.gold, fontFamily: fonts.heading }}>Luxe Nails</span>
            <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9A8A72', marginLeft: 8, fontFamily: fonts.body }}>Admin Panel</span>
          </button>
        </div>
        <button
          onClick={() => router.push('/admin')}
          style={{ background: 'none', border: `1px solid #5A4A3A`, color: '#9A8A72', padding: '6px 16px', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: fonts.body, borderRadius: 2 }}>
          ← Dashboard
        </button>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <h1 style={{ margin: '0 0 6px', fontSize: 36, fontWeight: 400, color: c.dark, fontFamily: fonts.heading }}>
              Bookings
              {needsAttention > 0 && (
                <span style={{ marginLeft: 12, background: c.gold, color: '#fff', fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 20, fontFamily: fonts.body, verticalAlign: 'middle' }}>
                  {needsAttention} need attention
                </span>
              )}
            </h1>
            <p style={{ margin: 0, color: c.muted, fontSize: 14 }}>
              Manage all appointments from here.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => router.push('/admin/bookings/new')}
              style={{ background: c.gold, color: '#fff', border: 'none', padding: '8px 18px', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: fonts.body, borderRadius: 2 }}>
              + New Booking
            </button>
            <button
              onClick={fetchBookings}
              style={{ background: 'transparent', border: `1px solid ${c.border}`, color: c.muted, padding: '8px 16px', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: fonts.body, borderRadius: 2 }}>
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* ── Search ── */}
        <div style={{ marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Search by name, phone or service..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '11px 16px', border: `1px solid ${c.border}`, borderRadius: 4, fontSize: 14, fontFamily: fonts.body, color: c.dark, background: c.card, outline: 'none', boxSizing: 'border-box' as const }}
          />
        </div>

        {/* ── Status filters ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {[
            { key: 'all',               label: 'All' },
            { key: 'pending_approval',  label: '🌙 Late Requests' },
            { key: 'payment_submitted', label: '💳 Payment Submitted' },
            { key: 'pending_payment',   label: 'Pending Payment' },
            { key: 'confirmed',         label: 'Confirmed' },
            { key: 'completed',         label: 'Completed' },
            { key: 'cancelled',         label: 'Cancelled' },
            { key: 'no_show',           label: 'No Show' },
            { key: 'expired',           label: 'Expired' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                fontFamily: fonts.body, fontWeight: statusFilter === f.key ? 600 : 400,
                background: statusFilter === f.key ? c.dark : c.card,
                color: statusFilter === f.key ? '#F5F0E8' : c.muted,
                border: `1px solid ${statusFilter === f.key ? c.dark : c.border}`,
                transition: 'all 0.15s',
              }}>
              {f.label} {counts[f.key] ? `(${counts[f.key]})` : ''}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: c.muted, fontSize: 14 }}>
            Loading bookings...
          </div>
        ) : error ? (
          <div style={{ background: '#FEF0EE', border: '1px solid #E8A89A', borderRadius: 4, padding: '14px 18px', color: '#8B3A2A', fontSize: 13 }}>
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: c.muted }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
            <p style={{ margin: 0, fontSize: 15 }}>No bookings found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(booking => (
              <div
                key={booking.id}
                onClick={() => setSelectedBooking(booking)}
                style={{
                  background: c.card, border: `1px solid ${c.border}`,
                  borderRadius: 6, padding: '16px 20px', cursor: 'pointer',
                  display: 'grid', gridTemplateColumns: '1fr auto',
                  gap: 16, alignItems: 'center',
                  borderLeft: booking.status === 'payment_submitted' ? `3px solid ${c.gold}` :
                              booking.status === 'pending_approval' ? `3px solid #B8963E` :
                              booking.status === 'confirmed' ? `3px solid #1A7A40` :
                              `3px solid transparent`,
                  transition: 'box-shadow 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(44,26,14,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '4px 20px' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: c.dark, fontFamily: fonts.body }}>{booking.customer_name}</div>
                    <div style={{ fontSize: 12, color: c.muted }}>{booking.customer_phone}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: c.dark, fontFamily: fonts.body }}>{booking.services?.name ?? '—'}</div>
                    <div style={{ fontSize: 12, color: c.muted }}>{booking.artists?.name ?? 'Owner assigns'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: c.dark }}>{formatDate(booking.booking_date)}</div>
                    <div style={{ fontSize: 12, color: c.muted }}>{formatTime(booking.start_time)}{booking.is_late_night ? ' 🌙' : ''}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: c.gold, fontWeight: 600 }}>{kes(booking.deposit_amount)}</div>
                    <div style={{ fontSize: 12, color: c.muted }}>{booking.location_type === 'house_call' ? '🚗 House call' : '🏠 Studio'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <StatusBadge status={booking.status} />
                  {booking.deposit_mpesa_ref && (
                    <span style={{ fontSize: 10, color: '#1A7A40', fontFamily: 'monospace' }}>{booking.deposit_mpesa_ref}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onAction={handleAction}
          actionLoading={actionLoading}
        />
      )}
    </div>
  )
}