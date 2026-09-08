'use client'

// Lets a customer who was booked over WhatsApp choose their own service and
// add-ons before paying. Only services that fit the reserved slot are offered,
// so the artist's schedule stays intact whatever they pick.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AddOn { name: string; price: number }

interface Service {
  id: string
  name: string
  description?: string | null
  base_price: number
  duration_minutes: number
  add_ons?: AddOn[] | null
}

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
}

const kes = (n: number) => `KSh ${Number(n).toLocaleString('en-KE')}`

export default function SelectServiceClient({ bookingId }: { bookingId: string }) {
  const router = useRouter()

  const [loading, setLoading]   = useState(true)
  const [services, setServices] = useState<Service[]>([])
  const [chosen, setChosen]     = useState<string>('')
  const [addOns, setAddOns]     = useState<string[]>([])
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    fetch(`/api/bookings/${bookingId}/select`)
      .then(r => r.json())
      .then(d => {
        if (d?.selectable) {
          setServices(d.services ?? [])
          setChosen(d.current_service_id ?? '')
        }
      })
      .catch(() => setError('Could not load services. Please refresh.'))
      .finally(() => setLoading(false))
  }, [bookingId])

  const service = services.find(s => s.id === chosen)
  const available: AddOn[] = Array.isArray(service?.add_ons) ? service.add_ons : []
  const addOnsTotal = available
    .filter(a => addOns.includes(a.name))
    .reduce((sum, a) => sum + Number(a.price ?? 0), 0)

  // Add-ons belong to a specific service, so clear them when the service changes.
  function pickService(id: string) {
    setChosen(id)
    setAddOns([])
    setError('')
  }

  function toggleAddOn(name: string) {
    setAddOns(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  }

  async function save() {
    if (!chosen) return
    setSaving(true); setError('')
    try {
      const res = await fetch(`/api/bookings/${bookingId}/select`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_id: chosen, add_ons: addOns }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Could not save your choice.'); return }
      // Re-renders the page from the server so the payment step shows the new deposit.
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ background: '#fff', border: `1px solid ${colors.sand}`, borderRadius: 6, padding: 24, marginBottom: 20, fontFamily: fonts.body, color: colors.espresso, opacity: 0.6 }}>
        Loading services…
      </div>
    )
  }

  if (!services.length) {
    return (
      <div style={{ background: '#fff', border: `1px solid ${colors.sand}`, borderRadius: 6, padding: 24, marginBottom: 20, fontFamily: fonts.body }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: colors.espresso, lineHeight: 1.6 }}>
          We could not find a service that fits your reserved time. Please message us on WhatsApp and we will sort it out.
        </p>
      </div>
    )
  }

  return (
    <div style={{ background: '#fff', border: `1px solid ${colors.sand}`, borderRadius: 6, padding: 24, marginBottom: 20, fontFamily: fonts.body }}>
      <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: colors.gold, fontWeight: 700, margin: '0 0 6px' }}>
        Step 1 — Choose Your Service
      </p>
      <p style={{ fontSize: '0.85rem', color: colors.espresso, opacity: 0.6, margin: '0 0 20px', lineHeight: 1.6 }}>
        These all fit the time we have reserved for you. Pick one, add any extras, then pay your deposit below.
      </p>

      <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
        {services.map(s => {
          const active = s.id === chosen
          return (
            <div key={s.id} onClick={() => pickService(s.id)}
              style={{ padding: '14px 16px', border: `1.5px solid ${active ? colors.gold : colors.sand}`, background: active ? '#FEFBF5' : colors.cream, borderRadius: 4, cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, border: `1.5px solid ${active ? colors.gold : colors.sand}`, background: active ? colors.gold : 'transparent' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.92rem', color: colors.espresso, fontWeight: 500 }}>{s.name}</div>
                <div style={{ fontSize: '0.75rem', color: colors.espresso, opacity: 0.5 }}>{s.duration_minutes} min</div>
              </div>
              <div style={{ fontSize: '0.9rem', color: colors.espresso, fontWeight: 600 }}>{kes(s.base_price)}</div>
            </div>
          )
        })}
      </div>

      {available.length > 0 && (
        <>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: colors.gold, fontWeight: 700, margin: '0 0 12px' }}>
            Add Extras (optional)
          </p>
          <div style={{ display: 'grid', gap: 8, marginBottom: 20 }}>
            {available.map(a => {
              const checked = addOns.includes(a.name)
              return (
                <div key={a.name} onClick={() => toggleAddOn(a.name)}
                  style={{ padding: '12px 14px', border: `1.5px solid ${checked ? colors.gold : colors.sand}`, background: checked ? '#FEFBF5' : colors.cream, borderRadius: 4, cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 18, height: 18, borderRadius: 3, flexShrink: 0, border: `1.5px solid ${checked ? colors.gold : colors.sand}`, background: checked ? colors.gold : 'transparent', color: '#fff', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {checked ? '✓' : ''}
                  </div>
                  <div style={{ flex: 1, fontSize: '0.88rem', color: colors.espresso }}>{a.name}</div>
                  <div style={{ fontSize: '0.85rem', color: colors.gold, fontWeight: 600 }}>+{kes(a.price)}</div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {service && (
        <div style={{ background: colors.bg, borderRadius: 4, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: colors.espresso, opacity: 0.7, marginBottom: 4 }}>
            <span>{service.name}</span><span>{kes(service.base_price)}</span>
          </div>
          {addOnsTotal > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: colors.espresso, opacity: 0.7, marginBottom: 4 }}>
              <span>Add-ons ({addOns.length})</span><span>+{kes(addOnsTotal)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: `1px solid ${colors.sand}`, fontSize: '0.95rem', color: colors.espresso, fontWeight: 600 }}>
            <span>Subtotal</span><span>{kes(Number(service.base_price) + addOnsTotal)}</span>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '0.72rem', color: colors.espresso, opacity: 0.5 }}>
            Your deposit is worked out from this once you confirm.
          </p>
        </div>
      )}

      {error && (
        <div style={{ background: '#FEF0F0', border: '1px solid #F0B0B0', borderRadius: 4, padding: '10px 14px', marginBottom: 14, fontSize: '0.85rem', color: '#8B1313' }}>
          {error}
        </div>
      )}

      <button
        onClick={save}
        disabled={!chosen || saving}
        style={{
          width: '100%', padding: '14px', border: 'none', borderRadius: 4,
          background: !chosen || saving ? colors.sand : colors.gold,
          color: colors.espresso, fontFamily: fonts.body, fontSize: '0.8rem',
          fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          cursor: !chosen || saving ? 'not-allowed' : 'pointer',
        }}
      >
        {saving ? 'Saving…' : 'Confirm & Continue to Payment →'}
      </button>
    </div>
  )
}
