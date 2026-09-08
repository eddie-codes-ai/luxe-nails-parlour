// Server component reading the real service catalogue.
//
// This used to render a hardcoded array quoting prices for services that do
// not exist — "Gel Manicure KES 1,200", "Acrylic Tips KES 1,500", "Bridal
// Package KES 4,500". Visitors were being shown a menu they could not book
// from. It now reads the same `services` table the booking flow uses.
//
// Cards were also cursor:pointer while unclickable, and the espresso hover
// background left the name and price at 1:1 contrast — invisible. Both fixed.

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

interface Service {
  id: string;
  name: string;
  tagline: string | null;
  tag: string | null;
  category: string | null;
  base_price: number;
  duration_minutes: number;
  house_call_available: boolean | null;
}

async function getServices(): Promise<Service[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return [];

  const { data, error } = await createClient(url, key)
    .from("services")
    .select("id, name, tagline, tag, category, base_price, duration_minutes, house_call_available")
    .eq("is_active", true)
    .order("base_price");

  if (error) {
    console.error("[ServicesPreview] failed to load services:", error.message);
    return [];
  }
  return data ?? [];
}

/**
 * Which three to show. A service carrying a `tag` ("Most Popular",
 * "Signature", …) is one the owner has deliberately highlighted, so those
 * lead; the rest fall back to cheapest first. Setting a tag in the admin
 * panel is therefore how you choose what the homepage features.
 */
function featuredThree(services: Service[]): Service[] {
  return [...services]
    .sort((a, b) => {
      const tagged = Number(Boolean(b.tag?.trim())) - Number(Boolean(a.tag?.trim()));
      return tagged !== 0 ? tagged : a.base_price - b.base_price;
    })
    .slice(0, 3);
}

export default async function ServicesPreview() {
  const services = await getServices();

  // A price list advertising nothing is worse than no section.
  if (services.length === 0) return null;

  const featured = featuredThree(services);

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
          {featured.map((service, index) => {
            const badge = service.tag?.trim() || service.category?.trim();
            return (
              <Link
                key={service.id}
                href="/services"
                aria-label={`${service.name} — from KES ${Number(service.base_price).toLocaleString()}`}
                className={[
                  "group relative block px-6 py-8 no-underline transition-colors duration-[400ms] hover:bg-espresso md:p-10",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold",
                  index < 2 ? "border-b border-sand md:border-b-0 md:border-r" : "",
                ].join(" ")}
              >
                <span className="pointer-events-none absolute right-6 top-8 select-none font-heading text-[64px] leading-none text-sand">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {badge && (
                  <span className="mb-6 inline-block border border-gold/40 px-3 py-1 font-body text-[10px] uppercase tracking-[0.3em] text-gold">
                    {badge}
                  </span>
                )}

                <h3 className="mb-3 font-heading text-[28px] text-espresso transition-colors group-hover:text-cream">
                  {service.name}
                </h3>

                {service.tagline?.trim() && (
                  <p className="mb-8 font-body text-sm leading-[1.6] text-espresso/55 transition-colors group-hover:text-cream/60">
                    {service.tagline}
                  </p>
                )}

                <div className="flex items-end justify-between">
                  <div>
                    <p className="mb-1 font-body text-[10px] uppercase tracking-[0.2em] text-gold">
                      From
                    </p>
                    <p className="font-heading text-2xl text-espresso transition-colors group-hover:text-cream">
                      KES {Number(service.base_price).toLocaleString()}
                    </p>
                  </div>
                  <span className="font-body text-xs text-espresso/40 transition-colors group-hover:text-cream/40">
                    ~{service.duration_minutes} min
                  </span>
                </div>

                {service.house_call_available && (
                  <div className="mt-6 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-gold" />
                    <span className="font-body text-[10px] uppercase tracking-[0.1em] text-gold">
                      House call available
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* View all */}
        <div className="mt-12 text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-4 font-body text-[13px] uppercase tracking-[0.2em] text-espresso no-underline"
          >
            View All {services.length} Services
            <div className="h-px w-12 bg-espresso" />
          </Link>
        </div>

      </div>
    </section>
  );
}
