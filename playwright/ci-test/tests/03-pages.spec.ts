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
 * Paths that must NOT be published: /rules/ is still a Hugo draft; the other
 * three template drafts were removed from content/ entirely (they now 404
 * because the files no longer exist).
 */
const draftPages = ["/case-studies/", "/community/", "/tutorials/", "/rules/"];

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
        // Same external href as in the home page Kontakt list.
        const linkedIn = page.locator(
            'a[href="https://www.linkedin.com/company/qgis-anwendergruppe-%C3%B6sterreich/"]',
        );
        await expect(linkedIn).toBeVisible();
    });
});

test.describe("Draft pages are not published", () => {
    for (const path of draftPages) {
        test(`${path} returns 404`, async ({ page }) => {
            const response = await page.goto(path, {
                waitUntil: "domcontentloaded",
            });
            expect(response, `${path}: no response received`).not.toBeNull();
            expect(
                response!.status(),
                `${path} should be a draft (404) but was published`,
            ).toBe(404);
        });
    }
});
