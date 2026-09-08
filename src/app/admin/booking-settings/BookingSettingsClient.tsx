'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface BookingSettings {
  deposit_percent:              number
  travel_fee:                   number
  slot_hold_minutes:            number
  late_night_surcharge_percent: number
  late_grace_minutes:           number
  late_cancel_hours:            number
  owner_whatsapp:               string
  owner_email:                  string
  mpesa_till:                   string
  default_start_time:           string
  default_end_time:             string
  default_late_cutoff_time:     string
  default_late_end_time:        string
}

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

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: c.muted, fontWeight: 600, marginBottom: 6, fontFamily: fonts.body }}>
      {children}
    </label>
  )
}

function Input({ value, onChange, type = 'text', prefix, suffix }: {
  value: string | number
  onChange: (v: string) => void
  type?: string
  prefix?: string
  suffix?: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${c.border}`, borderRadius: 4, background: c.cream, overflow: 'hidden' }}>
      {prefix && (
        <span style={{ padding: '0 12px', color: c.muted, fontSize: 13, fontFamily: fonts.body, borderRight: `1px solid ${c.border}`, height: '100%', display: 'flex', alignItems: 'center', background: '#F0EBE1' }}>
          {prefix}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ flex: 1, padding: '11px 14px', border: 'none', background: 'transparent', fontSize: 14, color: c.dark, fontFamily: fonts.body, outline: 'none' }}
      />
      {suffix && (
        <span style={{ padding: '0 12px', color: c.muted, fontSize: 13, fontFamily: fonts.body, borderLeft: `1px solid ${c.border}`, background: '#F0EBE1' }}>
          {suffix}
        </span>
      )}
    </div>
  )
}

function SectionCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 6, marginBottom: 20 }}>
      <div style={{ padding: '18px 24px', borderBottom: `1px solid ${c.border}` }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500, color: c.dark, fontFamily: fonts.body }}>{title}</h3>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: c.muted, fontFamily: fonts.body }}>{description}</p>
      </div>
      <div style={{ padding: '20px 24px' }}>
        {children}
      </div>
    </div>
  )
}

export default function BookingSettingsClient() {
  const router = useRouter()
  const [settings, setSettings] = useState<BookingSettings>({
    deposit_percent:              30,
    travel_fee:                   0,
    slot_hold_minutes:            60,
    late_night_surcharge_percent: 15,
    late_grace_minutes:           15,
    late_cancel_hours:            4,
    owner_whatsapp:               '',
    owner_email:                  '',
    mpesa_till:                   '',
    default_start_time:           '09:00',
    default_end_time:             '20:00',
    default_late_cutoff_time:     '20:00',
    default_late_end_time:        '22:00',
  })
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    fetch('/api/admin/booking-settings')
      .then(r => {
        if (r.status === 401) { router.push('/admin/login'); return null }
        return r.json()
      })
      .then(d => {
        if (d?.settings) setSettings(prev => ({
          ...prev,
          ...d.settings,
          mpesa_till:               d.settings.mpesa_till ?? '',
          default_start_time:       d.settings.default_start_time ?? prev.default_start_time,
          default_end_time:         d.settings.default_end_time ?? prev.default_end_time,
          default_late_cutoff_time: d.settings.default_late_cutoff_time ?? '',
          default_late_end_time:    d.settings.default_late_end_time ?? '',
        }))
      })
      .catch(() => setError('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [router])

  async function handleSave() {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch('/api/admin/booking-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to save settings'); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function set(field: keyof BookingSettings, value: string | number) {
    setSettings(s => ({ ...s, [field]: value }))
    setSaved(false)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.body }}>
        <p style={{ color: c.muted }}>Loading settings...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: c.bg, fontFamily: fonts.body }}>

      {/* Nav */}
      <nav style={{ background: c.dark, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => router.push('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <span style={{ fontSize: 16, fontWeight: 400, color: c.gold, fontFamily: fonts.heading }}>Luxe Nails</span>
            <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#9A8A72', marginLeft: 8, fontFamily: fonts.body }}>Admin Panel</span>
          </button>
        </div>
        <button onClick={() => router.push('/admin')}
          style={{ background: 'none', border: '1px solid #5A4A3A', color: '#9A8A72', padding: '6px 16px', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: fonts.body, borderRadius: 2 }}>
          ← Dashboard
        </button>
      </nav>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: '0 0 6px', fontSize: 36, fontWeight: 400, color: c.dark, fontFamily: fonts.heading }}>
            Booking Settings
          </h1>
          <p style={{ margin: 0, color: c.muted, fontSize: 14 }}>
            Control deposits, fees, late night rules and notifications.
          </p>
        </div>

        {error && (
          <div style={{ background: '#FEF0EE', border: '1px solid #E8A89A', borderRadius: 4, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#8B3A2A' }}>
            {error}
          </div>
        )}

        {/* Deposit */}
        <SectionCard title="Deposit" description="How much customers pay upfront to secure their slot">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <Label>Deposit percentage</Label>
              <Input value={settings.deposit_percent} onChange={v => set('deposit_percent', Number(v))} type="number" suffix="%" />
              <p style={{ margin: '6px 0 0', fontSize: 11, color: c.muted }}>e.g. 30 = customer pays 30% upfront</p>
            </div>
            <div>
              <Label>Slot hold time</Label>
              <Input value={settings.slot_hold_minutes} onChange={v => set('slot_hold_minutes', Number(v))} type="number" suffix="min" />
              <p style={{ margin: '6px 0 0', fontSize: 11, color: c.muted }}>Slot auto-releases if no deposit paid</p>
            </div>
          </div>
        </SectionCard>

        {/* House calls */}
        <SectionCard title="House calls" description="Extra charge when the artist travels to the customer">
          <div style={{ maxWidth: 300 }}>
            <Label>Travel fee</Label>
            <Input value={settings.travel_fee} onChange={v => set('travel_fee', Number(v))} type="number" prefix="KSh" />
            <p style={{ margin: '6px 0 0', fontSize: 11, color: c.muted }}>Added to service price for house call bookings</p>
          </div>
        </SectionCard>

        {/* Late night */}
        <SectionCard title="Late night bookings" description="Rules for slots past the artist's normal cutoff time">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <Label>Late night surcharge</Label>
              <Input value={settings.late_night_surcharge_percent} onChange={v => set('late_night_surcharge_percent', Number(v))} type="number" suffix="%" />
              <p style={{ margin: '6px 0 0', fontSize: 11, color: c.muted }}>Added on top of service price</p>
            </div>
            <div>
              <Label>Cancellation cutoff</Label>
              <Input value={settings.late_cancel_hours} onChange={v => set('late_cancel_hours', Number(v))} type="number" suffix="hrs" />
              <p style={{ margin: '6px 0 0', fontSize: 11, color: c.muted }}>Cancel within this = no refund</p>
            </div>
          </div>
          <div style={{ maxWidth: 300 }}>
            <Label>Late arrival grace period</Label>
            <Input value={settings.late_grace_minutes} onChange={v => set('late_grace_minutes', Number(v))} type="number" suffix="min" />
            <p style={{ margin: '6px 0 0', fontSize: 11, color: c.muted }}>Arrive later than this = no refund</p>
          </div>
        </SectionCard>

        {/* Opening hours */}
        <SectionCard
          title="Opening hours"
          description="Applies to every date. Override individual days per artist under Artist Schedules."
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <Label>Opens</Label>
              <Input type="time" value={settings.default_start_time} onChange={v => set('default_start_time', v)} />
            </div>
            <div>
              <Label>Normal hours end</Label>
              <Input type="time" value={settings.default_end_time} onChange={v => set('default_end_time', v)} />
            </div>
            <div>
              <Label>Late night starts</Label>
              <Input type="time" value={settings.default_late_cutoff_time} onChange={v => set('default_late_cutoff_time', v)} />
              <p style={{ margin: '6px 0 0', fontSize: 11, color: c.muted }}>Bookings from this time carry the surcharge and need your approval. Leave blank to switch late night off.</p>
            </div>
            <div>
              <Label>Last booking starts</Label>
              <Input type="time" value={settings.default_late_end_time} onChange={v => set('default_late_end_time', v)} />
              <p style={{ margin: '6px 0 0', fontSize: 11, color: c.muted }}>The latest an appointment may start. Long services will run past it.</p>
            </div>
          </div>
        </SectionCard>

        {/* Payment */}
        <SectionCard title="Payment" description="Shown to customers on the deposit and payment pages">
          <div>
            <Label>M-Pesa till number</Label>
            <Input value={settings.mpesa_till} onChange={v => set('mpesa_till', v)} />
            <p style={{ margin: '6px 0 0', fontSize: 11, color: c.muted }}>
              Buy Goods &amp; Services till. Leave blank to ask customers to request it on WhatsApp instead.
            </p>
          </div>
        </SectionCard>

        {/* Notifications */}
        <SectionCard title="Owner notifications" description="Where to send booking alerts">
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
            <div>
              <Label>Owner email</Label>
              <Input value={settings.owner_email} onChange={v => set('owner_email', v)} type="email" />
              <p style={{ margin: '6px 0 0', fontSize: 11, color: c.muted }}>Gets emailed on every new booking</p>
            </div>
            <div>
              <Label>Owner WhatsApp</Label>
              <Input value={settings.owner_whatsapp} onChange={v => set('owner_whatsapp', v)} prefix="+" />
              <p style={{ margin: '6px 0 0', fontSize: 11, color: c.muted }}>Format: 254758550286 (no + or spaces)</p>
            </div>
          </div>
        </SectionCard>

        {/* Preview */}
        <div style={{ background: '#FFF8EC', border: '1px solid #E8D48A', borderRadius: 6, padding: '16px 20px', marginBottom: 24 }}>
          <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#8B6A00', fontFamily: fonts.body }}>
            Live preview
          </p>
          <p style={{ margin: 0, fontSize: 13, color: c.dark, lineHeight: 1.8, fontFamily: fonts.body }}>
            Classic Manicure (KSh 800) → deposit: <strong>KSh {Math.round(800 * settings.deposit_percent / 100)}</strong><br />
            House call surcharge: <strong>KSh {settings.travel_fee}</strong> → deposit: <strong>KSh {Math.round((800 + Number(settings.travel_fee)) * settings.deposit_percent / 100)}</strong><br />
            Late night (after cutoff): <strong>+{settings.late_night_surcharge_percent}%</strong> surcharge → deposit: <strong>KSh {Math.round(800 * (1 + settings.late_night_surcharge_percent / 100) * settings.deposit_percent / 100)}</strong>
          </p>
        </div>

        {/* Save button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ background: c.dark, color: '#F5F0E8', border: 'none', padding: '13px 32px', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' as const, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: fonts.body, fontWeight: 600, borderRadius: 2, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {saved && (
            <span style={{ fontSize: 13, color: '#1A7A40', fontFamily: fonts.body }}>
              ✓ Settings saved
            </span>
          )}
        </div>

      </div>
    </div>
  )
}