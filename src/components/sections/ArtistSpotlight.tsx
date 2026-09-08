// Server component reading the real roster.
//
// This used to render a hardcoded array of five invented artists — Amara Osei,
// Zuri Kamau, Fatima Hassan, Njeri Mwangi, Aisha Wanjiku — none of whom exist
// in the database and none of whom could be booked. The homepage now shows the
// people you can actually book.

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

interface Artist {
  id: number;
  name: string;
  role: string | null;
  services: string | null;
  mobile_available: boolean | null;
  photo_url: string | null;
}

async function getArtists(): Promise<Artist[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return [];

  const { data, error } = await createClient(url, key)
    .from("artists")
    .select("id, name, role, services, mobile_available, photo_url")
    .order("id");

  if (error) {
    console.error("[ArtistSpotlight] failed to load artists:", error.message);
    return [];
  }
  return data ?? [];
}

/** "Gel Polish, Nail Art, Classic Manicure" → first two, for the pills. */
function specialtiesOf(artist: Artist): string[] {
  return (artist.services ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 2);
}

export default async function ArtistSpotlight() {
  const artists = await getArtists();

  // A homepage section advertising nobody is worse than no section.
  if (artists.length === 0) return null;

  const featured = artists.slice(0, 3);

  return (
    /* #F5EFE6 is not one of the brand tokens, so it stays an explicit value
       rather than being quietly "corrected" to cream. */
    <section className="bg-[#F5EFE6] px-6 py-20 md:px-12 md:py-28">
      <div className="mx-auto max-w-[1280px]">

        {/* Header */}
        <div className="mb-16 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <div className="mb-4 flex items-center gap-4">
              <div className="h-px w-12 shrink-0 bg-gold" />
              <span className="font-body text-[11px] uppercase tracking-[0.4em] text-gold">
                The Team
              </span>
            </div>
            <h2 className="font-heading text-[clamp(40px,5vw,64px)] leading-[1.1] text-espresso">
              Meet Your Artists
            </h2>
          </div>
          <p className="max-w-[320px] font-body text-base leading-[1.7] text-espresso/55">
            Each artist brings a unique touch — find the one whose style speaks to you and book them directly.
          </p>
        </div>

        {/* Artist cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {featured.map((artist) => (
            <div key={artist.id} className="relative">

              <div className="relative mb-6 flex aspect-[4/3] items-center justify-center overflow-hidden bg-sand md:aspect-[3/4]">
                {artist.photo_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={artist.photo_url}
                    alt={artist.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/20">
                    <span className="font-heading text-4xl text-gold">
                      {artist.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {artist.mobile_available && (
                  <div className="absolute left-4 top-4 bg-gold px-3 py-1">
                    <span className="font-body text-[10px] uppercase tracking-[0.2em] text-white">
                      Mobile
                    </span>
                  </div>
                )}
              </div>

              <h3 className="mb-1 font-heading text-2xl text-espresso">
                {artist.name}
              </h3>

              {artist.role && (
                <p className="mb-4 font-body text-[11px] uppercase tracking-[0.15em] text-gold">
                  {artist.role}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {specialtiesOf(artist).map((specialty) => (
                  <span
                    key={specialty}
                    className="border border-espresso/20 px-3 py-1 font-body text-[10px] uppercase tracking-[0.1em] text-espresso/50"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/artists"
            className="inline-block bg-espresso px-10 py-4 font-body text-[13px] uppercase tracking-[0.2em] text-cream no-underline transition-colors hover:bg-gold hover:text-espresso"
          >
            Meet All {artists.length} Artists
          </Link>
        </div>

      </div>
    </section>
  );
}
