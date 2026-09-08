// src/lib/adminFetch.ts
//
// Browser-side fetch wrapper for the admin panel.
//
// Admin sessions expire after 12 hours. Navigating between pages is handled by
// the proxy, but a session that lapses while a screen is already open used to
// surface as `data.products || []` quietly becoming an empty list - a blank
// page with no explanation. This sends the admin to the login screen instead,
// remembering where they were so they land back there afterwards.

export async function adminFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const res = await fetch(input, init)

  if (res.status === 401 && typeof window !== 'undefined') {
    const next = window.location.pathname + window.location.search
    window.location.href = `/admin/login?next=${encodeURIComponent(next)}`
  }

  return res
}
