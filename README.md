# Teenseys' — interactive shopping town starter

This is a working **front-end prototype** (v1.0), built as a single self-contained `index.html` file. The project is branded as **Teenseys'**. This name appears in the title and website header.

## Run it

- **On your computer:** double-click `index.html` in a modern browser.
- **On GitHub Pages:** create a new repository (for example `teenseys`), add `index.html` at the repository root, then go to **Settings → Pages → Deploy from a branch → main / (root)**. Use the URL GitHub provides once deployed.

## Features included

- Welcome screen: Enter as guest, Sign in and Create account (the latter two are visibly **not yet connected**, and do not collect credentials).
- Six small pixel-art characters to choose from.
- Town-square scene; walk to **THE THREADS SHOP** and press **E** to enter.
- Walkable boutique interior with clearly separated color/category racks.
- Walk near a rack and press **E** or click it to open its product card.
- Prev/next arrow buttons, keyboard left/right arrows and mobile swipe to move through **only that rack's products**, without closing the item card.
- An in-game **Browse all** grid panel, with the store visible in the background, and category filters.
- NPC employee offers fixed dialogue; no user-to-user messaging, chat, emotes, friend requests or other interaction.
- Sample add-to-bag, bag review, and remove-item flow.
- Responsive mobile direction pad and interaction button.
- No external scripts, paid libraries, or asset downloads needed.

## Limitations / next steps

- This is **not** real live multiplayer: moving shoppers are locally simulated to show the atmosphere.
- Product visuals are **sample 2D illustrations**, not real 3D GLB shirt models. We can replace the preview with a 3D viewer once products and models exist.
- The Sign in / Create account options are **placeholders**; **no real accounts or cross-device saves exist yet**. Implement those with Supabase Auth and a database for character/progress/favorites.
- Cart is a front-end demo only and resets on reload. Connect a real Shopify cart and secure Shopify checkout later.
- One store is walkable. Two nearby storefronts are decorative and marked coming soon.
- Pixel-art graphics are programmer-generated placeholders. Original artwork, branding, real products, and a larger map can be added next.
- Do not interpret lack of chat as a complete child safety system. For a live public release, add appropriate privacy, abuse, age-related, and platform safeguards. Avoid custom usernames, text fields or user-generated signage that can become communication channels.

## Controls

- WASD or arrows: walk
- E or Enter: interact with the nearest store, rack, NPC, or exit
- Mouse click: select a nearby rack or door
- ESC: close panel / return to browse-all when it opened the product card
- Left/right arrows on a product card: browse that rack
- Touch screen: on-screen direction buttons, Interact and swipe gestures on the product card

## Suggested implementation roadmap

1. Tune game layout, graphics, hitboxes and interactions based on your feedback.
2. Add Supabase Auth, saved character and location, anonymous guest upgrades and account persistence (never store passwords in localStorage).
3. Add live room-presence (visible visitors, **no social communications**), server-side filtering/moderation and performance limits.
4. Connect a single live Shopify catalog, product media, stock/variants, cart and checkout.
5. Replace the illustrated sample preview with actual GLB/USDZ models for products where available.
6. Expand into the town and introduce merchant-specific stores and administration.


## Pixel-art asset pass (v0.5)

- Started integrating **Kenney Tiny Town**, a 16×16-pixel **CC0** tile pack, as real sprite artwork in the town and boutique.
- Pack: https://kenney.nl/assets/tiny-town
- Current prototype loads its atlas from a public raw-GitHub mirror (a dependency that should be replaced with files stored in this repository before launch): https://github.com/GeorgeQLe/assets-2d-city/tree/main/assets/kenney/tiny-town
- If the atlas cannot load, the existing drawn backgrounds and decorations remain playable as fallbacks.
- This is a first asset integration pass, **not** a complete visual overhaul. A coherent replacement of all buildings, interiors, paths, sprites and maps will require selecting a more complete commercial-use tileset or creating commissioned original art.
- The game currently uses no player-to-player messaging or interaction, and players remain locally simulated.


## Teenseys' original art pack — Version 0.6

Eight coordinated original SVG pixel-art files are included under `assets/teenseys/`: three distinct storefront facades, a tree, a clothing display rack, a wood floor tile, a stone pavement tile and grass. They are loaded as image assets directly from this repository and rendered with crisp pixel scaling on the existing canvas. The earlier external Kenney atlas is no longer requested by the page.

The walkable maps, collisions, racks, NPC dialogue, product-card browsing, Browse All and guest entry remain unchanged. SVG assets have generated-drawing fallbacks if they cannot load. The visual set is an art foundation, not a finished full world tileset; further work can add matching animations, benches, fountain, custom character sprites and additional interior props. Public storefront browsing remains a demo, with no real Shopify checkout/accounts/multiplayer yet.


## Visual update — Version 0.7

Added six original 4-direction pixel-art avatar sprite sheets (`assets/teenseys/avatars/shopper-1.svg` through `shopper-6.svg`). Each sheet includes four walking phases for down, left, right, and up. The browser displays these instead of the original code-drawn character when the sprite loads, and the old drawing remains a fallback.

The town square now uses matching original illustrated sprites for its central fountain, planters, benches, and lamps. The boutique adds a coordinated fashion display. All of these files are stored in this repository in `assets/teenseys/` with no external image dependencies. The visual changes do not modify map collision, store entrances, rack shopping, NPC dialogue, or the no-chat rule.

The artwork remains an evolving pixel-art prototype, not a final commissioned environment. Gameplay and image loading should be checked in the deployed browser after this update.


## Style choice — Version 0.8: three-quarter-view 2.5D

The town is moving toward a **three-quarter 2.5D pixel-art perspective**. The three storefront facade assets have a visible pitched roof, upper shading, cornice and side-depth strip, giving stronger building volume while remaining 2D drawings. The map coordinates, four-direction controls, shop entrance triggers, product cards and existing safety design are untouched. This is the first structural 2.5D pass, not a full environment replacement. Next visual tasks include consistent furniture depth, occlusion ordering, coordinated lighting and a polished layout; no 3D engine is required for this style.


## Version 0.9 — Approved 2.5D town integrated with the shopping experience

The main `index.html` now renders the actual three-quarter-view town from the approved `town-style-preview.html` (not just a modified rooftop). Town walking remains four-direction WASD / arrow / touch pad. Approaching **THE THREADS SHOP** and pressing E enters the original functional boutique; exiting returns to the redesigned town without restarting the session. The bag, rack browsing, product cards, catalog, NPC and six avatar choices remain in the same page. The two other storefronts are still marked coming soon.

The original town rendering is retained in code as `legacyTownScene` for reference, but the new visual scene is the default. The separate style preview remains available for comparison. This has been JavaScript syntax-checked; full manual browser testing of the deployed build is still needed.


## Version 1.0 — Michigan downtown main-street style

The approved three-quarter-view shopping town now uses a Michigan-inspired downtown shopping-district look: red-brick and buff-stone restored storefronts with parapets and masonry courses, decorative upper windows, deep window displays, sidewalk brick bands, a wider-looking pedestrian edge, lamp banners, bike rack, café patio/chalkboard, planters, benches and a crosswalk. This is **fictional downtown architecture inspired by southeastern Michigan**, not an exact recreation of Ann Arbor or Ypsilanti. The underlying store/rack interactions, controls, product catalog and demo bag are unchanged. The user can compare revisions with the separate `town-style-preview.html`.
