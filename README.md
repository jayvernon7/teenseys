# Teenseys' — interactive shopping town starter

This is a working **front-end prototype** (v0.6), built as a single self-contained `index.html` file. The project is branded as **Teenseys'**. This name appears in the title and website header.

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
