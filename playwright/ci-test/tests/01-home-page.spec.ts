import { test, expect } from "./fixtures";
import { HomePage } from "./fixtures/home-page";

test.describe("Home page", () => {
    test.beforeEach(async ({ homePage }) => {
        await homePage.goto();
    });

    test("Content", async ({ homePage }) => {
        // <title> (the "&middot;" entity in the template renders as "·")
        await expect(homePage.page).toHaveTitle(HomePage.expectedTitle);

        // Hero: h1, subtitle and CTA button
        await expect(homePage.heroTitle).toBeVisible();
        await expect(homePage.heroTitle).toHaveText("QGIS Österreich");
        await expect(homePage.heroSubtitle).toContainText(
            HomePage.expectedSubtitle,
        );
        await expect(homePage.heroButton).toBeVisible();
        await expect(homePage.heroButton).toHaveAttribute(
            "href",
            `${homePage.origin}/mitgliedschaft/`,
        );

        // All five h2 sections
        for (const name of homePage.sectionHeadingNames) {
            await expect(
                homePage.sectionHeading(name),
                `missing home page section "${name}"`,
            ).toBeVisible();
        }

        // Kontakt section: email link (plus phone/address as page text)
        await expect(homePage.contactEmailLink).toBeVisible();
        await expect(homePage.contactEmailLink).toHaveAttribute(
            "href",
            "mailto:info@qgis.at",
        );
        await expect(homePage.pageBody).toContainText(HomePage.expectedPhone);
        await expect(homePage.pageBody).toContainText(
            HomePage.expectedAddress,
        );
    });

    test("Kontakt links the LinkedIn company page", async ({ homePage }) => {
        // The Kontakt list links the group's LinkedIn company page.
        await expect(homePage.contactLinkedInLink).toBeVisible();
        await expect(homePage.contactLinkedInLink).toHaveAttribute(
            "href",
            HomePage.expectedLinkedInHref,
        );
        await expect(homePage.contactLinkedInLink).toHaveText(
            "QGIS Anwendergruppe Österreich",
        );
    });

    test("Footer", async ({ footer }) => {
        await expect(footer.banner).toBeVisible();

        // Four link columns and their titles
        await expect(footer.projectList).toBeVisible();
        await expect(footer.communityList).toBeVisible();
        await expect(footer.resourcesList).toBeVisible();
        await expect(footer.fundingList).toBeVisible();

        // Project column
        await expect(footer.featuresLink).toBeVisible();
        await expect(footer.caseStudiesLink).toBeVisible();
        await expect(footer.pluginsLink).toBeVisible();
        await expect(footer.visualChangelogsLink).toBeVisible();

        // Community column
        await expect(footer.getInvolvedLink).toBeVisible();
        await expect(footer.becomeCertifiedMemberLink).toBeVisible();
        await expect(footer.qgisFoundationLink).toBeVisible();
        await expect(footer.projectOrganisationLink).toBeVisible();
        await expect(footer.localUserGroupsLink).toBeVisible();
        await expect(footer.membersBlogsList).toBeVisible();

        // Resources column
        await expect(footer.documentationLink).toBeVisible();
        await expect(footer.installationGuideLink).toBeVisible();
        await expect(footer.testingLink).toBeVisible();
        await expect(footer.roadmapLink).toBeVisible();
        await expect(footer.reportsLink).toBeVisible();
        await expect(footer.booksLink).toBeVisible();
        await expect(footer.supportLink).toBeVisible();
        await expect(footer.qgisDashboardLink).toBeVisible();
        await expect(footer.pluginsMetricsLink).toBeVisible();
        await expect(footer.blogLink).toBeVisible();

        // Funding column
        await expect(footer.donateLink).toBeVisible();
        await expect(footer.membershipList).toBeVisible();

        // Download button (link wrapping a <button>)
        await expect(footer.downloadLink).toBeVisible();
        await expect(footer.downloadLink).toHaveAttribute(
            "href",
            "https://qgis.org/download",
        );

        // Privacy/policy row — "License" must stay exact + banner-scoped,
        // the homepage prose links "GNU General Public License".
        await expect(footer.diversityStatementLink).toBeVisible();
        await expect(footer.codeOfConductLink).toBeVisible();
        await expect(footer.environmentalPolicyLink).toBeVisible();
        await expect(footer.licenseLink).toBeVisible();
        await expect(footer.licenseLink).toHaveAttribute(
            "href",
            "https://qgis.org/license",
        );
        await expect(footer.visualStyleGuideLink).toBeVisible();
        await expect(footer.goodiesLink).toBeVisible();
        await expect(footer.archiveLink).toBeVisible();

        // Branding
        await expect(footer.logoImage).toBeVisible();

        // Social links are icon-only (empty accessible names) -> by href
        await expect(footer.facebookLink).toBeVisible();
        await expect(footer.youtubeLink).toBeVisible();
        await expect(footer.mastodonLink).toBeVisible();
        await expect(footer.ghLink).toBeVisible();
        await expect(footer.mailLink).toBeVisible();

        // Issue report + commit revision must point at THIS repository
        await expect(footer.issueReportLink).toBeVisible();
        await expect(footer.issueReportLink).toHaveAttribute(
            "href",
            "https://github.com/qgis/QGIS-UG-Austria/issues",
        );
        await expect(footer.commitLink).toBeVisible();
        await expect(footer.commitLink).toHaveAttribute(
            "href",
            /^https:\/\/github\.com\/qgis\/QGIS-UG-Austria\/commit\/[0-9a-f]+$/,
        );
    });
});
