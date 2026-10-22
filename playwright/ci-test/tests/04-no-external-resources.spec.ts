import { test, expect } from "@playwright/test";

/**
 * External-request guard.
 *
 * Maintainer requirement: the site must not call out to third-party CDNs —
 * all assets (fonts, CSS, JS, the vendored qg-top-nav component) are served
 * same-origin. Every request made while loading a page must either be
 * same-origin as the configured baseURL or hit an allowlisted host.
 */

/**
 * Allowlist of permitted external hosts:
 * - matomo.qgis.org: the QGIS project's OWN first-party analytics instance,
 *   injected at runtime by the theme. It is first-party QGIS infrastructure,
 *   not a third-party CDN.
 */
const ALLOWED_EXTERNAL_HOSTS = ["matomo.qgis.org"];

const pagesToCheck = ["/", "/about-us/"];

for (const path of pagesToCheck) {
    test(`no external resources on ${path}`, async ({ page, baseURL }) => {
        expect(baseURL, "baseURL must be configured").toBeTruthy();
        const baseOrigin = new URL(baseURL!).origin;

        const requested: string[] = [];
        // Attach the listener BEFORE navigation so no request escapes.
        page.on("request", (request) => requested.push(request.url()));

        // domcontentloaded, NOT "load": the load event waits for the
        // runtime-injected analytics script. If that external host hangs,
        // "load" never fires — but requests are recorded at ISSUANCE time,
        // so this guard loses no coverage by not waiting for load.
        await page.goto(path, { waitUntil: "domcontentloaded" });
        // Best-effort: let the load event finish quickly when external hosts
        // are reachable; never hang the guard when they are not.
        await page
            .waitForLoadState("load", { timeout: 5000 })
            .catch(() => undefined);
        // Give runtime-injected scripts (e.g. the analytics tracker) time to
        // fire their requests, so the guard cannot pass vacuously.
        await page.waitForTimeout(2000);

        // Sanity: we actually observed traffic.
        expect(
            requested.length,
            `no requests observed while loading ${path} — guard would pass vacuously`,
        ).toBeGreaterThan(0);

        const offenders = requested.filter((raw) => {
            const url = new URL(raw);
            if (url.protocol === "data:" || url.protocol === "blob:") {
                return false; // inline resources, not network calls
            }
            return (
                url.origin !== baseOrigin &&
                !ALLOWED_EXTERNAL_HOSTS.includes(url.hostname)
            );
        });

        expect(
            offenders,
            `External (non-same-origin, non-allowlisted) requests detected on ${path}:\n` +
                [...new Set(offenders)].join("\n") +
                `\n\nAllowed external hosts: ${ALLOWED_EXTERNAL_HOSTS.join(", ")}. ` +
                `All other resources must be served same-origin (no external CDNs).`,
        ).toEqual([]);
    });
}
