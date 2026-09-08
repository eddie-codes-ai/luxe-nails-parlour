// Server component. Previously "use client" with two effects:
//   - a setTimeout that flipped `visible` to drive the entrance animation,
//     which meant the headline was opacity:0 until JavaScript ran
//   - a resize listener setting isMobile, used in 7 places, which rendered the
//     desktop layout first and corrected only after hydration
// Both are now CSS. Nothing here ships JavaScript.

import Link from "next/link";

const stats = [
  { number: "8+", label: "Years of Excellence" },
  { number: "5", label: "Expert Artists" },
  { number: "2K+", label: "Happy Clients" },
];

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[linear-gradient(135deg,#FDFBF7_0%,#F5EFE6_50%,#E8DDD0_100%)]">
      {/* Gold glow */}
      <div className="pointer-events-none absolute right-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-gold/[0.12] blur-[80px]" />
      {/* Rose glow */}
      <div className="pointer-events-none absolute bottom-[30%] left-[30%] h-[280px] w-[280px] rounded-full bg-rose/[0.15] blur-[80px]" />

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 pb-[120px] pt-[100px] md:px-12 md:pb-20 md:pt-32">
        <div className="max-w-[720px]">

          {/* Eyebrow */}
          <div className="mb-8 flex animate-rise-in items-center gap-4 [animation-delay:100ms]">
            <div className="h-px w-12 shrink-0 bg-gold" />
            <span className="font-body text-[11px] uppercase tracking-[0.4em] text-gold">
              Nairobi&apos;s Premier Nail Studio
            </span>
          </div>

          {/* Heading */}
          <h1 className="mb-6 animate-rise-in font-heading text-[clamp(40px,12vw,64px)] leading-none text-espresso [animation-delay:200ms] md:text-[clamp(56px,8vw,96px)]">
            Where Art Meets
            <br />
            <span className="italic text-gold">Your Nails</span>
          </h1>

          {/* Subtext */}
          <p className="mb-12 max-w-[540px] animate-rise-in font-body text-base leading-[1.7] text-espresso/60 [animation-delay:350ms] md:text-lg">
            From classic elegance to bold custom art — every set is crafted with
            intention. Visit our studio or let us come to you anywhere in Nairobi.
          </p>

          {/* CTA buttons */}
          <div className="flex animate-rise-in flex-col flex-wrap gap-4 [animation-delay:500ms] md:flex-row">
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-3 bg-espresso px-10 py-4 font-body text-[13px] uppercase tracking-[0.2em] text-cream no-underline transition-colors hover:bg-gold hover:text-espresso"
            >
              View Our Services →
            </Link>
            <Link
              href="/booking"
              className="inline-flex items-center justify-center border border-espresso/30 px-10 py-4 font-body text-[13px] uppercase tracking-[0.2em] text-espresso no-underline transition-colors hover:border-gold hover:text-gold"
            >
              Book an Appointment
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 flex animate-rise-in flex-wrap gap-8 [animation-delay:650ms]">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <span className="font-heading text-[28px] text-gold md:text-4xl">
                  {stat.number}
                </span>
                <span className="max-w-[80px] font-body text-[11px] uppercase leading-[1.4] tracking-[0.1em] text-espresso/50">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {/* Mobile-service badge — inline in the flow on small screens,
              pinned to the corner from md up. Was two duplicated blocks. */}
          <div className="mt-10 inline-block animate-rise-in border border-sand bg-white/85 px-5 py-4 [animation-delay:750ms] md:absolute md:bottom-12 md:right-12 md:mt-0 md:px-6">
            <p className="mb-1 font-body text-[10px] uppercase tracking-[0.3em] text-gold">
              Mobile Service Available
            </p>
            <p className="font-body text-[13px] text-espresso md:text-sm">
              We come to you — anywhere in Nairobi
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
