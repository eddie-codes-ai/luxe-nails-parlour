// Server component. Was "use client" solely for a resize listener feeding 8
// isMobile branches; all of them are now md: classes.
//
// The cards previously carried cursor:pointer while being unclickable, and the
// espresso hover background left the service name and price at 1:1 contrast -
// literally invisible. They are now links, and the dark elements invert on
// hover via `group`.

import Link from "next/link";

const servicesData = [
  {
    id: "classic-manicure",
    name: "Classic Manicure",
    tagline: "Timeless elegance for every occasion",
    basePrice: 800,
    duration: 45,
    category: "Manicure",
    available_mobile: true,
  },
  {
    id: "gel-manicure",
    name: "Gel Manicure",
    tagline: "Long-lasting brilliance, up to 3 weeks",
    basePrice: 1200,
    duration: 60,
    category: "Manicure",
    available_mobile: true,
  },
  {
    id: "acrylic-tips",
    name: "Acrylic Tips",
    tagline: "Bold length, flawless finish",
    basePrice: 1500,
    duration: 90,
    category: "Enhancements",
    available_mobile: false,
  },
  {
    id: "pedicure",
    name: "Luxury Pedicure",
    tagline: "Restore, relax and refresh",
    basePrice: 1000,
    duration: 60,
    category: "Pedicure",
    available_mobile: false,
  },
  {
    id: "nail-art",
    name: "Nail Art & Design",
    tagline: "Your nails, your canvas",
    basePrice: 1500,
    duration: 75,
    category: "Art",
    available_mobile: true,
  },
  {
    id: "bridal-package",
    name: "Bridal Package",
    tagline: "Look perfect on your perfect day",
    basePrice: 4500,
    duration: 180,
    category: "Packages",
    available_mobile: true,
  },
];

export default function ServicesPreview() {
  const featured = servicesData.slice(0, 3);

  return (
    <section className="bg-cream px-6 py-20 md:px-12 md:py-28">
      <div className="mx-auto max-w-[1280px]">

        {/* Section header */}
        <div className="mb-16 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <div className="mb-4 flex items-center gap-4">
              <div className="h-px w-12 shrink-0 bg-gold" />
              <span className="font-body text-[11px] uppercase tracking-[0.4em] text-gold">
                What We Offer
              </span>
            </div>
            <h2 className="font-heading text-[clamp(40px,5vw,64px)] leading-[1.1] text-espresso">
              Our Services
            </h2>
          </div>
          <p className="max-w-[320px] font-body text-base leading-[1.7] text-espresso/55">
            Every service is a carefully crafted experience — from the moment you arrive to the moment you leave.
          </p>
        </div>

        {/* Service cards */}
        <div className="grid grid-cols-1 border border-sand md:grid-cols-3">
          {featured.map((service, index) => (
            <Link
              key={service.id}
              href="/services"
              aria-label={`${service.name} — from KES ${service.basePrice.toLocaleString()}`}
              className={[
                "group relative block px-6 py-8 no-underline transition-colors duration-[400ms] hover:bg-espresso md:p-10",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold",
                index < 2 ? "border-b border-sand md:border-b-0 md:border-r" : "",
              ].join(" ")}
            >
              <span className="pointer-events-none absolute right-6 top-8 select-none font-heading text-[64px] leading-none text-sand">
                {String(index + 1).padStart(2, "0")}
              </span>

              <span className="mb-6 inline-block border border-gold/40 px-3 py-1 font-body text-[10px] uppercase tracking-[0.3em] text-gold">
                {service.category}
              </span>

              <h3 className="mb-3 font-heading text-[28px] text-espresso transition-colors group-hover:text-cream">
                {service.name}
              </h3>

              <p className="mb-8 font-body text-sm leading-[1.6] text-espresso/55 transition-colors group-hover:text-cream/60">
                {service.tagline}
              </p>

              <div className="flex items-end justify-between">
                <div>
                  <p className="mb-1 font-body text-[10px] uppercase tracking-[0.2em] text-gold">
                    From
                  </p>
                  <p className="font-heading text-2xl text-espresso transition-colors group-hover:text-cream">
                    KES {service.basePrice.toLocaleString()}
                  </p>
                </div>
                <span className="font-body text-xs text-espresso/40 transition-colors group-hover:text-cream/40">
                  ~{service.duration} min
                </span>
              </div>

              {service.available_mobile && (
                <div className="mt-6 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-gold" />
                  <span className="font-body text-[10px] uppercase tracking-[0.1em] text-gold">
                    Mobile available
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* View all */}
        <div className="mt-12 text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-4 font-body text-[13px] uppercase tracking-[0.2em] text-espresso no-underline"
          >
            View All {servicesData.length} Services
            <div className="h-px w-12 bg-espresso" />
          </Link>
        </div>

      </div>
    </section>
  );
}
