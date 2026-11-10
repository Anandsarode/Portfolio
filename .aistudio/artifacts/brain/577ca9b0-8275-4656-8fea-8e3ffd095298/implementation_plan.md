# Atelier Link — High-Profile Dark Animated Portfolio & Viewer Analytics Studio

Atelier Link is a dark-theme portfolio builder, link showcase, and analytics studio that lets you craft a multi-chapter, cinema-grade portfolio with interactive 3D tilt cards and staggered motion reveals. When you share your public portfolio link, visitors never need an account or login—they are greeted once by a sleek dark welcome curtain asking only for their name, which is logged exclusively to your private Analytics dashboard alongside their live interactions.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and UX decisions have been confirmed from your answers and govern the build:

- **Confirmed Dark-Theme Animation Engine**: All-dark obsidian aesthetic (`#07080A` canvas, `#0F1116` structural cards, `#F4F6FB` crisp light typography) powered by `motion/react` staggered entrance choreography, multi-chapter page transitions, and pointer-reactive 3D perspective tilt cards with dynamic specular lighting.
- **Confirmed Frictionless Visitor Access & One-Time Name Curtain**: Opening the shareable portfolio link (`?portfolio=1` or `/p/:handle`) requires zero login, password, or email. A sleek dark welcome curtain prompts the visitor once for their name, stores it locally so they are never asked again on return visits, and unlocks the full animated portfolio.
- **Confirmed Portfolio Sections**:
  1. **Case Study Gallery with Fullscreen Media Lightbox** (interactive 3D tilt project cards with client, year, role, outcome metrics, and fullscreen lightbox inspection).
  2. **Experience Timeline & Interactive Skill Matrix** (career milestones and filterable capability proficiency architecture).
  3. **Interactive Audio & Video Showreel Theater** (widescreen cinema player + polyphonic Web Audio synthesizer studio master).
  4. **Featured Links & Social Channels with Live Click Tracking** (curated outbound links and verified social profiles).
- **Confirmed Owner-Exclusive Viewer Name Analytics**: Only the portfolio owner in the Studio Analytics tab can view the **Named Viewer Registry & Interaction Ledger**, showing each visitor's name, visit timestamp, device, and which case studies, links, or showreels they explored.

---

## 1. Overview & Core Concept

- **What It Does**: Combines a full-featured Portfolio & Link Studio (for the owner) with a standalone, shareable, multi-animation dark-theme Public Portfolio (for visitors).
- **Target Audience / Persona**: Executive creatives, principal engineers, film directors, architects, and founders sharing a high-impact portfolio link with clients, recruiters, or partners.
- **Key Value**: Gives visitors an unforgettable, zero-friction dark-mode interactive portfolio experience while giving the portfolio owner transparent visibility into *who* viewed their portfolio by name and what work resonated most.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Shareable Public Portfolio Link Flow (Visitor Experience)**:
   - When a visitor opens the shared portfolio URL (or clicks `Share / Open Visitor Link`), the Studio chrome is completely hidden and the dark-theme Public Portfolio loads.
   - **One-Time Dark Welcome Curtain**: If the visitor has not yet entered their name in this browser, a sleek obsidian curtain (`#07080A`) appears with staggered typographic reveal asking only for their **Name** and an `"Enter Portfolio"` button.
   - Upon submitting their name, the curtain parts with a smooth `cubic-bezier(0.16, 1, 0.3, 1)` animation, recording a `portfolio_visit` event with their name to the server and unlocking the multi-page animated portfolio.
   - Visitors can navigate smoothly across animated portfolio chapters (`All Chapters`, `Case Studies`, `Showreel Theater`, `Experience & Skills`, `Links & Channels`), hover 3D tilt cards, open the fullscreen Case Study Lightbox, and play audio/video reels—with every interaction attributed to their name.
2. **Portfolio & Link Builder Flow (Owner Studio)**:
   - Allows the owner to create, edit, and drag-and-drop reorder **Case Studies**, **Experience Timeline & Skill Matrix entries**, **Showreel Media Embeds**, and **Featured Links & Social Profiles**, while previewing the live animated dark portfolio side-by-side.
   - Includes a one-click **Copy Public Portfolio Link** control and a **Test Visitor Welcome Curtain** button so the owner can experience the exact visitor onboarding flow at any time.
