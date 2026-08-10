
README.md:
# 💅 Luxe Nails Parlour

![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ecf8e?logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06b6d4?logo=tailwindcss&logoColor=white)

A full-stack booking platform for a Nairobi nail studio, replacing the usual "DM to book" chaos with a structured, artist-centric flow — from service selection through to M-Pesa payment — backed by an admin dashboard that runs the business day-to-day.

## Highlights

- 7-step artist-centric booking flow — service, optional add-ons (e.g. hand-painted art), artist/availability assignment, timing, storefront-or-mobile choice, fee summary, and M-Pesa payment
- Real-time staffing logic across 5 technicians — keeps at least one storefront-only at all times, caps mobile sessions at 3–4 concurrent, and auto-restricts the 5th booking to storefront once mobile capacity is full
- Mobile appointments carry a flat 1,000 KES surcharge with a 45–60 minute travel buffer built into scheduling
- M-Pesa deposit payments via dynamic payment links, with a WhatsApp-integrated confirmation flow
- Admin dashboard with full booking lifecycle management and a no-code services manager (full CRUD)
- Cron job for automatic booking expiry
- Full SEO — meta tags, Open Graph images, sitemap, robots.txt — plus GA4 and Vercel Analytics
- Phase 2 (planned): a standalone e-commerce shop for aftercare products, promoted post-booking

## Tech Stack

- Next.js, TypeScript, Tailwind CSS
- Supabase (PostgreSQL)
- Resend (transactional email)
- Vercel Analytics

## Project Structure

luxe-nails-parlour/
├── docs/                   # business logic, branding, service menu, artist mobile-ops
├── src/
│   ├── app/
│   ├── components/
│   ├── data/
│   ├── lib/
│   └── proxy.ts
└── public/

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`
