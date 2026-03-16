// src/lib/email-templates.ts
// HTML email templates for LuxeNails Parlour
// Matches brand: cream #F5F0E8, espresso #2C1A0E, gold #B8963E

// ─── Shared styles ────────────────────────────────────────────────────────────

const base = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>LuxeNails Parlour</title>
</head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E8;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Header -->
        <tr>
          <td style="background:#2C1A0E;padding:32px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#B8963E;">
              LuxeNails Parlour
            </p>
            <h1 style="margin:0;font-size:26px;font-weight:400;color:#F5F0E8;font-family:Georgia,serif;">
              Nairobi's Premier Nail Studio
            </h1>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="background:#FDFAF5;padding:40px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#9A8A72;font-family:Arial,sans-serif;line-height:1.6;">
              LuxeNails Parlour · Nairobi, Kenya<br/>
              <a href="https://luxenailsparlour.com" style="color:#B8963E;text-decoration:none;">luxenailsparlour.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

const row = (label: string, value: string) => `
  <tr>
    <td style="padding:8px 0;border-bottom:1px solid #EDE8DF;font-family:Arial,sans-serif;">
      <span style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#9A8A72;font-weight:600;">
        ${label}
      </span>
    </td>
    <td style="padding:8px 0;border-bottom:1px solid #EDE8DF;text-align:right;font-family:Arial,sans-serif;">
      <span style="font-size:13px;color:#2C1A0E;font-weight:500;">${value}</span>
    </td>
  </tr>`

const goldDivider = () => `
  <tr>
    <td colspan="2" style="padding:4px 0;">
      <div style="height:1px;background:#B8963E;opacity:0.3;"></div>
    </td>
  </tr>`

// ─── Template 1: Owner — New Booking Alert ────────────────────────────────────

export interface NewBookingEmailData {
  customerName:     string
  customerPhone:    string
  customerEmail?:   string
  serviceName:      string
  artistName:       string
  bookingDate:      string   // "Tuesday, 17 March 2026"
  startTime:        string   // "2:10 PM"
  locationType:     'in_shop' | 'house_call'
  houseCallAddress?: string
  servicePrice:     number
  travelFee:        number
  lateNightFee:     number
  depositAmount:    number
  bookingId:        string
  isLateNight:      boolean
  bookingSource:    string   // "website" | "whatsapp" | "call" | "walk_in"
}

