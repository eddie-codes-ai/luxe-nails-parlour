'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Artist {
  id: number
  name: string
  photo_url?: string
  buffer_minutes: number
}

interface Schedule {
  id?: string
  artist_id: number
  schedule_date: string
  start_time: string
  end_time: string
  late_cutoff_time: string | null
  late_end_time: string | null
  is_blocked: boolean
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getNext14Days(): string[] {
  const days: string[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

function formatDayLabel(dateStr: string): { day: string; date: string; isToday: boolean } {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return {
    day: d.toLocaleDateString('en-KE', { weekday: 'short' }),
    date: d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }),
    isToday: d.getTime() === today.getTime(),
  }
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

// ─── Time Select ──────────────────────────────────────────────────────────────

function TimeSelect({ value, onChange, placeholder = 'None' }: {
  value: string | null
  onChange: (v: string | null) => void
  placeholder?: string
}) {
  const times: string[] = []
  for (let h = 6; h <= 22; h++) {
    for (const m of [0, 30]) {
      const hh = String(h).padStart(2, '0')
      const mm = String(m).padStart(2, '0')
      times.push(`${hh}:${mm}`)
    }
  }

  function fmt(t: string) {
    const [h, m] = t.split(':').map(Number)
    const suffix = h >= 12 ? 'PM' : 'AM'
    const hh = h > 12 ? h - 12 : h === 0 ? 12 : h
    return `${hh}:${String(m).padStart(2, '0')} ${suffix}`
  }

  return (
    <select
      value={value ?? ''}
      onChange={e => onChange(e.target.value === '' ? null : e.target.value)}
      style={{
        width: '100%', padding: '8px 10px', border: `1px solid ${c.border}`,
        borderRadius: 4, fontSize: 12, fontFamily: fonts.body,
        color: value ? c.dark : c.muted, background: c.cream, outline: 'none',
        cursor: 'pointer',
      }}
    >
      <option value="">{placeholder}</option>
      {times.map(t => (
        <option key={t} value={t}>{fmt(t)}</option>
      ))}
    </select>
  )
}

// ─── Day Card ─────────────────────────────────────────────────────────────────

function DayCard({
  dateStr,
  schedule,
  onUpdate,
  saving,
}: {
  dateStr: string
  schedule: Schedule
  onUpdate: (s: Schedule) => void
  saving: boolean
}) {
  const { day, date, isToday } = formatDayLabel(dateStr)

  return (
    <div style={{
      background: schedule.is_blocked ? '#FEF0EE' : c.card,
      border: `1px solid ${schedule.is_blocked ? '#E8A89A' : c.border}`,
      borderRadius: 6, padding: '14px 16px',
      opacity: saving ? 0.7 : 1, transition: 'all 0.2s',
    }}>
      {/* Day header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <span style={{
            fontSize: 13, fontWeight: 600, color: isToday ? c.gold : c.dark,
            fontFamily: fonts.body, marginRight: 6,
          }}>
            {day}
          </span>
          <span style={{ fontSize: 12, color: c.muted, fontFamily: fonts.body }}>{date}</span>
          {isToday && <span style={{ marginLeft: 6, fontSize: 10, background: c.gold, color: '#fff', padding: '1px 6px', borderRadius: 10, fontFamily: fonts.body }}>Today</span>}
        </div>
        {/* Block toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 11, color: schedule.is_blocked ? '#C0402A' : c.muted, fontFamily: fonts.body }}>
          <input
            type="checkbox"
            checked={schedule.is_blocked}
            onChange={e => onUpdate({ ...schedule, is_blocked: e.target.checked })}
            style={{ cursor: 'pointer' }}
          />
          Day off
        </label>
      </div>

      {!schedule.is_blocked && (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
          {/* Normal hours */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: c.muted, fontFamily: fonts.body, marginBottom: 4 }}>
                Opens
              </label>
              <TimeSelect value={schedule.start_time} onChange={v => onUpdate({ ...schedule, start_time: v ?? '09:30' })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: c.muted, fontFamily: fonts.body, marginBottom: 4 }}>
                Normal close
              </label>
              <TimeSelect value={schedule.end_time} onChange={v => onUpdate({ ...schedule, end_time: v ?? '19:00' })} />
            </div>
          </div>

          {/* Late night */}
          <div style={{ borderTop: `1px dashed ${c.border}`, paddingTop: 10 }}>
            <p style={{ margin: '0 0 6px', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: c.gold, fontFamily: fonts.body }}>
              Late night (optional)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, color: c.muted, fontFamily: fonts.body, marginBottom: 4 }}>Request-only from</label>
                <TimeSelect
                  value={schedule.late_cutoff_time}
                  onChange={v => onUpdate({ ...schedule, late_cutoff_time: v })}
                  placeholder="No late slots"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, color: c.muted, fontFamily: fonts.body, marginBottom: 4 }}>Late slots end</label>
                <TimeSelect
                  value={schedule.late_end_time}
                  onChange={v => onUpdate({ ...schedule, late_end_time: v })}
                  placeholder="No late slots"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {schedule.is_blocked && (
        <p style={{ margin: 0, fontSize: 12, color: '#C0402A', fontFamily: fonts.body }}>
          Artist unavailable — no bookings on this day
        </p>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ArtistSchedulesClient() {
  const router = useRouter()
  const [artists, setArtists] = useState<Artist[]>([])
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
  const [schedules, setSchedules] = useState<Record<string, Schedule>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const days = getNext14Days()

  // ── Load artists ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/artists')
      .then(r => r.json())
      .then(d => {
        setArtists(d.artists ?? [])
        if (d.artists?.length > 0) setSelectedArtist(d.artists[0])
      })
      .catch(() => setError('Failed to load artists'))
      .finally(() => setLoading(false))
  }, [])

  // ── Load schedules when artist changes ────────────────────────────────────────
  useEffect(() => {
    if (!selectedArtist) return
    setLoading(true)

    fetch(`/api/admin/artist-schedules?artistId=${selectedArtist.id}`)
      .then(r => r.json())
      .then(d => {
        const map: Record<string, Schedule> = {}
        // Seed defaults for all 14 days
        days.forEach(date => {
          map[date] = {
            artist_id:        selectedArtist.id,
            schedule_date:    date,
            start_time:       '09:30',
            end_time:         '19:00',
            late_cutoff_time: null,
            late_end_time:    null,
            is_blocked:       false,
          }
        })
        // Override with saved schedules
        ;(d.schedules ?? []).forEach((s: Schedule) => {
          map[s.schedule_date] = s
        })
        setSchedules(map)
      })
      .catch(() => setError('Failed to load schedules'))
      .finally(() => setLoading(false))
  }, [selectedArtist?.id])

  function updateSchedule(date: string, schedule: Schedule) {
    setSchedules(prev => ({ ...prev, [date]: schedule }))
    setSaved(false)
  }

  async function handleSave() {
    if (!selectedArtist) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/artist-schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistId:  selectedArtist.id,
          schedules: Object.values(schedules),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to save'); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: c.bg, fontFamily: fonts.body }}>

      {/* Nav */}
      <nav style={{ background: c.dark, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <button onClick={() => router.push('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 400, color: c.gold, fontFamily: fonts.heading }}>Luxe Nails</span>
          <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#9A8A72', marginLeft: 8, fontFamily: fonts.body }}>Admin Panel</span>
        </button>
        <button onClick={() => router.push('/admin')}
          style={{ background: 'none', border: '1px solid #5A4A3A', color: '#9A8A72', padding: '6px 16px', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: fonts.body, borderRadius: 2 }}>
          Dashboard
        </button>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <h1 style={{ margin: '0 0 6px', fontSize: 36, fontWeight: 400, color: c.dark, fontFamily: fonts.heading }}>Artist Schedules</h1>
            <p style={{ margin: 0, color: c.muted, fontSize: 14 }}>Set working hours and late night windows for the next 14 days.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !selectedArtist}
            style={{
              background: saved ? '#1A7A40' : c.dark, color: '#F5F0E8',
              border: 'none', padding: '11px 24px', fontSize: 11,
              letterSpacing: '0.1em', textTransform: 'uppercase' as const,
              cursor: 'pointer', fontFamily: fonts.body, borderRadius: 2,
              opacity: saving ? 0.7 : 1, transition: 'background 0.3s',
            }}>
            {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Schedule'}
          </button>
        </div>

        {error && (
          <div style={{ background: '#FEF0EE', border: '1px solid #E8A89A', borderRadius: 4, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#8B3A2A' }}>
            {error}
          </div>
        )}

        {/* Artist selector */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const, marginBottom: 28 }}>
          {artists.map(a => (
            <button
              key={a.id}
              onClick={() => { setSelectedArtist(a); setSaved(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 16px', borderRadius: 6, cursor: 'pointer',
                border: `1.5px solid ${selectedArtist?.id === a.id ? c.dark : c.border}`,
                background: selectedArtist?.id === a.id ? c.dark : c.card,
                fontFamily: fonts.body, transition: 'all 0.15s',
              }}>
              {a.photo_url ? (
                <img src={a.photo_url} alt={a.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: c.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                  {initials(a.name)}
                </div>
              )}
              <div style={{ textAlign: 'left' as const }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: selectedArtist?.id === a.id ? '#F5F0E8' : c.dark }}>{a.name}</div>
                <div style={{ fontSize: 10, color: selectedArtist?.id === a.id ? '#9A8A72' : c.muted }}>{a.buffer_minutes} min buffer</div>
              </div>
            </button>
          ))}
        </div>

        {/* Buffer note */}
        {selectedArtist && (
          <div style={{ background: '#FFF8EC', border: '1px solid #F0C878', borderRadius: 4, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#8B6A00', fontFamily: fonts.body }}>
            <strong>{selectedArtist.name}</strong> has a <strong>{selectedArtist.buffer_minutes} minute</strong> personal buffer after each appointment.
            This is invisible to customers — slots are automatically spaced to account for it.
            To change it, edit the artist in the <button onClick={() => router.push('/admin/artists')} style={{ background: 'none', border: 'none', color: c.gold, cursor: 'pointer', textDecoration: 'underline', fontFamily: fonts.body, fontSize: 12, padding: 0 }}>Artists page</button>.
          </div>
        )}

        {/* Schedule grid */}
        {loading ? (
          <p style={{ color: c.muted, fontSize: 14 }}>Loading schedule...</p>
        ) : selectedArtist ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {days.map(date => (
              <DayCard
                key={date}
                dateStr={date}
                schedule={schedules[date] ?? {
                  artist_id: selectedArtist.id,
                  schedule_date: date,
                  start_time: '09:30',
                  end_time: '19:00',
                  late_cutoff_time: null,
                  late_end_time: null,
                  is_blocked: false,
                }}
                onUpdate={s => updateSchedule(date, s)}
                saving={saving}
              />
            ))}
          </div>
        ) : (
          <p style={{ color: c.muted, fontSize: 14 }}>No artists found.</p>
        )}

        {/* Bottom save */}
        {selectedArtist && !loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: saved ? '#1A7A40' : c.dark, color: '#F5F0E8',
                border: 'none', padding: '13px 32px', fontSize: 11,
                letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                cursor: 'pointer', fontFamily: fonts.body, borderRadius: 2,
                opacity: saving ? 0.7 : 1,
              }}>
              {saving ? 'Saving...' : saved ? '✓ Schedule Saved' : 'Save Schedule'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}