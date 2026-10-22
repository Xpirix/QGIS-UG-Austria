import { test, expect } from "@playwright/test";

/**
 * Published sub-pages: assert h1 (via accessible heading name — the raw
 * textContent contains Hugo's "¶" anchor) and <title>. Draft pages must 404.
 */
const publishedPages: { path: string; h1: string; titleRe: RegExp }[] = [
    {
        path: "/about-us/",
        h1: "QGIS Anwendergruppe Österreich",
        titleRe: /Der Verein · QGIS Österreich/,
    },
    {
        path: "/neuigkeiten/",
        h1: "Neuigkeiten",
        titleRe: /Neuigkeiten · QGIS Österreich/,
    },
    {
        path: "/arbeitsgruppen/",
        h1: "Arbeitsgruppen",
        titleRe: /Arbeitsgruppen · QGIS Österreich/,
    },
    {
        path: "/mitgliedschaft/",
        h1: "Mitglied werden",
        titleRe: /Mitglied werden · QGIS Österreich/,
    },
    {
        path: "/events/",
        h1: "Veranstaltungen",
        titleRe: /Veranstaltungen · QGIS Österreich/,
    },
    {
        path: "/blog/",
        h1: "Blog",
        titleRe: /Blog · QGIS Österreich/,
    },
    {
        path: "/datenschutzerklaerung/",
        h1: "Datenschutzerklärung",
        titleRe: /Datenschutzerklärung · QGIS Österreich/,
    },
];

/**
 * Paths that must NOT be published: /rules/ is still a Hugo draft; the three
 * template drafts were removed from content/ entirely; /search/ is gone
 * because the site search feature was removed (minimal site, no search UI).
 */
const unpublishedPaths = ["/case-studies/", "/community/", "/tutorials/", "/rules/", "/search/"];

test.describe("Published sub-pages", () => {
    for (const p of publishedPages) {
        test(`${p.path} renders with heading and title`, async ({ page }) => {
            // domcontentloaded: never block on external analytics reachability
            const response = await page.goto(p.path, {
                waitUntil: "domcontentloaded",
            });
            expect(response?.status(), `${p.path} did not return 200`).toBe(200);
            await expect(page).toHaveTitle(p.titleRe);
            // .first(): /blog/ exposes two level-1 "Blog" headings (list page
            // hero + section heading); one visible match is enough.
            await expect(
                page.getByRole("heading", { level: 1, name: p.h1 }).first(),
            ).toBeVisible();
        });
    }

    test("/mitgliedschaft/ links to the membership form PDF", async ({
        page,
    }) => {
        await page.goto("/mitgliedschaft/", {
            waitUntil: "domcontentloaded",
        });
        const pdf = page.locator('a[href$="Beitrittserklaerung.pdf"]').first();
        await expect(pdf).toBeVisible();
        // The href is parent-relative ("../download/Beitrittserklaerung.pdf")
        // so it resolves under any origin/base path; assert the resolved
        // absolute URL (element .href property) ends in the expected path.
        const resolvedHref: string = await pdf.evaluate(
            (el) => (el as HTMLAnchorElement).href,
        );
        expect(
            resolvedHref.endsWith("/download/Beitrittserklaerung.pdf"),
            `resolved PDF href was ${resolvedHref}`,
        ).toBe(true);
    });

    test("/neuigkeiten/ links the LinkedIn company page", async ({ page }) => {
        await page.goto("/neuigkeiten/", { waitUntil: "domcontentloaded" });
        // Same external href as in the home page Kontakt list. Located by
        // accessible name: the footer (present on every page) now carries the
        // same href as an icon-only link, so a bare href locator would match
        // 2 elements and fail strict mode.
        const linkedIn = page.getByRole("link", {
            name: "QGIS Anwendergruppe Österreich",
            exact: true,
        });
        await expect(linkedIn).toBeVisible();
        await expect(linkedIn).toHaveAttribute(
            "href",
            "https://www.linkedin.com/company/qgis-anwendergruppe-%C3%B6sterreich/",
        );
    });
});

test.describe("Unpublished paths return 404", () => {
    for (const path of unpublishedPaths) {
        test(`${path} returns 404`, async ({ page }) => {
            const response = await page.goto(path, {
                waitUntil: "domcontentloaded",
            });
            expect(response, `${path}: no response received`).not.toBeNull();
            expect(
                response!.status(),
                `${path} should not be published (expected 404)`,
            ).toBe(404);
        });
    }
});
