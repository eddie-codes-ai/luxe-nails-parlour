'use client'

import type { PaymentSettings } from '@/lib/payment-settings'

import { useState } from 'react'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Booking {
  id: string
  customer_name: string
  customer_phone: string
  booking_date: string
  start_time: string
  location_type: 'in_shop' | 'house_call'
  house_call_address: string | null
  service_price: number
  travel_fee: number
  late_night_surcharge: number
  deposit_amount: number
  is_late_night: boolean
  status: string
  deposit_mpesa_ref: string | null
  services?: { name: string } | null
  artists?: { name: string } | null
}

interface Props {
  booking: Booking
  payment: PaymentSettings
}

// ── Tokens ────────────────────────────────────────────────────────────────────

const fonts = {
  heading: "'Cormorant Garamond', Georgia, serif",
  body: "'Jost', 'Helvetica Neue', sans-serif",
}

const colors = {
  cream: '#FDFBF7',
  espresso: '#2D2424',
  gold: '#C5A358',
  sand: '#E5E0D8',
  bg: '#F5F0E8',
  green: '#1A7A40',
  greenBg: '#EDF7F0',
  greenBorder: '#A8D5B5',
  red: '#C0402A',
  redBg: '#FEF0EE',
  redBorder: '#E8A89A',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Component ─────────────────────────────────────────────────────────────────

export default function PayClient({ booking, payment }: Props) {
  const [mpesaRef, setMpesaRef]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [error, setError]           = useState('')
  const [copied, setCopied]         = useState(false)

  const total =
    Number(booking.service_price) +
    Number(booking.travel_fee) +
    Number(booking.late_night_surcharge)

  const isAlreadyPaid =
    booking.status === 'payment_submitted' ||
    booking.status === 'confirmed' ||
    booking.status === 'completed'

  const isCancelled =
    booking.status === 'cancelled' ||
    booking.status === 'declined' ||
    booking.status === 'expired' ||
    booking.status === 'no_show'

  // ── Copy till number ────────────────────────────────────────────────────────
  function copyTill() {
    if (!payment.mpesaTill) return
    navigator.clipboard.writeText(payment.mpesaTill).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // ── Submit M-Pesa ref ───────────────────────────────────────────────────────
  async function handleSubmit() {
    const clean = mpesaRef.trim().toUpperCase()
    if (!clean) { setError('Please enter your M-Pesa reference number.'); return }
    if (clean.length < 8) { setError('M-Pesa reference numbers are at least 8 characters (e.g. QHG7X1ABCD).'); return }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/bookings/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, mpesa_ref: clean }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong. Please try again.'); return }
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Already submitted / confirmed state ─────────────────────────────────────
  if (submitted || isAlreadyPaid) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: colors.bg, fontFamily: fonts.body, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
          <h1 style={{ fontFamily: fonts.heading, fontSize: '2.2rem', fontWeight: 300, color: colors.espresso, margin: '0 0 12px' }}>
            Payment Received
          </h1>
          <p style={{ fontSize: '0.95rem', color: colors.espresso, opacity: 0.7, lineHeight: 1.7, margin: '0 0 32px' }}>
            Thank you, <strong>{booking.customer_name}</strong>! We've received your M-Pesa reference and will verify your payment shortly. You'll hear from us on WhatsApp once confirmed.
          </p>
          <div style={{ background: colors.greenBg, border: `1px solid ${colors.greenBorder}`, borderRadius: '6px', padding: '16px 20px', marginBottom: '24px', textAlign: 'left' }}>
            <p style={{ margin: '0 0 4px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.green, fontWeight: 600 }}>Your Appointment</p>
            <p style={{ margin: 0, fontSize: '0.95rem', color: colors.espresso, fontWeight: 600 }}>{booking.services?.name}</p>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: colors.espresso, opacity: 0.7 }}>
              {formatDate(booking.booking_date)} at {formatTime(booking.start_time)}
            </p>
          </div>
          <Link
            href="/"
            style={{ display: 'inline-block', backgroundColor: colors.gold, color: colors.espresso, padding: '13px 32px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none' }}
          >
            Back to Home
          </Link>
        </div>
      </main>
    )
  }

  // ── Cancelled / expired state ────────────────────────────────────────────────
  if (isCancelled) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: colors.bg, fontFamily: fonts.body, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>❌</div>
          <h1 style={{ fontFamily: fonts.heading, fontSize: '2.2rem', fontWeight: 300, color: colors.espresso, margin: '0 0 12px' }}>
            Booking {booking.status === 'expired' ? 'Expired' : 'Cancelled'}
          </h1>
          <p style={{ fontSize: '0.95rem', color: colors.espresso, opacity: 0.7, lineHeight: 1.7, margin: '0 0 32px' }}>
            This payment link is no longer active. Please contact us to make a new booking.
          </p>
          <Link
            href="/booking"
            style={{ display: 'inline-block', backgroundColor: colors.gold, color: colors.espresso, padding: '13px 32px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none' }}
          >
            Book Again
          </Link>
        </div>
      </main>
    )
  }

  // ── Main payment page ────────────────────────────────────────────────────────
  return (
    <main style={{ minHeight: '100vh', backgroundColor: colors.bg, fontFamily: fonts.body }}>

      {/* ── Header ── */}
      <header style={{ backgroundColor: colors.espresso, padding: '20px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: fonts.heading, fontSize: '1.5rem', fontWeight: 400, color: colors.gold, margin: 0 }}>
          Luxe Nails Parlour
        </p>
      </header>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* ── Page title ── */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: colors.gold, fontWeight: 600, marginBottom: '8px' }}>
            Secure Your Appointment
          </p>
          <h1 style={{ fontFamily: fonts.heading, fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 300, color: colors.espresso, margin: '0 0 10px' }}>
            Complete Payment
          </h1>
          <p style={{ fontSize: '0.9rem', color: colors.espresso, opacity: 0.6, margin: 0 }}>
            Hi {booking.customer_name.split(' ')[0]} 👋 — pay your deposit below to confirm your booking.
          </p>
        </div>

        {/* ── Booking Summary ── */}
        <div style={{ background: '#fff', border: `1px solid ${colors.sand}`, borderRadius: '6px', padding: '24px', marginBottom: '20px' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: colors.gold, fontWeight: 700, marginBottom: '16px', margin: '0 0 16px' }}>
            Booking Summary
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            {[
              ['Service',  booking.services?.name ?? '—'],
              ['Artist',   booking.artists?.name  ?? 'Owner assigns'],
              ['Date',     formatDate(booking.booking_date)],
              ['Time',     formatTime(booking.start_time) + (booking.is_late_night ? ' 🌙' : '')],
              ['Location', booking.location_type === 'house_call'
                ? `House call — ${booking.house_call_address}`
                : 'At the studio'],
            ].map(([label, value]) => (
              <tr key={label}>
                <td style={{ padding: '8px 0', borderBottom: `1px solid ${colors.sand}`, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.espresso, opacity: 0.5, width: '35%' }}>
                  {label}
                </td>
                <td style={{ padding: '8px 0', borderBottom: `1px solid ${colors.sand}`, fontSize: '0.88rem', color: colors.espresso, fontWeight: 500 }}>
                  {value}
                </td>
              </tr>
            ))}
          </table>

          {/* Pricing breakdown */}
          <div style={{ background: colors.bg, borderRadius: '4px', padding: '14px 16px', marginTop: '16px' }}>
            {Number(booking.service_price) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: colors.espresso, opacity: 0.6 }}>Service</span>
                <span style={{ color: colors.espresso }}>{kes(booking.service_price)}</span>
              </div>
            )}
            {Number(booking.travel_fee) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: colors.espresso, opacity: 0.6 }}>Travel fee</span>
                <span style={{ color: colors.espresso }}>{kes(booking.travel_fee)}</span>
              </div>
            )}
            {Number(booking.late_night_surcharge) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: colors.espresso, opacity: 0.6 }}>Late night surcharge</span>
                <span style={{ color: colors.espresso }}>{kes(booking.late_night_surcharge)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '10px', paddingTop: '8px', borderTop: `1px solid ${colors.sand}` }}>
              <span style={{ color: colors.espresso, opacity: 0.6 }}>Total</span>
              <span style={{ color: colors.espresso }}>{kes(total)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.gold, fontWeight: 700 }}>
                Deposit Due Now
              </span>
              <span style={{ fontFamily: fonts.heading, fontSize: '1.8rem', fontWeight: 300, color: colors.espresso }}>
                {kes(booking.deposit_amount)}
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: colors.espresso, opacity: 0.45, textAlign: 'right' }}>
              Balance of {kes(total - Number(booking.deposit_amount))} due on the day
            </p>
          </div>
        </div>

        {/* ── M-Pesa Instructions ── */}
        <div style={{ background: '#fff', border: `1px solid ${colors.sand}`, borderRadius: '6px', padding: '24px', marginBottom: '20px' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: colors.gold, fontWeight: 700, margin: '0 0 16px' }}>
            How to Pay via M-Pesa
          </p>

          {!payment.mpesaTill ? (
            /* No till configured yet — never show fake payment steps. */
            <div style={{ background: colors.bg, border: `1px solid ${colors.sand}`, borderRadius: '6px', padding: '16px 20px' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: colors.espresso, lineHeight: 1.6 }}>
                Our M-Pesa details are not published online yet. Message us{' '}
                {payment.whatsapp ? (
                  <a href={`https://wa.me/${payment.whatsapp}`} style={{ color: colors.gold, textDecoration: 'none', fontWeight: 600 }}>
                    on WhatsApp
                  </a>
                ) : 'on WhatsApp'}{' '}
                and we will send you the till number for your{' '}
                <strong>{kes(booking.deposit_amount)}</strong> deposit.
              </p>
            </div>
          ) : (
          <>

          {/* Steps */}
          {[
            ['1', 'Go to M-Pesa on your phone'],
            ['2', 'Select Lipa na M-Pesa → Buy Goods & Services'],
            ['3', `Enter Till Number: ${payment.mpesaTill}`],
            ['4', `Enter amount: KSh ${Number(booking.deposit_amount).toLocaleString()}`],
            ['5', 'Enter your M-Pesa PIN and confirm'],
            ['6', 'Copy the confirmation code below and paste it here'],
          ].map(([step, text]) => (
            <div key={step} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                backgroundColor: colors.gold, color: colors.espresso,
                fontSize: '0.7rem', fontWeight: 700, display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {step}
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: colors.espresso, lineHeight: 1.5, paddingTop: '3px' }}>
                {text}
              </p>
            </div>
          ))}

          {/* Till number copy box */}
          <div style={{ background: colors.bg, border: `2px solid ${colors.gold}`, borderRadius: '6px', padding: '16px 20px', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.espresso, opacity: 0.5 }}>
                Till Number
              </p>
              <p style={{ margin: 0, fontSize: '1.6rem', fontFamily: 'monospace', fontWeight: 700, color: colors.espresso, letterSpacing: '0.08em' }}>
                {payment.mpesaTill}
              </p>
            </div>
            <button
              onClick={copyTill}
              style={{
                backgroundColor: copied ? colors.green : colors.gold,
                color: copied ? '#fff' : colors.espresso,
                border: 'none', borderRadius: '4px',
                padding: '10px 20px', fontSize: '0.78rem',
                fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase', cursor: 'pointer',
                transition: 'all 0.2s', fontFamily: fonts.body,
                flexShrink: 0,
              }}
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>

          {/* Amount reminder */}
          <div style={{ background: colors.bg, borderRadius: '6px', padding: '12px 16px', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.espresso, opacity: 0.5 }}>
              Amount to send
            </span>
            <span style={{ fontFamily: fonts.heading, fontSize: '1.4rem', fontWeight: 300, color: colors.espresso }}>
              {kes(booking.deposit_amount)}
            </span>
          </div>
          </>
          )}
        </div>

        {/* ── Submit M-Pesa Reference ── */}
        <div style={{ background: '#fff', border: `1px solid ${colors.sand}`, borderRadius: '6px', padding: '24px', marginBottom: '20px' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: colors.gold, fontWeight: 700, margin: '0 0 6px' }}>
            Confirm Your Payment
          </p>
          <p style={{ fontSize: '0.85rem', color: colors.espresso, opacity: 0.6, margin: '0 0 16px', lineHeight: 1.6 }}>
            After paying, M-Pesa will send you a confirmation SMS with a code like <strong>QHG7X1ABCD</strong>. Enter it below.
          </p>

          {error && (
            <div style={{ background: colors.redBg, border: `1px solid ${colors.redBorder}`, borderRadius: '4px', padding: '10px 14px', marginBottom: '14px', fontSize: '0.85rem', color: colors.red }}>
              {error}
            </div>
          )}

          <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.espresso, opacity: 0.5, marginBottom: '8px', fontWeight: 600 }}>
            M-Pesa Reference Number
          </label>
          <input
            type="text"
            value={mpesaRef}
            onChange={e => { setMpesaRef(e.target.value.toUpperCase()); setError('') }}
            placeholder="e.g. QHG7X1ABCD"
            maxLength={20}
            style={{
              width: '100%', padding: '12px 16px',
              fontSize: '1rem', fontFamily: 'monospace',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              border: `1px solid ${colors.sand}`, borderRadius: '4px',
              background: colors.cream, color: colors.espresso,
              outline: 'none', boxSizing: 'border-box',
              marginBottom: '16px',
            }}
          />

          <button
            onClick={handleSubmit}
            disabled={submitting || !mpesaRef.trim()}
            style={{
              width: '100%', padding: '14px',
              backgroundColor: submitting || !mpesaRef.trim() ? colors.sand : colors.espresso,
              color: submitting || !mpesaRef.trim() ? colors.espresso : colors.cream,
              border: 'none', borderRadius: '2px',
              fontFamily: fonts.body, fontSize: '0.85rem',
              fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', cursor: submitting || !mpesaRef.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.25s', opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Submitting...' : "I've Paid — Confirm My Booking"}
          </button>
        </div>

        {/* ── Help ── */}
        {payment.whatsapp && (
          <p style={{ textAlign: 'center', fontSize: '0.82rem', color: colors.espresso, opacity: 0.5, lineHeight: 1.7 }}>
            Having trouble? WhatsApp us at{' '}
            <a
              href={`https://wa.me/${payment.whatsapp}`}
              style={{ color: colors.gold, textDecoration: 'none', fontWeight: 600 }}
            >
              +{payment.whatsapp}
            </a>{' '}
            and we&apos;ll help you out.
          </p>
        )}

      </div>
    </main>
  )
}