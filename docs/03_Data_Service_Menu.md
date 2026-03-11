# PROJECT: LuxeNailsParlour
# FILE: 03_Data_Service_Menu.md
# Last Updated: March 2026

---

## 1. BASE SERVICES

| ID  | Name                    | Price (KES) | Description                                      |
| :-- | :---------------------- | :---------- | :----------------------------------------------- |
| S1  | Plain Gel               | 500         | Clean, simple, long-wear gel polish               |
| S2  | Normal Tips             | 1,000       | Classic extension with standard finish            |
| S3  | Signature Tips          | 1,500       | Premium-shaped tips with luxe gel finish          |
| S4  | Overlay (Gumgel) Ext.   | 1,600       | Strong, sculpted extensions using gumgel          |
| S5  | Overlay                 | 1,200       | Natural nail strengthening with gel/acrylic       |
| S6  | Luxe Pedicure           | 2,500       | Full foot spa + exfoliation + gel polish finish   |

---

## 2. ADD-ONS & MODIFIERS

| ID    | Name                     | Price (KES) | Description                                      |
| :---- | :----------------------- | :---------- | :----------------------------------------------- |
| ART_A | Nail Art                 | +300        | Simple lines, dots, stickers, or accent nail     |
| ART_B | Hand-Painted Masterpiece | +800        | Intricate custom hand-drawn designs on all nails |
| LOC_M | Mobile Service Fee       | +1,000      | Applied when client selects Mobile location      |

---

## 3. JSON DATA FILE (save as src/data/services.json)

```json
{
  "services": [
    { "id": "S1", "name": "Plain Gel", "price": 500, "description": "Clean, simple, long-wear gel polish." },
    { "id": "S2", "name": "Normal Tips", "price": 1000, "description": "Classic extension with standard finish." },
    { "id": "S3", "name": "Signature Tips", "price": 1500, "description": "Premium-shaped tips with luxe gel finish." },
    { "id": "S4", "name": "Overlay (Gumgel) Ext.", "price": 1600, "description": "Strong, sculpted extensions using gumgel." },
    { "id": "S5", "name": "Overlay", "price": 1200, "description": "Natural nail strengthening with gel/acrylic." },
    { "id": "S6", "name": "Luxe Pedicure", "price": 2500, "description": "Full foot spa + exfoliation + gel polish finish." }
  ],
  "addons": [
    { "id": "ART_A", "name": "Nail Art", "price": 300, "description": "Simple lines, dots, or accent nail." },
    { "id": "ART_B", "name": "Hand-Painted Masterpiece", "price": 800, "description": "Intricate custom hand-drawn designs." },
    { "id": "LOC_M", "name": "Mobile Service Fee", "price": 1000, "description": "We come to you." }
  ]
}
```

---

## 4. SCALABILITY RULES (HOW TO ADD NEW SERVICES)

- New Services: Assign next ID (S7, S8...) and add to the JSON file
- New Add-ons: Assign next ID (ART_C, ART_D...) and add to addons array
- Price Changes: Only update the "price" value in the JSON — reflects sitewide automatically
- Seasonal Services: Can be added with a "seasonal: true" flag and removed after the season
- The website reads from this file dynamically — never hardcode prices in the UI components