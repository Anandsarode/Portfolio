# Atelier Link — Editorial Link-in-Bio & Analytics Studio

Atelier Link is a customizable editorial landing page builder and analytics platform that lets creators, founders, and artists curate their links, social profiles, and rich media embeds in a refined monograph-inspired page while tracking real visitor engagement through a drag-and-drop analytics workspace and connecting custom domains with live DNS and SSL verification.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product and design choices have been confirmed from your preferences and govern the implementation:

- **Confirmed Aesthetic Direction**: Editorial luxury aesthetic featuring expressive serif display typography (`Cormorant Garamond`), crisp geometric sans body copy (`Plus Jakarta Sans`), and warm stone and alabaster neutral surfaces.
- **Confirmed Landing Page Content Blocks**: Featured links with custom thumbnails and unboxed editorial metadata, a unified social media icon bar and profile header, and rich media embeds for music and video links (YouTube, Spotify, Vimeo, SoundCloud, and direct audio/video).
- **Confirmed Custom Domain Workflow**: Full domain manager supporting custom root and subdomain entries, real-time DNS record verification (`CNAME`, `A`, `TXT`) via server-side lookup, live TLS/SSL certificate inspection, and configurable HTTP redirect rules (301 Permanent / 302 Temporary, `www` canonicalization, and path forwarding).

---

## 1. Overview & Core Concept

- **What It Does**: Provides a dual-mode studio and live public landing page. Users can customize their profile header, social links, featured thumbnail links, and rich media embeds using drag-and-drop reordering, inspect and rearrange modular analytics widgets via drag-and-drop, and configure custom domains with live DNS/SSL health checks and redirect rules.
- **Target Audience / Persona**: Independent creators, creative directors, musicians, writers, and brands seeking a magazine-grade personal landing page with actionable traffic intelligence and full domain ownership.
- **Key Value**: Eliminates generic, cookie-cutter link lists by combining bespoke editorial typography and layout customization with real server-backed click/view attribution and live DNS/TLS domain verification.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Live Landing Page & Studio Workspace**:
   - The top navigation bar adheres to the strict 3-zone Top Bar Contract: the brand wordmark on the left, four concise single-line workspace navigation links in the center (`Page Builder`, `Analytics`, `Domains`, `Appearance`), and a single primary action (`View Live Page`) on the right.
   - Switching to `View Live Page` opens the full-viewport editorial landing page exactly as visitors see it, where every link click, social profile tap, and media interaction records a real attribution event to the backend.
2. **Drag-and-Drop Page Builder**:
   - Left column provides block management and inline editors; right column renders a responsive interactive preview of the landing page.
   - Users can add, edit, toggle visibility, delete, and drag-and-drop reorder Featured Links (with custom thumbnails, subtle editorial category/date/status text kickers), Social Media Profile Links, and Rich Media Embed blocks.
3. **Drag-and-Drop Analytics Canvas**:
   - Displays real-time and historical page views, link clicks, click-through rate (CTR), top-performing links, referrer breakdown, device distribution, and geographic/time-series activity.
   - Users can drag and rearrange analytics cards across the grid to prioritize the metrics that matter most to their workflow, filter by date window (`7 Days`, `30 Days`, `All Time`), or export raw event telemetry as CSV.
4. **Full Custom Domain Manager**:
   - Users register custom domains or subdomains, configure required `A`, `CNAME`, and `TXT` records, and run live DNS resolution and SSL/TLS certificate handshakes directly from the backend.
   - Includes a Redirect Rules Engine where users define path or domain forwarding rules (301/302) and primary domain canonicalization.

### Visual Identity & Theme
- **Aesthetic Direction**: High-fashion editorial monograph meets precision studio workspace. Generous whitespace, single-elevation cards with 1px hairline borders, and zero pill-badge clutter.
- **Color Palette & Mood (60-30-10 Distribution)**:
  - *60% Dominant Neutral Canvas*: Warm Alabaster (`#FAF8F5`) in Light Mode and Deep Obsidian Slate (`#0C0C0E`) in Dark Mode.
  - *30% Structural Surfaces*: Soft Travertine (`#F3EFEA`) / Charcoal (`#16161A`) containers with subtle hairline dividers (`#E6E1DA` / `#26262B`) and muted stone typography (`#6E6A63`).
  - *10% Accent Budget*: Deep Espresso Ink (`#181615`) for primary structural CTAs paired with Burnished Terracotta/Cinnabar (`#C84B31`) for focal interactive highlights and active states. Semantic indicators use explicit text labels alongside Forest Green (`#15803D`), Ochre (`#B45309`), and Crimson (`#B91C1C`).
- **Typography & Hierarchy (2+1 Font Rule)**:
  - *Display & Editorial Headings*: `Cormorant Garamond` (600/700 weight, tight tracking, `text-wrap: balance`) for profile titles, section headers, and featured editorial callouts.
  - *UI & Body Prose*: `Plus Jakarta Sans` (400/500/600) for clean scannability across studio controls, descriptions, and navigation.
  - *Telemetry, DNS Records & Analytics Metrics*: `JetBrains Mono` with `tabular-nums` for click counters, CTR percentages, IP addresses, SSL expiry timestamps, and DNS TTL values.
- **Component Styling & Layout**:
  - Desktop 1440px baseline with balanced 2-column split in the Page Builder and full-width Bento grid in the Drag-and-Drop Analytics workspace.
  - Metadata (link categories, click counts, domains, timestamps) rendered as clean unboxed inline text separated by middots (`·`), never wrapped in static pill capsules.

