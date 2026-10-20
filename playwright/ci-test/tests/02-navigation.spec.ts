import { test, expect } from "./fixtures";

/**
 * Navigation specs. The page has TWO navigations named "main navigation":
 *  1. the <qg-top-nav> web component (English qgis.org primary menu +
 *     Austrian secondary menu "QGIS Österreich"),
 *  2. the German site navbar inside #context.
 * Both are exercised via their explicitly scoped page objects.
 */
test.describe("Navigation", () => {
    test.beforeEach(async ({ homePage }) => {
        await homePage.goto();
    });

    test("Top nav: primary menu dropdowns", async ({ header }) => {
        await expect(header.bar).toBeVisible();
        await expect(header.logoLink).toBeVisible();

        // About
        await expect(header.aboutTrigger).toBeVisible();
        await header.aboutTrigger.hover();
        await expect(header.featuresLink).toBeVisible();
        await expect(header.mapsLink).toBeVisible();
        await expect(header.caseStudiesLink).toBeVisible();
        await expect(header.newsAndBlog).toBeVisible();
        await expect(header.visualChangelogLink).toBeVisible();
        await expect(header.roadmapLink).toBeVisible();
        await expect(header.membersLink).toBeVisible();
        await expect(header.supportLink).toBeVisible();

        // Resources
        await expect(header.resourcesTrigger).toBeVisible();
        await header.resourcesTrigger.hover();
        await expect(header.documentationLink).toBeVisible();
        await expect(header.resourcesHubLink).toBeVisible();
        await expect(header.pluginsLink).toBeVisible();
        await expect(header.booksLink).toBeVisible();
        await expect(header.certifiedMemberLink).toBeVisible();
        await expect(header.visualStyleGuideLink).toBeVisible();
        await expect(header.reportsLink).toBeVisible();

        // Community
        await expect(header.communityTrigger).toBeVisible();
        await header.communityTrigger.hover();
        await expect(header.getInvolvedLink).toBeVisible();
        await expect(header.meetingsLink).toBeVisible();
        await expect(header.qgisFoundationLink).toBeVisible();
        await expect(header.projectOrganisationLink).toBeVisible();
        await expect(header.userGroupLink).toBeVisible();
        await expect(header.contributorsLink).toBeVisible();
        await expect(header.metricsLink).toBeVisible();
        await expect(header.membersBlogLink).toBeVisible();
    });

    test("Top nav: Download / Donate / Goodies buttons", async ({ header }) => {
        // Each button is rendered twice (desktop bar + mobile drawer);
        // the page object exposes the .first() (desktop) instance.
        await expect(header.downloadLink).toBeVisible();
        await expect(header.downloadLink).toHaveAttribute(
            "href",
            "https://qgis.org/download",
        );
        await expect(header.donateLink).toBeVisible();
        await expect(header.donateLink).toHaveAttribute(
            "href",
            "https://qgis.org/funding/donate",
        );
        await expect(header.goodiesLink).toBeVisible();
        await expect(header.goodiesLink).toHaveAttribute(
            "href",
            "https://qgis.org/goodies",
        );
    });

    test("Top nav: Austrian secondary menu 'QGIS Österreich'", async ({
        header,
    }) => {
        // All eight items visible with correct baseURL-derived hrefs
        for (const [name, path] of header.austriaMenu) {
            const link = header.austriaMenuLink(name);
            await expect(link, `secondary menu item "${name}" missing`).toBeVisible();
            await expect(link).toHaveAttribute("href", `${header.origin}${path}`);
        }
    });

    test("Site navbar (#context): German menu + search", async ({ navbar }) => {
        await expect(navbar.root).toBeVisible();

        // All eight German menu links visible with correct hrefs
        for (const [name, path] of navbar.menu) {
            const link = navbar.menuLink(name);
            await expect(link, `navbar item "${name}" missing`).toBeVisible();
            await expect(link).toHaveAttribute("href", `${navbar.origin}${path}`);
        }

        // Exactly one visible searchbox, empty
        await expect(navbar.searchbox).toBeVisible();
        await expect(navbar.searchbox).toBeEmpty();
    });
});
