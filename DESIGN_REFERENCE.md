# DESIGN_REFERENCE.md — Velox Landing (Light Premium) + Design System

> Berdasarkan PROJECT_REQUIREMENTS.md (approved direction: light premium, navy+gold, freemium community).
> Referensi visual: Framer "Aset" — diambil komposisi/polish/animasi, **bukan** brand/content.

---

## 1. COLOR TOKENS

### Brand Palette (dari logo family)
| Token | Value | Penggunaan |
|-------|-------|-----------|
| `--brand-navy` | `#1B3A52` | Primary brand, headings, buttons solid, icon |
| `--brand-navy-deep` | `#0E2230` | Darker navy: footer, gradients, overlay |
| `--brand-navy-muted` | `#2C5E85` | Secondary/link hover, borders on navy |
| `--brand-gold` | `#C9A961` | Accent, CTA, highlights, icon fills |
| `--brand-gold-light` | `#E3C988` | Gold hover, gradient light, badge bg |
| `--brand-cream` | `#F7F4EE` | Page background (light mode) |
| `--brand-white` | `#FFFFFF` | Card backgrounds, surfaces |

### Semantic (Light Mode)
| Token | Value | Penggunaan |
|-------|-------|-----------|
| `--bg` | `#F7F4EE` | Page background |
| `--surface` | `#FFFFFF` | Cards, panels |
| `--surface-soft` | `#F1EDE4` | Muted surfaces, hover |
| `--text` | `#0E2230` | Headings / primary text |
| `--text-muted` | `#5B6B7A` | Secondary text |
| `--border` | `#E5DCCB` | Borders, dividers |
| `--border-strong` | `#D2C6AC` | Stronger borders |
| `--up` | `#1E8E5A` | Positive (investasi naik) |
| `--down` | `#C04545` | Negative |
| `--accent` | `#C9A961` | Primary CTA, highlights |
| `--accent-hover` | `#B8944A` | Hover accent |

### Notes
- Dark navy + gold konsisten dengan logo shield.
- Di app/dashboard nanti, token yang sama tinggal di-adopt (design system reusable).

---

## 2. TYPOGRAPHY SCALE
| Token / Class | Size | Weight | Use |
|---------------|------|--------|-----|
| `display` | 56–64px | 800 | Hero H1 |
| `h1` | 40–48px | 800 | Section major |
| `h2` | 28–32px | 700 | Section heading |
| `h3` | 20–24px | 700 | Card title |
| `body-lg` | 18px | 400 | Subtext, lead |
| `body` | 16px | 400 | Default |
| `body-sm` | 14px | 400 | Meta, captions |
| `caption` | 12px | 500 | Labels, uppercase |

- **Font:** default system stack (Geist/Inter-like), konsisten dengan app. Optional: add `Inter` via next/font (tapi belum wajib).

---

## 3. SPACING & LAYOUT
- **Container:** `max-w-6xl` (1152px) — konsisten app Velox.
- **Section spacing:** `py-16` desktop / `py-12` mobile.
- **Grid:** `grid-cols-1` mobile → `sm:grid-cols-2` → `lg:grid-cols-3/4`.
- **Gap:** 4–6 (16–24px).

---

## 4. BORDER RADIUS
| Scale | Value | Use |
|-------|-------|-----|
| `sm` | 8px | Badges, small |
| `md` | 12px | Buttons, inputs |
| `lg` | 16px | Cards |
| `xl` | 24px | Hero card, featured |

---

## 5. BUTTONS
| Variant | Style |
|---------|-------|
| **Primary (gold)** | `bg-[var(--accent)] text-navy font-semibold hover:bg-accent-hover rounded-lg px-6 py-3 shadow` |
| **Secondary (navy outline)** | `border-2 border-navy text-navy hover:bg-navy hover:text-white rounded-lg px-6 py-3` |
| **Ghost** | `text-navy hover:underline` |
| **Dark (navy solid)** | `bg-navy text-white hover:bg-navy-deep` |

