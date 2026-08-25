<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# MageAudit

Marketing site for MageAudit — a tool that scans a Magento store's public pages and reports on speed, theme, extensions, security vulnerabilities and SEO. Product of Limely Ltd, sibling to MageDrop.

**Naming:** The product was originally "MageScan" (name taken). Now **MageAudit** (mageaudit.com). All branding reads from `lib/site.ts` — rename there only, never hardcode the product name in components.

**Scanner backend:** The actual scan functionality is being built separately by another agent, who will document it in `scan.md` at the project root. Read `scan.md` if it exists before touching anything scan-related, and do not overwrite it from this side.

## Stack

- Next.js 16 (App Router, TypeScript, Turbopack)
- Tailwind CSS v4 (theme tokens in `app/globals.css` via `@theme` — no tailwind.config)
- Plus Jakarta Sans via `next/font`
- No other runtime dependencies; all icons are inline SVG

## Commands

- `npm run dev` — dev server
- `npm run build` — production build (verify changes with this)
- `npm start` — serve production build

## Structure

- `lib/site.ts` — **single source of truth for brand** (name, domain, contact email, company details)
- `app/layout.tsx` — font, metadata, JSON-LD (all derived from `lib/site.ts`)
- `app/page.tsx` — landing page; composes sections and holds smaller ones inline (compat bar, how-it-works, testimonial, why, CTA banner)
- `components/Hero.tsx` — hero with report mockup and scan-sweep animation
- `components/ScanForm.tsx` — **integration point for the real scanner**. Currently a placeholder: fakes a 2.8s scan then shows a "launching soon" note. Wire up by replacing `handleSubmit` with a POST to the scan API and redirecting to the report page.
- `components/Features.tsx` — five big feature cards (Speed, Theme, Vulnerabilities, Extensions, SEO) + small features grid
- `components/Logo.tsx` — animated stacked-layers logomark (client component; Web Animations API drop-in on mount, layers separate on hover)
- `components/PlatformBadge.tsx` — "Scans Magento / Adobe Commerce / Hyvä / Mage-OS" pill with three responsive variants (icons-only ≤375px, one-label carousel to md, all labels md+)
- `components/ui.tsx` — shared bits: `ArrowIcon`, `CheckIcon`, `CheckListItem`, `ExpandingCta` (pill CTA that expands label on parent `.group` hover), `OutlineIcon`
- `public/images/logos/` — platform logos for the compat bar (copied from the MageDrop project)

## Design language

The design is ported from the MageDrop homepage (`../magedrop/MagentoScheduler/resources/views/home.blade.php`) — keep the two sites visually consistent:

- Monochrome gray-900/white palette; emerald/amber/red only for pass/warn/fail states
- Warm cream hero gradient (`#FAF3EF` → white) with a faint dot grid (`.hero-grid`)
- Rounded-full pill buttons (gray-900 fill, hover lift `-translate-y-0.5`)
- UI mockups inside cards: browser chrome with three gray dots, `rounded-2xl`, `shadow-2xl`
- Section pattern: tiny uppercase gray-400 kicker, then bold tracking-tight heading
- Feature cards: `rounded-3xl` bordered, text panel + mockup panel split; dark `bg-gray-950` mockup panels for contrast variety
- Small-feature grids use explicit 1px inline borders (`#e5e7eb`), not gap tricks
