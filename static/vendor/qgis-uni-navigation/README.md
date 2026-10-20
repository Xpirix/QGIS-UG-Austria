# Vendored: qgis-uni-navigation web component

## Provenance

- Upstream repository: https://github.com/qgis/qgis-uni-navigation
  (branch `main`, commit `34731a794867855651532e130d66beff1c211700`, pushed 2026-09-29)
- Deployed file fetched from https://qgis.github.io/qgis-uni-navigation/index.js
  on 2026-10-20.
- Original `index.js` sha256:
  `4553769920b39a0fbf43e28231094991324e5166ee3fad4d1c455298ebf8b48a`
- The SVG icons (`logo.svg`, `download.svg`, `donate.svg`, `goodies.svg`,
  `external.svg`, `arrow.svg`) and `nav-config.json` were fetched from the same
  upstream deployment (https://qgis.github.io/qgis-uni-navigation/) on
  2026-10-20 and are byte-identical copies.

## Why vendored

Security / privacy: the built site must make **zero external CDN calls** for
static files. Everything the `<qg-top-nav>` component needs at runtime is now
served from this site's own origin.

## Local modifications to `index.js`

The vendored `index.js` differs from the upstream deployed file in exactly
these string replacements (no other changes):

1. `m(this,q,"https://qgis.github.io/qgis-uni-navigation/nav-config.json")`
   → `m(this,q,window.QG_UNI_NAV_CONFIG_URL)`
2. `m(this,z,"https://qgis.github.io/qgis-uni-navigation/button-config.json")`
   → `m(this,z,window.QG_UNI_NAV_BUTTON_CONFIG_URL)`
3. In `drawLogo()`: `` `https://qgis.github.io/qgis-uni-navigation/${e.icon}` ``
   → `` `${window.QG_UNI_NAV_BASE}${e.icon}` ``
4. Two occurrences of `me("https://qgis.github.io/qgis-uni-navigation/")`
   (lit `unsafeCSS` calls building the CSS `mask: url(...)` references for the
   `external.svg` and `arrow.svg` menu icons) → `me(window.QG_UNI_NAV_BASE)`

The component therefore reads its config URLs and asset base path from the
globals `window.QG_UNI_NAV_CONFIG_URL`, `window.QG_UNI_NAV_BUTTON_CONFIG_URL`
and `window.QG_UNI_NAV_BASE`, which are set inline in
`layouts/partials/header.html` **before** `index.js` loads (lit property
initializers capture the values at element construction time).

Note: `button-config.json` does **not** live here but in
`assets/vendor/qgis-uni-navigation/button-config.json`, because its icon URLs
are rendered through Hugo's `absURL` via `resources.ExecuteAsTemplate` at build
time. The rendered file is published to
`/vendor/qgis-uni-navigation/button-config.json`.

`nav-config.json` and all SVGs are byte-identical upstream copies
(unmodified).

## Licensing

The upstream repository currently declares **no LICENSE file**. The component
is owned by the QGIS project (https://github.com/qgis). The copies here are
kept unmodified except for the URL rewiring listed above.

## Re-vendoring instructions

1. Download the new deployed file:
   `curl -o index.js https://qgis.github.io/qgis-uni-navigation/index.js`
   (and any changed SVGs / `nav-config.json` from the same base URL).
2. Record its sha256, then re-apply the modifications 1–4 above (the literals
   are unique in the minified bundle; a simple exact-string replace works).
3. Verify: `grep -c qgis.github.io index.js` must output `0`.
4. Place the files in this directory and bump the provenance section (commit,
   date, sha256) of this README.