---

## 6. CARDS
- **Base:** `bg-surface border border-border rounded-xl p-6`
- **Hover:** `hover:shadow-lg hover:-translate-y-0.5 transition-all`
- **Featured:** `ring-2 ring-accent bg-gradient-to-b from-white to-cream`
- Icons: rounded square `bg-accent-soft` with gold/navy icon.

---

## 7. BACKGROUNDS & GRADIENTS
- **Hero:** light cream bg + subtle radial gold glow top-right + grid pattern (optional).
- **Section alt:** `bg-white` vs `bg-cream` alternating.
- **Footer:** **navy deep** `#0E2230` + **white monochrome logo** (perlu re-cut).
- **CTA band:** navy gradient + gold accent.

---

## 8. IMAGE / ILLUSTRATION TREATMENT (PLACEHOLDER STRATEGY)
> Semua gambar placeholder dulu; user ganti aset asli nanti.

| Need | Placeholder Source | Pattern |
|------|-------------------|---------|
| Product/dashboard mock | `placehold.co` | `https://placehold.co/800x600/1B3A52/C9A961/png?text=Velox+Dashboard` |
| Chart/market visual | `placehold.co` | `https://placehold.co/600x400/0E2230/C9A961/png?text=Market+Chart` |
| Member/avatar testimoni | `ui-avatars.com` | `https://ui-avatars.com/api/?name=[Nama]&background=C9A961&color=1B3A52` |
| Realistic photo (optional) | `picsum.photos` | `https://picsum.photos/seed/velox/800/600` |
| Partner/trusted logos | `placehold.co` | `https://placehold.co/200x60/F7F4EE/0E2230/png?text=[Brand]` |

---

## 9. ANIMATION PRINCIPLES (dari Aset → Framer Motion)
| Pattern | Konfigurasi | Elemen |
|---------|-------------|--------|
| **Spring entrance** | `type: spring, bounce: 0.1–0.2, duration: 0.8–1.2s` | Hero headline, badge |
| **Stagger cascade** | delay `0.2 / 0.4 / 0.6 / 0.8` | Features, benefits |
| **Scroll reveal** | `whileInView` + `viewport once: true` | Cards saat scroll |
| **Hover lift** | `whileHover={{ y: -4 }}` | Cards, buttons |
| **Fade/slide** | `initial opacity 0, y 20` → `animate` | Sections |

---

## 10. SECTION-SPECIFIC VISUAL PATTERNS
| Section | Pattern |
|---------|---------|
| **Navbar** | Sticky, white/translucent blur, logo primary, nav links, gold CTA |
| **Hero** | Cream bg, radial gold glow, display headline, subtext, 2 CTA, product mock placeholder |
| **Trusted-by** | Row of placeholder partner logos (grayscale-ish, muted) |
| **Why Join** | 3–4 cards with icon, title, desc |
| **Stats** | 3–4 big numbers, CountUp animation |
| **Pricing** | 2–3 cards, featured ring on premium, toggle monthly/yearly |
| **Testimonials** | Grid of quote cards with avatar (ui-avatars) |
| **FAQ** | Accordion |
| **Final CTA** | Navy band, gold CTA |
| **Footer** | Navy deep, white monochrome logo, links, sosmed |

---

## 11. KEEP / CHANGE / NEW (vs Aset)
- **KEEP FROM REFERENCE:** komposisi hero, trusted-by, pricing toggle, testimonials grid, FAQ accordion, spring/scroll animations.
- **CHANGE FROM REFERENCE:** warna (Aset pakai gradient ungu/teal → Velox navy+gold), branding (Aset → Velox), content (AI asset mgmt → komunitas saham Indonesia), light mode.
- **NEW FOR VELOX:** freemium pricing (gratis vs premium), CTA join komunitas, footer navy + white logo, placeholder image system.