### Interactive Feedback & Motion
- Smooth drag-and-drop reordering (`transform` and `opacity` transitions settling within 150ms) for both landing page content blocks and analytics dashboard widgets.
- Instant visual feedback on link clicks, copy-to-clipboard actions, live DNS lookup results, and theme customization changes.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Real Server-Side DNS & TLS Verification vs. Simulated Status Toggles**
  - *Chosen Approach*: Implement backend API endpoints using Node's native `dns.promises` (`resolve4`, `resolveCname`, `resolveTxt`) and `tls`/`https` socket inspection to query real public DNS resolvers and inspect real SSL certificates for any domain the user enters.
  - *Why*: Ensures 100% authentic domain diagnostics without mock timers or fake verification badges. Users can test any live domain or inspect exact DNS propagation expectations for their newly added domain.
  - *Alternatives Considered*: Client-only regex validation was rejected because it cannot inspect real DNS records or TLS certificate issuers.
- **Decision 2: Persistent Server-Backed State & Real Event Telemetry**
  - *Chosen Approach*: Persist profile customization, link blocks, analytics widget layout order, custom domains, redirect rules, and granular click/view events on the Express backend (backed by a durable JSON datastore on disk) with immediate synchronization to the client.
  - *Why*: Guarantees zero data loss across page reloads, allows the public landing page view to record real visitor click/view timestamps, and powers authentic time-series and per-link CTR analytics.
- **Decision 3: Native Pointer/HTML5 Drag-and-Drop Grid for Both Links & Analytics Modules**
  - *Chosen Approach*: Build a tactile drag-and-drop sorting engine supporting both vertical block reordering (in the Page Builder) and 2D Bento widget rearrangement (in the Analytics Studio), complete with keyboard move controls for accessibility.
  - *Why*: Delivers smooth, zero-latency reordering and persists custom widget layouts directly to the user's profile configuration.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        Top Navigation Bar (3-Zone)                         │
│  [Atelier Link]     [Page Builder · Analytics · Domains · Appearance]      │
│                                                          [View Live Page]  │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        ▼                             ▼                             ▼
┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────────┐
│  Page Builder & Theme │   │ Drag & Drop Analytics │   │ Full Domain Manager   │
│  ───────────────────  │   │ ───────────────────── │   │ ───────────────────── │
│  • Profile & Socials  │   │ • Rearrangeable Grid  │   │ • Domain Registration │
│  • Featured Links     │   │ • Time-Series & CTR   │   │ • Live DNS Lookup     │
│  • Rich Media Embeds  │   │ • Per-Link Breakdown  │   │ • Live SSL Inspector  │
│  • Live Page Preview  │   │ • CSV Telemetry Export│   │ • 301/302 Redirects   │
└───────────┬───────────┘   └───────────┬───────────┘   └───────────┬───────────┘
            │                           │                           │
            └───────────────────────────┼───────────────────────────┘
                                        ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                     Express API & Real Telemetry Engine                    │
│  • /api/profile        (GET/PUT profile, theme, blocks, widget order)      │
│  • /api/analytics      (POST click/view events, GET aggregated telemetry)  │
│  • /api/domains/verify (POST real Node dns.promises + TLS cert handshake)  │
│  • /api/domains        (CRUD custom domains & 301/302 redirect rules)      │
└────────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State
- **Profile & Appearance Configuration**: Display name, handle, editorial bio, avatar/cover imagery, active editorial palette preset (Warm Alabaster, Ivory Monograph, Obsidian Nocturne, Sage Atelier), typography scale, and layout style.
- **Content Blocks**: Ordered array of typed blocks (`featured_link`, `media_embed`, `editorial_note`) with ID, title, subtitle/kicker, destination URL, thumbnail image, embed provider/URL, visibility flag, and sort index.
- **Social Profiles**: Platform identifier (`instagram`, `x`, `youtube`, `spotify`, `linkedin`, `github`, `substack`, `website`), handle/URL, and active state.
- **Analytics Telemetry & Widget Layout**:
  - *Events*: Timestamp, event type (`page_view`, `link_click`, `social_click`, `media_play`), target block ID, referrer category, and viewport/device type.
  - *Widget Order*: User-customized array of analytics module IDs (`kpi_overview`, `traffic_timeline`, `top_links_table`, `referrer_breakdown`, `device_split`, `conversion_funnel`) with span sizes (`half` or `full`).
- **Custom Domains & Redirect Rules**:
  - *Domain Record*: Domain hostname, target `CNAME`/`A` value, verification `TXT` token, live DNS lookup results (`resolvedAddresses`, `cnameTarget`, `lastCheckedAt`), live SSL certificate details (`issuer`, `validFrom`, `validTo`, `protocol`, `status`), and primary flag.
  - *Redirect Rule*: Source path/domain, destination URL, HTTP status code (`301` or `302`), and enabled toggle.

### Interactive Component & State Mapping
- **Block & Link Editor**: Adding, editing, or reordering any link, social icon, or media embed immediately updates the live preview and persists via `PUT /api/profile`.
- **Live Landing Page Interaction**: Clicking any featured link, social icon, or media embed on the preview or full-screen live landing page fires `POST /api/analytics/event`, incrementing real click counters and updating the analytics widgets in real time.
- **Drag-and-Drop Analytics Grid**: Dragging any analytics widget card onto another slot swaps their grid positions and saves the new layout order to the backend; toggling widget width (`1-Column` vs `2-Column`) dynamically reflows the Bento grid.
- **Real DNS & SSL Prober**: Clicking `Verify DNS & SSL` on any custom domain triggers `POST /api/domains/verify`, which performs actual `dns.promises.resolve4`, `resolveCname`, `resolveTxt`, and `tls.connect` inspection on the server and displays real resolved records, certificate issuer, validity window, and actionable configuration steps.