export function ownerNewBookingEmail(data: NewBookingEmailData): string {
  const totalPrice = data.servicePrice + data.travelFee + data.lateNightFee
  const kes = (n: number) => `KSh ${n.toLocaleString()}`

  const sourceLabel: Record<string, string> = {
    website:  '🌐 Website',
    whatsapp: '💬 WhatsApp',
    call:     '📞 Phone call',
    walk_in:  '🚶 Walk-in',
  }

  const content = `
    <!-- Alert badge -->
    <div style="background:${data.isLateNight ? '#FFF8EC' : '#EDF5F0'};border:1px solid ${data.isLateNight ? '#B8963E' : '#4A9A70'};border-radius:4px;padding:12px 16px;margin-bottom:28px;text-align:center;">
      <p style="margin:0;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${data.isLateNight ? '#B8963E' : '#2A7A50'};font-family:Arial,sans-serif;">
        ${data.isLateNight ? '🌙 Late Night Request' : '✦ New Booking'}
      </p>
      <p style="margin:6px 0 0;font-size:12px;color:#7A6A52;font-family:Arial,sans-serif;">
        Source: ${sourceLabel[data.bookingSource] ?? data.bookingSource}
      </p>
    </div>

    <h2 style="margin:0 0 6px;font-size:22px;font-weight:400;color:#2C1A0E;">
      ${data.customerName}
    </h2>
    <p style="margin:0 0 28px;font-size:14px;color:#7A6A52;font-family:Arial,sans-serif;">
      wants to book <strong style="color:#2C1A0E;">${data.serviceName}</strong>
    </p>

    <!-- Booking details table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${row('Date', data.bookingDate)}
      ${row('Time', data.startTime + (data.isLateNight ? ' <span style="color:#B8963E;font-size:11px;">(late night)</span>' : ''))}
      ${row('Artist', data.artistName)}
      ${row('Location', data.locationType === 'house_call'
        ? `House call — ${data.houseCallAddress}`
        : 'At the studio')}
      ${row('Phone', `<a href="tel:${data.customerPhone}" style="color:#B8963E;text-decoration:none;">${data.customerPhone}</a>`)}
      ${data.customerEmail ? row('Email', `<a href="mailto:${data.customerEmail}" style="color:#B8963E;text-decoration:none;">${data.customerEmail}</a>`) : ''}
    </table>

    <!-- Pricing -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${goldDivider()}
      ${row('Service price', kes(data.servicePrice))}
      ${data.travelFee > 0 ? row('Travel fee', kes(data.travelFee)) : ''}
      ${data.lateNightFee > 0 ? row('Late night surcharge', kes(data.lateNightFee)) : ''}
      ${row('Total', kes(totalPrice))}
      <tr>
        <td style="padding:10px 0 0;font-family:Arial,sans-serif;">
          <span style="font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#9A8A72;font-weight:600;">Deposit (30%)</span>
        </td>
        <td style="padding:10px 0 0;text-align:right;font-family:Arial,sans-serif;">
          <span style="font-size:16px;color:#B8963E;font-weight:700;">${kes(data.depositAmount)}</span>
        </td>
      </tr>
    </table>

    ${data.isLateNight ? `
    <!-- Late night note -->
    <div style="background:#FFF8EC;border-left:3px solid #B8963E;padding:14px 16px;margin-bottom:24px;border-radius:0 4px 4px 0;">
      <p style="margin:0;font-size:13px;color:#7A6A52;font-family:Arial,sans-serif;line-height:1.6;">
        <strong style="color:#2C1A0E;">Late night request</strong> — No deposit collected yet.
        Contact the customer to confirm the slot before requesting payment.
      </p>
    </div>` : `
    <!-- Payment reminder -->
    <div style="background:#F0F7F4;border-left:3px solid #4A9A70;padding:14px 16px;margin-bottom:24px;border-radius:0 4px 4px 0;">
      <p style="margin:0;font-size:13px;color:#7A6A52;font-family:Arial,sans-serif;line-height:1.6;">
        Customer has been asked to pay the <strong style="color:#2C1A0E;">${kes(data.depositAmount)} deposit</strong> via M-Pesa.
        Once they submit their reference, confirm it in the admin panel.
      </p>
    </div>`}

    <!-- Admin CTA -->
    <div style="text-align:center;margin-top:8px;">
      <a href="https://luxenailsparlour.vercel.app/admin/bookings"
        style="display:inline-block;background:#2C1A0E;color:#F5F0E8;text-decoration:none;padding:13px 28px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;font-family:Arial,sans-serif;font-weight:600;border-radius:2px;">
        View in Admin Panel →
      </a>
    </div>

    <p style="margin:20px 0 0;font-size:11px;color:#B0A090;font-family:Arial,sans-serif;text-align:center;">
      Booking ID: ${data.bookingId}
    </p>
  `

  return base(content)
}

// ─── Template 2: Customer — Booking Confirmed ─────────────────────────────────

export interface CustomerConfirmationEmailData {
  customerName:     string
  serviceName:      string
  artistName:       string
  bookingDate:      string
  startTime:        string
  locationType:     'in_shop' | 'house_call'
  houseCallAddress?: string
  depositAmount:    number
  bookingId:        string
  cancelUrl:        string
}

