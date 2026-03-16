// src/lib/resend.ts
// Shared Resend email sender
// All emails go through this single function

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export const OWNER_EMAIL = 'edwinmwai542@gmail.com'
export const FROM_EMAIL  = 'LuxeNails Parlour <bookings@luxenailsparlour.com>'
// ^ Update the domain once you verify it in Resend dashboard
// For testing you can use: onboarding@resend.dev

interface SendEmailOptions {
  to:      string | string[]
  subject: string
  html:    string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from:    FROM_EMAIL,
      to:      Array.isArray(to) ? to : [to],
      subject,
      html,
    })

    if (error) {
      console.error('[resend] send error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (err) {
    console.error('[resend] unexpected error:', err)
    return { success: false, error: err }
  }
}