# Qvantum Design System

Heat pump powered energy systems. Qvantum makes fossil-free heating and cooling available to everyone, from a single home to an entire city. Every part of the system is connected, modular and intuitive — the vision is a world where no home is left behind in the energy shift.

**Brand personality:** the bold and visionary doer.

**Primary audience for output produced with this system:** housing corporations, developers, installers, consultants and municipalities in the Netherlands — decision-makers rather than technicians. Most copy is Dutch; sector terms stay in English where that is standard practice.

**Typical output:** web pages, one-pagers, sales decks, social and campaign visuals, infographics and technical diagrams.

**Products:** the Q-range of units. Names are constructed as `Q` + one or two letters, optionally a hyphen and up to three digits — `QA`, `QE`, `QE-4`, `QG`, `QH-100`. Always write the exact official name; never `QE4` or `Qe-4`. A heat pump is an *apparaat* or a *unit* — never a *kast*.

## Sources

Everything in this system was built from material supplied by the brand owner. There is no codebase, Figma file or repository attached.

| Source | What it gave us |
|---|---|
| `uploads/Qvantum_DesignSystem_Assets_v1/` (from `Qvantum_DesignSystem_Assets_v1.zip`) | Host Grotesk TTFs, six logo files, gradient banners, three product renders, photography, abstract light imagery |
| Qvantum brand guidelines (written brief: typography, colour, layout, logo, imagery, product naming, tone of voice) | Every rule in this readme |
| Qvantum website design guide, March 2026 (referenced by the brief) | Web/UI rules: button colours by context, no dark blocks, no icons in menus, Tesla-level whitespace |
| `Qvantum_PPT_template_v1.potx` (referenced by the brief, **not present in this project**) | Layout index used to build the sample slides in `slides/` |
| `uploads/qvantum-brand-portal-supplement.md` and `-supplement2.md` — extract of the brand portal, captured 2 Sep 2026 | Positioning, narrative, tone-of-voice pillars, brand expression, logo placement, CMYK values, social formats, imagery direction, graphical elements. **Source of truth where it disagrees with the written brief.** |
| `uploads/qvantum-stock-index.csv` + supplement section 18 | Per-file index of the Pixieset stock library: 304 files across eight folders, mapped onto the portal's imagery categories |
| `uploads/Qvantum_Logos_SVG_v1/` | The six official logo SVGs — logotype and symbol, in colour, white and black |

Not available and therefore not reproduced: the official website HTML/CSS, the `.potx` file itself, the Q-ring gradient element as a standalone asset, and the branded infographic backgrounds `Qvantum_graphical_3_cold` / `Qvantum_graphical_4_cold`.

## Content fundamentals

**Voice.** Four pillars: Confident, Human, Clear, Ambitious. Speak from real results, not from superlatives. Talk to people, not at them. Make the complex understandable, and give every piece of copy a direction. The Voice cards carry the full do/don't list.

**Register.** Narrative language — the quiet force, the steady current, progress as movement — belongs to heroes, campaign openers and video. Installer documentation, spec sheets and support pages follow the Clear pillar instead. Decide which of the three audiences you are addressing (homeowners, property managers, installers) before writing, and keep the language simple enough that the other two would still follow it.

**Person.** Address the reader as *je* / *jij* in marketing and product copy; *u* only in formal tender or legal documents. Speak about the company as *we*, not "Qvantum" in the third person, once the brand is established on the page.

**Sentences.** Short. Lead with the benefit, then the mechanism. Active voice. One idea per sentence, one claim per paragraph. Cut every word that does not carry information.

- Yes: *"Vervang de gasketel zonder de woning te verbouwen."*
- Yes: *"Eén unit, één aansluiting, geen verrassingen op de bouwplaats."*
- No: *"Onze innovatieve, toekomstbestendige oplossingen zijn ontworpen om maximale waarde te ontsluiten."*

**Headlines.** Sentence case, no full stop, no colon-plus-subtitle constructions. A headline states a position: *"Warmte als systeem"*, *"Fossielvrij verwarmen, op elke schaal"*, *"Van plan naar uitvoering"*. Body copy does end in full stops.

**Labels.** ALL CAPS is only used at 12px label size (uppercase, 1.2px tracking) for section, category and audience markers: `WONINGCORPORATIES`, `ONZE AANPAK`, `CASE`. Never set a headline or a button in caps.

