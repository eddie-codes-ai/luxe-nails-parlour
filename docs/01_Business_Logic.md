# PROJECT: LuxeNailsParlour
# FILE: 01_Business_Logic.md
# Last Updated: March 2026

---

## 1. CORE BOOKING FLOW (THE "ARTIST-CENTRIC" UX)

Step 1. [ENTRY] → User clicks "Book Now"
Step 2. [CATALOG] → User selects Primary Service (e.g., Plain Gel 500 KES)
Step 3. [ADD-ONS] → User adds Art (e.g., Hand-painted +800 KES)
Step 4. [STAFF & TIME] → User selects Artist (or "Any Available") and chooses a Time Slot
Step 5. [LOCATION] → User selects "Storefront" or "Mobile" (Only shows options available for that Artist at that Time)
Step 6. [CONFIRM] → Final Summary shown + Mobile call-out fee added if applicable
Step 7. [PAYMENT] → Client pays via M-Pesa

---

## 2. STAFFING RULES

- Total Technicians: 5
- Minimum staff at storefront at ALL times: 1
- Rule: If 4 mobile sessions are active at the same time, the 5th booking MUST be Storefront only
- Mobile-enabled staff: 3 or 4 technicians (not all 5)
- At least 1 technician must always remain at the storefront

---

## 3. MOBILE SERVICE RULES

- Call-out Fee: +1,000 KES (flat fee for Version 1.0)
- Future Upgrade (v2.0): Distance-based fee using Google Maps API
- Buffer Time: 45 mins - 1 hour added before and after mobile appointments for travel
- The system filters available artists based on mobile availability at the selected time

---

## 4. E-COMMERCE LOGIC (THE SHOP) — PHASE 2

- Type: Standalone Store (separate from booking)
- Inventory: Cuticle Oils, Rings, Aftercare Kits
- Strategy: Independent browsing + "Post-Booking" cross-sell
- After booking confirmation: Show "Complete the Look" link to shop
- NOTE: Shop will be built AFTER the nail services website is complete

---

## 5. PAYMENT

- Method: M-Pesa (primary)
- Display M-Pesa Till Number prominently on: Booking confirmation, Contact page, Footer

---

## 6. SITE ARCHITECTURE (PAGES)

| Route              | Page               |
| :----------------- | :----------------- |
| /                  | Homepage           |
| /services          | Services & Pricing |
| /gallery           | Photo Gallery      |
| /booking           | Booking Flow       |
| /artists           | Meet the Team      |
| /contact           | Contact & Location |