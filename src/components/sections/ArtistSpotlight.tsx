// Server component. Was "use client" solely for a resize listener feeding 6
// isMobile branches; all of them are now md: classes.

import Link from "next/link";

const artistsData = [
  {
    id: "amara",
    name: "Amara Osei",
    title: "Lead Nail Artist & Founder",
    bio: "With over 8 years of experience, Amara is the creative force behind Luxe Nails Parlour.",
    specialties: ["Bridal Nails", "Nail Art", "Acrylic Extensions"],
    available_mobile: true,
  },
  {
    id: "zuri",
    name: "Zuri Kamau",
    title: "Gel & Enhancement Specialist",
    bio: "Zuri's precision and attention to detail make her the go-to artist for long-lasting gel manicures.",
    specialties: ["Gel Manicure", "Acrylic Tips", "Chrome Finishes"],
    available_mobile: false,
  },
  {
    id: "fatima",
    name: "Fatima Hassan",
    title: "Nail Art & Design Expert",
    bio: "Fatima turns nails into tiny masterpieces — from minimalist florals to bold geometric designs.",
    specialties: ["Custom Nail Art", "3D Embellishments", "Foil Effects"],
    available_mobile: true,
  },
  {
    id: "njeri",
    name: "Njeri Mwangi",
    title: "Pedicure & Wellness Specialist",
    bio: "Njeri believes self-care starts from the ground up.",
    specialties: ["Luxury Pedicure", "Hot Stone Massage", "Paraffin Treatments"],
    available_mobile: false,
  },
  {
    id: "aisha",
    name: "Aisha Wanjiku",
    title: "Classic & Mobile Nail Technician",
    bio: "Aisha is our mobile service champion — bringing the full Luxe Nails experience to your home or office.",
    specialties: ["Classic Manicure", "Mobile Services", "Gel Polish"],
    available_mobile: true,
  },
];

export default function ArtistSpotlight() {
  const featured = artistsData.slice(0, 3);

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

              {/* Image placeholder */}
              <div className="relative mb-6 flex aspect-[4/3] items-center justify-center overflow-hidden bg-sand md:aspect-[3/4]">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/20">
                  <span className="font-heading text-4xl text-gold">
                    {artist.name.charAt(0)}
                  </span>
                </div>

                {artist.available_mobile && (
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

              <p className="mb-4 font-body text-[11px] uppercase tracking-[0.15em] text-gold">
                {artist.title}
              </p>

              <div className="flex flex-wrap gap-2">
                {artist.specialties.slice(0, 2).map((specialty) => (
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
            Meet All {artistsData.length} Artists
          </Link>
        </div>

      </div>
    </section>
  );
}