**Numbers.** Dutch conventions — `12.400` woningen, `75%`, `4 kW`, `€ 1.250`. Oversized figures are set in Regular, optionally in brown as a visual anchor; keep the caption beside them to a single plain line. Claims are carried by concrete figures wherever they exist, and impact is stated at scale (homes, cities, emissions avoided) rather than as product specifications alone.

**Jargon.** Explain or avoid. `SCOP`, `warmtenet`, `wijkuitvoeringsplan` are fine for municipalities and consultants; spell them out for residents. Sector English (*plug & play*, *retrofit*, *asset*) stays as-is where the industry uses it.

**Emoji: never.** Not in headings, not in body copy, not in social captions written for this brand. Unicode characters are not used as icons or bullets either — lists use real list markup, and icons come from the icon set.

**Italics: never.** Emphasis is made with weight, size or colour. This is a hard brand rule and the CSS enforces it (`em, i, cite { font-style: normal }`).

## Visual foundations

**The feeling.** Light, modern, spacious. The reference point for polish and whitespace is tesla.com: mostly white and off-white, very few lines, very large type set at Regular weight, and a lot of air. If a layout feels crowded, remove an element rather than shrink the gaps.

**Colour.** The brand leads with black and white: Off-black `#232222` and Off-white `#F4F4F4` are the primary colours, and colour enters mainly through imagery. Brown `#91877A` is a secondary accent used for headers, section labels, second lines, dividers and oversized figures — in print and slides as much as on web, but never as the default heading colour. Blue `#3164FD` is the single highlight colour for links, hover and CTAs on dark or image backgrounds. Off-white `#F4F4F4`, White and Beige `#E5E6DF` carry the surfaces; beige also owns the footer. The accent set (Navy, Blue, Blue light, Red, Orange, Yellow) is for charts, infographics and focus points inside illustrations — never for decoration. At most one or two background tones per page or deck.

**Type.** Host Grotesk, one typeface, two weights: Regular 400 and SemiBold 600. Nothing else ships, so 500 and 700 would be synthesised. Hierarchy comes from the size jump, not the weight jump: H1 60/68, H2 42/48 and hero figures are all Regular 400, while the small stuff (H4 24/30, H5 20/24, labels 12/18) is SemiBold 600. Print and slides follow the Rule of 4 — roughly 4× between the smallest and largest sizes on a page (8 → 12 → 40 → 52 → 80 pt).

**Backgrounds.** Predominantly flat white and off-white. Photography appears full-bleed (heroes, section openers) or inside a 4:3 media area in cards and splits. No repeating patterns, no textures, no hand-drawn illustration, no gradient fields behind content. The three supplied gradient banners already contain the logo and are used whole, as banners. The Q-ring gradient element goes on photography only — never on plain colour and never in a text-heavy layout.

**Dark blocks.** Avoided, with one sanctioned exception: a full-width navy `#002656` band for figures and stats (`StatBand`). One per page at most.

**Shadows and gradients on UI: none.** Depth comes from surface tone changes and 1px hairlines (`#DEDFD8`). `--shadow-none: none` exists so consumers do not invent their own. The only gradient allowed in a layout is the bottom-up protection scrim over a hero photograph — that is image protection, not a UI gradient, and it is never applied to a colour field.

**Cards.** Flat fill, 4px radius, 1px hairline border or a tone change instead of a border. No shadow, no coloured left border, no icon badge in the corner. Media sits flush at the top of the card at 4:3; body padding is 24px; the action pins to the bottom.

**Corner radii.** 4px for cards, media and fields; 8px for buttons and dialogs; pill for switches and circular icon controls; 0 for full-bleed media. Nothing in the system is more rounded than 8px except deliberately circular elements.

**Borders.** One hairline weight, `1px solid var(--border-hairline)`. `--border-strong` is for form control outlines and the footer rule. Brown dividers are 2px and belong to print and slides, used sparingly.

**Buttons.** Rounded rectangle, no border, no icon inside, ever. On light backgrounds: beige fill, off-black text, hover to a darker beige `#D6D7CE`. On image or dark backgrounds: blue fill, white text, hover to `#1E4BD8`. A third `ghost` variant is plain blue text for secondary actions. Disabled is 40% opacity, no colour change.

