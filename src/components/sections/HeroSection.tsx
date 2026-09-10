// Server component. Previously "use client" with two effects:
//   - a setTimeout that flipped `visible` to drive the entrance animation,
//     which meant the headline was opacity:0 until JavaScript ran
//   - a resize listener setting isMobile, used in 7 places, which rendered the
//     desktop layout first and corrected only after hydration
// Both are now CSS. Nothing here ships JavaScript.

import Link from "next/link";

/** Brand shades on the orbiting ring. */
const POLISHES = ["#C5A358", "#D4A09A", "#C47B5A", "#8B3A4A", "#2D2424"];

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

      {/* Polish bottle turning inside a ring of orbiting shades. Pure CSS 3D —
          no library, no model, nothing extra downloaded.
          Only from xl (1280px), which is where the 720px text column stops
          claiming the right-hand side: measured at 768px and 1024px it sits
          behind the headline. Below that it is not rendered at all, so narrow
          and mobile visitors fetch nothing for it. */}
      <div
        aria-hidden="true"
        className="scene-3d pointer-events-none absolute right-[7%] top-1/2 z-0 hidden -translate-y-1/2 xl:block"
      >
        <div className="relative flex h-[320px] w-[320px] items-center justify-center">
          <div className="animate-orbit absolute inset-0">
            {POLISHES.map((colour, i) => (
              <div
                key={colour}
                className="absolute left-1/2 top-1/2 h-[46px] w-[46px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cream shadow-lg"
                style={{
                  background: colour,
                  transform: `rotateY(${i * (360 / POLISHES.length)}deg) translateZ(128px)`,
                }}
              />
            ))}
          </div>

          {/* Bottle. Cap, collar and body are each their own 4-sided box in
              the same 3D space, so the whole thing turns as one object rather
              than a flat sticker riding on a spinning rectangle. */}
          <div className="animate-bottle relative h-[122px] w-[84px]">

            {/* Cap — ridged, tapering slightly, sitting above the collar */}
            <div
              className="preserve-3d absolute left-1/2 -translate-x-1/2"
              style={{ top: -64, width: 38, height: 54 }}
            >
              {[0, 90, 180, 270].map((deg) => (
                <div
                  key={deg}
                  className="absolute inset-0 rounded-[3px]"
                  style={{
                    transform: `rotateY(${deg}deg) translateZ(19px)`,
                    backgroundImage: [
                      "repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 4px)",
                      "linear-gradient(90deg, rgba(255,255,255,0.30) 6%, rgba(255,255,255,0.05) 26%, rgba(0,0,0,0.25) 78%, rgba(0,0,0,0.42) 100%)",
                      "linear-gradient(180deg, #3A2E2E 0%, #241C1C 100%)",
                    ].join(","),
                  }}
                />
              ))}
            </div>

            {/* Collar — thin metal band where the cap meets the glass */}
            <div
              className="preserve-3d absolute left-1/2 -translate-x-1/2"
              style={{ top: -10, width: 46, height: 10 }}
            >
              {[0, 90, 180, 270].map((deg) => (
                <div
                  key={deg}
                  className="absolute inset-0"
                  style={{
                    transform: `rotateY(${deg}deg) translateZ(23px)`,
                    backgroundImage:
                      "linear-gradient(90deg,#7C5F2C 0%,#E8D7A6 18%,#C5A358 46%,#8A6D33 82%,#5F4720 100%)",
                  }}
                />
              ))}
            </div>

            {/* Glass body — clear shoulder above, polish below, lit from the left */}
            {[0, 90, 180, 270].map((deg) => {
              const facing = deg % 180 === 0;
              return (
                <div
                  key={deg}
                  className="absolute inset-0"
                  style={{
                    transform: `rotateY(${deg}deg) translateZ(42px)`,
                    borderRadius: "12px 12px 6px 6px",
                    backgroundImage: [
                      // specular streak down the left, shading down the right
                      "linear-gradient(90deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.34) 14%, rgba(255,255,255,0.12) 32%, rgba(255,255,255,0) 55%, rgba(0,0,0,0.10) 82%, rgba(0,0,0,0.20) 100%)",
                      // empty glass shoulder, meniscus, then the polish
                      `linear-gradient(180deg,
                        rgba(247,240,235,0.92) 0%,
                        rgba(247,240,235,0.72) 15%,
                        rgba(255,255,255,0.50) 19%,
                        ${facing ? "#DCAEA8" : "#C0918C"} 22%,
                        ${facing ? "#B4636E" : "#8E4A55"} 40%,
                        ${facing ? "#8B3A4A" : "#6E2C39"} 100%)`,
                    ].join(","),
                    boxShadow: "inset 0 -6px 12px rgba(0,0,0,0.22)",
                  }}
                />
              );
            })}
          </div>

          {/* Contact shadow — outside the rotating group so it stays put */}
          <div
            className="pointer-events-none absolute left-1/2 h-[14px] w-[112px] -translate-x-1/2 rounded-[50%] bg-espresso/25 blur-[9px]"
            style={{ top: "calc(50% + 62px)" }}
          />
        </div>
      </div>

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