3. **Drag-and-Drop Analytics with Named Viewer Ledger (Owner Exclusive)**:
   - Features a dedicated **Named Portfolio Viewers** widget at the top of the rearrangeable analytics grid.
   - Displays every visitor's name, first/last seen timestamp, total interactions, device type, and a chronological breakdown of the exact case studies and links they clicked.

### Visual Identity & Theme
- **Aesthetic Direction**: High-contrast obsidian cinema portfolio & architectural studio (`#07080A` deep carbon background, `#0F1116` elevated card surfaces, `#1E222D` 1px structural borders, electric cobalt `#3B82F6` and warm amber `#F59E0B` focal accents).
- **Typography & Hierarchy (2+1 Font Rule)**:
  - *Display & Portfolio Titles*: Switchable between `Syne`, `Bricolage Grotesque`, `Fraunces`, `Bodoni Moda`, and `Oswald` with optical dark-mode tracking compensation.
  - *Body Prose*: `DM Sans` / `Urbanist` for high-legibility dark-mode reading.
  - *Metrics, Index Numbers & Timestamps*: `IBM Plex Mono` with `tabular-nums`.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dedicated Public Visitor Route (`?portfolio=1`) vs. Studio Preview**
  - *Chosen Approach*: Support both an in-studio interactive preview and a dedicated public visitor mode (`?portfolio=1` URL parameter or `View Public Portfolio` mode) that hides all studio editing controls and enforces the one-time Viewer Name Welcome Curtain.
  - *Why*: Ensures that when you share your link with anyone, they see only your dark animated portfolio and the one-time name prompt—never the admin studio or analytics tab.
- **Decision 2: Compositor-Only 3D Tilt & Staggered Motion (`motion/react`)**
  - *Chosen Approach*: Drive all card tilts, chapter transitions, and lightbox reveals using hardware-accelerated `transform` (`perspective(1000px) rotateX(...) rotateY(...) scale3d(...)`) and `opacity`.
  - *Why*: Delivers 60fps interactive responsiveness and respects `prefers-reduced-motion`.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                  Visitor Shareable Link (?portfolio=1)                     │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ One-Time Dark Welcome Curtain (Asks Viewer Name Only — No Login)     │  │
│  └───────────────────────────────────┬──────────────────────────────────┘  │
│                                      ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ Multi-Animation Dark Portfolio Showcase (motion/react + 3D Tilt)     │  │
│  │  • Animated Hero & Multi-Chapter Switcher                            │  │
│  │  • 3D Tilt Case Study Cards + Fullscreen Media Lightbox              │  │
│  │  • Interactive Audio/Video Showreel Theater                          │  │
│  │  • Experience Timeline & Interactive Skill Matrix                    │  │
│  │  • Featured Links & Social Channels                                  │  │
│  └───────────────────────────────────┬──────────────────────────────────┘  │
└──────────────────────────────────────┼─────────────────────────────────────┘
                                       │ POST /api/analytics/event (with viewerName)
                                       ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                Owner Studio & Drag-and-Drop Analytics                      │
│  • Portfolio & Case Study Builder (Case Studies, Timeline, Skills, Links)  │
│  • Owner-Only Named Viewer Registry (Viewer Name, Timestamp, Clicked Work) │
│  • Custom Domain DNS/SSL Verifier & Daily Endpoint Health Check            │
└────────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State Additions
- **CaseStudyItem**: `id`, `title`, `client`, `year`, `role`, `category`, `summary`, `challenge`, `outcomeMetric`, `coverImage`, `tags`, `liveUrl`, `enabled`, `views`.
- **ExperienceItem**: `id`, `period`, `role`, `organization`, `location`, `highlights`.
- **SkillItem**: `id`, `name`, `category` (`Architecture`, `Interactive & 3D`, `Sound & Media`, `Systems`), `proficiency` (0–100), `projectsCount`.
- **AnalyticsEvent Enhancement**: Adds `viewerName?: string` and `sessionId?: string` to every recorded event (`portfolio_visit`, `case_study_view`, `link_click`, `media_play`, `social_click`), enabling the Owner Analytics view to group and filter activity by each named viewer.