**Hover and press.** Colour only, 120ms, `cubic-bezier(.4,0,.2,1)`. No lift, no shadow bloom, no scale on buttons or cards. Links move from Blue to a darker blue and gain a 3px-offset underline. Images inside a linked card may scale to 1.02 over 400ms — the one motion flourish in the system. Press state reuses the hover colour; there is no separate shrink.

**Focus.** 2px solid Blue outline with 2px offset, on every focusable element. Never removed.

**Animation.** Restrained. Entrances are short fades or 12–16px rises over 400–600ms, `ease-out`, once — no bounce, no spring, no parallax, no autoplaying carousels. `prefers-reduced-motion` zeroes every duration token.

**Transparency and blur.** Almost never. Permitted: the off-black scrim behind a dialog (50%), the bottom-up hero scrim, a low-opacity branded image inside the navy stat band (22%), and white-on-image icon buttons at 16–28% white. No frosted-glass panels, no blurred navigation bars.

**Layout.** 1440px max container, 1120px for text-led pages, 32px page padding, 24px gutters, 64ch measure for running text. Sections are 96px top and bottom by default (48px tight, 160px loose) and alternate white and off-white. The header is sticky, 72px tall, hairline bottom border; nothing else is fixed. Everything must hold up at mobile width — grids collapse with `auto-fit, minmax()` rather than breakpoint-specific rewrites.

**Imagery vibe.** The brief calls for modern architecture and urban landscapes, natural light, authentic unposed moments and unexpected perspectives — shot from behind, from above, through glass. Tones travel between warm (amber, beige, terracotta) and cool (navy, slate, daylight blue), matching the temperature spectrum the palette is built on. No grain, no heavy grade, no cheesy families with kids, no over-staged installer portraits. Black and white is permitted in one place only: Construction imagery, where colour clashes with the surrounding content.

**What was actually supplied — and what is missing.** The asset pack contains three categories: studio **product renders** on dark fields with a soft light core (`assets/products/renders/`, plus the three QA/QE/QG shots on gradients in `assets/products/`), eight **abstract light** photographs in the temperature spectrum (`assets/backgrounds/abstract/`), and three ready-made **gradient banners** with the logo already placed (`assets/backgrounds/gradients/`). There is **no architectural, urban, living or installation photography** in the pack, so heroes and section openers currently use the abstract light images. The components take any image URL, so swapping in real photography is a one-line change per instance.

**Stock library.** A Pixieset export of 304 stock frames sits outside this project, indexed per file in `uploads/qvantum-stock-index.csv` and mapped to the portal's categories on the Stock image library card. Pick the folder by audience: Human and SDU for homeowners, MDU for property managers and housing associations, Urban_and_City for municipalities and systemic stories, Data_Driven_Digital for software and connectivity, Other for light and texture behind text. The library skews warm, so pull a cold Urban_and_City frame when a layout runs beige. 186 are portrait against 115 landscape and 3 square, so check the index before promising a wide hero crop. Three categories have no coverage at all — Construction, Installing beyond three service-desk frames, and every kind of product imagery, which comes from SharePoint and never from stock.

**Illustrations and diagrams.** Isometric where possible, two line weights (`x` and `2x`), accent colours used only to point at the thing that matters. Do not draw brand marks or product silhouettes by hand — use the supplied renders.

## Iconography

Icons are functional, never decorative, and they are never used in menus or buttons. Two sets:

- **UI, circle-based:** `arrow-circle-left`, `arrow-circle-right`, `arrow-circle-up`, `arrow-circle-down`, `plus-circle`, `minus-circle`, `x-circle`, `check-circle`, `info`, `magnifying-glass`, `share-network`, `arrow-down`. Used for sliders, disclosure, search and share affordances.
- **Contextual, line-based:** used inside infographic blocks and content sections — `cloud-lightning` (100% elektrisch), `plug` (plug & play), `thermometer-hot`, `snowflake`, `buildings`, `house-line`, `wrench`, `gauge`, `leaf`, `waves`.

