// Converted to Tailwind as the first component off inline styles.
//
// What went away:
//   - a resize listener with two pieces of state (isMobile / isTablet), which
//     meant the mobile layout rendered first and only corrected after
//     hydration measured the window. Breakpoints are plain CSS now, so the
//     right layout is there on first paint.
//   - two onMouseEnter/onMouseLeave handlers mutating style directly, replaced
//     by hover:.
//
// No "use client" needed any more either — there is no state or effect left,
// so this renders entirely on the server.

const reasons = [
  {
    icon: "✦",
    title: "Certified & Experienced",
    description: "All our artists are professionally trained and certified, with a minimum of 3 years of hands-on experience.",
  },
  {
    icon: "⌂",
    title: "Mobile Service, Nairobi-Wide",
    description: "Can't come to us? We come to you. Our mobile artists bring the full Luxe Nails experience to your home or office.",
  },
  {
    icon: "◈",
    title: "Easy M-Pesa Payments",
    description: "Pay conveniently via M-Pesa — no cash hassle. Fast, secure and familiar to every Kenyan client.",
  },
  {
    icon: "♡",
    title: "Hygiene First, Always",
    description: "We use single-use tools and hospital-grade sterilisation for all reusable equipment. Your safety is non-negotiable.",
  },
  {
    icon: "❋",
    title: "Premium Products Only",
    description: "We stock only top-tier, cruelty-free nail products — from OPI to CND and Gelish — for lasting, beautiful results.",
  },
  {
    icon: "◷",
    title: "Flexible Booking",
    description: "Book online 24/7 and choose your preferred artist. We also accommodate walk-ins based on availability.",
  },
];

export default function WhyUs() {
  return (
    <section className="bg-espresso px-6 py-20 sm:px-12 sm:py-28">
      <div className="mx-auto max-w-[1280px]">

        {/* Header */}
        <div className="mb-20 text-center">
          <div className="mb-4 flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-gold" />
            <span className="font-body text-[11px] uppercase tracking-[0.4em] text-gold">
              The Luxe Difference
            </span>
            <div className="h-px w-12 bg-gold" />
          </div>
          <h2 className="font-heading text-[clamp(40px,5vw,64px)] text-cream">
            Why Choose Us
          </h2>
        </div>

        {/* Grid — 1 column, 2 from 640px, 3 from 1024px */}
        <div className="grid grid-cols-1 gap-px bg-cream/10 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason, i) => (
            <div
              key={i}
              className="bg-espresso p-8 transition-colors duration-[400ms] hover:bg-gold/10 sm:p-10"
            >
              <div className="mb-6 text-2xl text-gold">{reason.icon}</div>
              <h3 className="mb-4 font-heading text-2xl text-cream">{reason.title}</h3>
              <p className="font-body text-sm leading-[1.7] text-cream/50">
                {reason.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
