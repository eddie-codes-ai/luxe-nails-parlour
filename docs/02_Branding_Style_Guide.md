# PROJECT: LuxeNailsParlour
# FILE: 02_Branding_Style_Guide.md
# Last Updated: March 2026

---

## 1. BRAND IDENTITY

- Name: LuxeNailsParlour
- Tagline: "Artistry at Your Fingertips"
- Vibe: Premium but welcoming. Luxe but accessible. For everyone.
- Target Client: All clients — from entry-level (Plain Gel) to high-end (Hand-Painted Art)
- Location: Nairobi, Kenya (Storefront + Mobile Service)

---

## 2. COLOR PALETTE

| Role               | Name             | Hex Code  | Use For                              |
| :----------------- | :--------------- | :-------- | :----------------------------------- |
| Primary Background | Champagne Cream  | `#FDFBF7` | Page backgrounds, section fills      |
| Primary Text       | Deep Espresso    | `#2D2424` | Headings, body text, dark buttons    |
| Accent / Action    | Soft Gold        | `#C5A358` | Buttons, icons, highlights, borders  |
| Neutral            | Soft Sand        | `#E5E0D8` | Input fields, dividers, card borders |
| Support            | Muted Rose       | `#D4A09A` | Hover states, decorative accents     |
| Support            | Terracotta       | `#C47B5A` | Secondary highlights, italic text    |

---

## 3. TYPOGRAPHY (FONTS)

- Headings (H1, H2, H3): **Cormorant Garamond** (Serif — elegant, high-fashion)
- Body & UI (p, span, buttons): **Jost** (Sans-serif — clean, modern, readable)
- Import in globals.css:
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap');

---

## 4. TAILWIND CUSTOM COLORS (goes in tailwind.config.ts)

colors: {
  cream: '#FDFBF7',
  espresso: '#2D2424',
  gold: '#C5A358',
  sand: '#E5E0D8',
  rose: '#D4A09A',
  terracotta: '#C47B5A',
}

---

## 5. COMPONENT STYLES (UI KIT)

### Buttons
- Primary Button: Background #C5A358 (Gold), Text white, slightly rounded corners
- Secondary Button: Transparent background, Border 1px solid #2D2424, Text #2D2424
- Hover: Primary → background darkens. Secondary → border turns gold.

### Cards (Services / Artists)
- Background: White (#FFFFFF)
- Border: 1px solid #E5E0D8 (Soft Sand)
- Shadow: Soft drop shadow, nothing harsh
- Border Radius: 12px

### Navigation
- Background: Champagne Cream with blur effect when scrolling
- Logo: "Luxe" in Espresso + "Nails" in Gold
- Sticky "Book Now" button always visible

---

## 6. IMAGE STYLE

- Photography: Warm lighting, macro/close-up shots of nail details
- Empty State (no photos yet): Champagne Cream blocks with Gold icons as placeholders
- Instagram feed: Live feed embedded on Gallery page

---

## 7. WHAT TO AVOID

- No "Barbie Pink" unless it becomes a brand decision
- No purple gradients (too generic)
- No Arial or Inter fonts
- No harsh black backgrounds on main pages