**Library: Phosphor Icons.** Qvantum uses Phosphor at the **thin** weight, which matches the brand's thin-stroke rule. No icon files were supplied in the asset pack, so the `Icon` component loads the matching Phosphor weight stylesheet from CDN on first use (`https://unpkg.com/@phosphor-icons/web@2.1.1/src/thin/style.css`) and renders glyphs as `<i class="ph-thin ph-{name}">`. Icon names are Phosphor names without the `ph-` prefix. If the brand later ships its own drawn set, drop the SVGs into `assets/icons/` and point `Icon` at them.

No icon font is bundled. Emoji and unicode glyphs are never used as icons. Carets in `Select` and the plus/minus marker in `Accordion` are drawn from CSS borders, not glyphs, so they always match the hairline weight.

## Logo

Six official SVGs in `assets/logos/` (`qvantum-{logo,symbol}-{colour,white,black}.svg`). These are the files components and cards use. Full logotype for headers, covers and title slides; symbol only for favicons and tight spaces. Colour on white or light; White on dark or coloured; Black for monochrome and image overlays. Placement top-left for the logotype, top-right for the symbol. Clear space of at least one symbol width on all sides. Never recolour, distort, restyle or rebuild it, and never put the colour variant on a colour field or a photograph.

**Colour construction.** The colour variant is navy `#002656` and red `#C41230`; that is a logo rule and does not make navy or red an accent colour for headings. The black variant is `#14110C`, a logo-specific black that is deliberately not the off-black text colour — do not substitute one for the other.

**Superseded:** the original pack shipped six files that were JPEG data with a `.png` extension on a solid black background, from which transparent PNGs were derived. Those PNGs are still in `assets/logos/` but nothing references them; the SVGs replaced them.

## Intentional additions

No component inventory was supplied, so the system authors a standard set sized to the brand's output. Two additions worth naming:

- **`Icon` / `IconButton`** — a wrapper for Phosphor Icons, because the brand names a specific icon inventory but ships no files. `IconButton` is the single sanctioned place an icon may sit inside a control (carousel, dismiss).
- **`StatBand`** — the navy figures block described in the web guide as the one exception to "no dark blocks". It exists as a component so the exception stays contained.

## Index

**Root**
- `styles.css` — the entry point consumers link. Nothing but `@import` lines.
- `readme.md` — this file.
- `SKILL.md` — Agent Skill front matter, for use outside this project.
- `thumbnail.html` — homepage tile.

**`tokens/`** — `fonts.css` (@font-face + families), `colors.css` (base palette, semantic aliases, chart series), `typography.css` (scale, weights, `.q-*` helper classes), `spacing.css`, `radius.css`, `motion.css`, `base.css` (reset, links, focus, containers).

**`assets/`** — `fonts/` (four Host Grotesk TTFs), `logos/` (six official SVGs, plus the superseded PNGs), `backgrounds/gradients/`, `backgrounds/abstract/`, `products/` (QA, QE, QG on gradients) and `products/renders/` (five studio renders on dark fields). No lifestyle or architecture photography was supplied.

**`components/`**
- `core/` — `Button`, `IconButton`, `Icon`, `Logo`, `Label`, `Divider`
- `forms/` — `Input`, `Select`, `Checkbox`, `Radio`, `Switch`
- `content/` — `Card`, `ProductCard`, `Badge`, `StatBlock`, `StatBand`, `Accordion`, `Tabs`
- `layout/` — `Section`, `Hero`, `MediaSplit`
- `navigation/` — `Navbar`, `Footer`, `Breadcrumb`
- `feedback/` — `Dialog`, `Toast`, `Tooltip`
- `data/` — `BarChart`

Each directory holds `<Name>.jsx`, `<Name>.d.ts`, `<Name>.prompt.md` and one `*.card.html` specimen.

**`guidelines/`** — foundation specimen cards: colour (primary, supporting, accents, chart series, web roles, print roles, pairings), type (display, headings, body, label, hero numbers, weights), spacing (scale, section rhythm, radii, flat surfaces), brand (logotype, symbol and clear space, product renders, gradient banners, abstract light, product shots, iconography, interaction and motion).

**`ui_kits/website/`** — click-through recreation of the marketing site: home, solutions, product detail, contact. See its own `README.md`.

**`slides/`** — sample slides mapped to the PowerPoint template layouts: title, triple messages, paragraph, dual information, chart, section divider, full-page image, end slide.