export function customerConfirmationEmail(data: CustomerConfirmationEmailData): string {
  const kes = (n: number) => `KSh ${n.toLocaleString()}`

  const content = `
    <!-- Success icon -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="width:56px;height:56px;border-radius:50%;background:#EDF5F0;border:2px solid #4A9A70;display:inline-flex;align-items:center;justify-content:center;font-size:22px;">
        ✓
      </div>
    </div>

    <h2 style="margin:0 0 8px;font-size:24px;font-weight:400;color:#2C1A0E;text-align:center;">
      You're confirmed, ${data.customerName.split(' ')[0]}!
    </h2>
    <p style="margin:0 0 32px;font-size:14px;color:#7A6A52;font-family:Arial,sans-serif;text-align:center;line-height:1.6;">
      Your appointment has been confirmed. We look forward to seeing you!
    </p>

    <!-- Booking card -->
    <div style="background:#F5F0E8;border-radius:4px;padding:24px;margin-bottom:28px;">
      <p style="margin:0 0 16px;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#9A8A72;font-family:Arial,sans-serif;font-weight:600;">
        Your Appointment
      </p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${row('Service', data.serviceName)}
        ${row('Artist', data.artistName)}
        ${row('Date', data.bookingDate)}
        ${row('Time', data.startTime)}
        ${row('Location', data.locationType === 'house_call'
          ? `House call — ${data.houseCallAddress}`
          : 'At the studio')}
        <tr>
          <td style="padding:10px 0 0;font-family:Arial,sans-serif;">
            <span style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#9A8A72;font-weight:600;">Deposit paid</span>
          </td>
          <td style="padding:10px 0 0;text-align:right;font-family:Arial,sans-serif;">
            <span style="font-size:14px;color:#4A9A70;font-weight:600;">${kes(data.depositAmount)} ✓</span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Reminder note -->
    <div style="background:#FFF8EC;border-left:3px solid #B8963E;padding:14px 16px;margin-bottom:28px;border-radius:0 4px 4px 0;">
      <p style="margin:0;font-size:13px;color:#7A6A52;font-family:Arial,sans-serif;line-height:1.6;">
        <strong style="color:#2C1A0E;">Reminder:</strong> Please arrive on time.
        The remaining balance is due on the day of your appointment.
        Late arrivals (15+ min) may forfeit their deposit.
      </p>
    </div>

    <!-- Cancel link -->
    <div style="text-align:center;margin-bottom:8px;">
      <a href="${data.cancelUrl}"
        style="display:inline-block;background:#2C1A0E;color:#F5F0E8;text-decoration:none;padding:13px 28px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;font-family:Arial,sans-serif;font-weight:600;border-radius:2px;">
        Cancel or Reschedule
      </a>
    </div>
    <p style="margin:12px 0 0;font-size:12px;color:#9A8A72;font-family:Arial,sans-serif;text-align:center;">
      Need to change your appointment? Use the button above.<br/>
      Cancellations within 24h are non-refundable.
    </p>

    <p style="margin:20px 0 0;font-size:11px;color:#B0A090;font-family:Arial,sans-serif;text-align:center;">
      Booking ID: ${data.bookingId}
    </p>
  `

  return base(content)
}

// ─── Template 3: Customer — Booking Declined ─────────────────────────────────

export function customerDeclinedEmail(data: {
  customerName: string
  serviceName:  string
  bookingDate:  string
  startTime:    string
  bookingId:    string
}): string {
  const content = `
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:400;color:#2C1A0E;text-align:center;">
      Booking Update
    </h2>
    <p style="margin:0 0 28px;font-size:14px;color:#7A6A52;font-family:Arial,sans-serif;text-align:center;line-height:1.6;">
      Unfortunately we're unable to accommodate your booking request.
    </p>

    <div style="background:#F5F0E8;border-radius:4px;padding:20px;margin-bottom:28px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${row('Service', data.serviceName)}
        ${row('Date', data.bookingDate)}
        ${row('Time', data.startTime)}
      </table>
    </div>

    <div style="background:#FEF0EE;border-left:3px solid #C0604A;padding:14px 16px;margin-bottom:28px;border-radius:0 4px 4px 0;">
      <p style="margin:0;font-size:13px;color:#7A6A52;font-family:Arial,sans-serif;line-height:1.6;">
        If you paid a deposit, a <strong style="color:#2C1A0E;">full refund</strong> will be processed
        within 2–3 business days.
      </p>
    </div>

    <div style="text-align:center;">
      <a href="https://luxenailsparlour.vercel.app/booking"
        style="display:inline-block;background:#2C1A0E;color:#F5F0E8;text-decoration:none;padding:13px 28px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;font-family:Arial,sans-serif;font-weight:600;border-radius:2px;">
        Book Again
      </a>
    </div>

    <p style="margin:20px 0 0;font-size:11px;color:#B0A090;font-family:Arial,sans-serif;text-align:center;">
      Booking ID: ${data.bookingId}
    </p>
  `
  return base(content)
}

// ─── Template 4: Owner — Late Night Request ───────────────────────────────────

export function ownerLateNightRequestEmail(data: NewBookingEmailData): string {
  // Reuse the new booking template — it already handles isLateNight styling
  return ownerNewBookingEmail(data)
}