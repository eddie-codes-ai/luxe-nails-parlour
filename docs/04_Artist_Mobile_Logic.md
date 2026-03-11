# PROJECT: LuxeNailsParlour
# FILE: 04_Artist_Mobile_Logic.md
# Last Updated: March 2026

---

## 1. TEAM STRUCTURE

- Total Technicians: 5
- Mobile-Enabled: 3 or 4 (to be confirmed with actual staff)
- Storefront-Only: At least 1 (always)

### Artist Profile Template (JSON — save in src/data/artists.json)
Each artist object needs these fields:

```json
{
  "artists": [
    {
      "id": "A1",
      "name": "Sarah",
      "title": "The Detail Dreamer",
      "specialty": "Hyper-realistic hand-painted florals and custom art",
      "mobileEnabled": true,
      "bio": "I believe your nails are the smallest canvas you will ever own. Let us make them a masterpiece.",
      "photo": "/images/artists/sarah.jpg"
    },
    {
      "id": "A2",
      "name": "James",
      "title": "The Structure King",
      "specialty": "Perfectionist Tips and long-wear sculpting",
      "mobileEnabled": false,
      "bio": "A great design is nothing without a perfect foundation. I build for strength and elegance.",
      "photo": "/images/artists/james.jpg"
    }
  ]
}
```

---

## 2. BOOKING FILTER LOGIC

- IF user selects an artist where mobileEnabled = false → Hide "Mobile" option in location step
- IF user selects an artist where mobileEnabled = true → Show both "Storefront" and "Mobile"
- IF user selects "Any Available" for mobile → Only show artists where mobileEnabled = true

---

## 3. SHOP SAFETY RULE (MINIMUM STAFFING)

- Rule: At least 1 technician must be at the storefront at ALL times
- Logic: Count active mobile bookings at selected time slot
- If (Total Staff - Mobile Bookings at Time X) < 1 → Block mobile booking, show "Mobile unavailable at this time"
- This prevents all 5 techs from going mobile at the same time

---

## 4. MOBILE SERVICE DETAILS

### Version 1.0 (Current)
- Fee: Flat +1,000 KES regardless of distance
- Area: Within Nairobi (specific neighborhoods TBD by owner)
- Buffer: 45 mins - 1 hour added before and after each mobile appointment for travel time

### Version 2.0 (Future Upgrade)
- Fee: Distance-based using Google Maps API
- Formula: Distance (km) × Rate per km (TBD)
- This is a drop-in upgrade — won't require redesigning the site

---

## 5. ADDING NEW ARTISTS

- Add a new object to artists.json with the next ID (A3, A4, A5...)
- Set mobileEnabled to true or false based on their role
- Add their photo to /public/images/artists/
- The Artists page will automatically display the new card