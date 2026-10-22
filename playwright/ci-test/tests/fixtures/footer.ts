import type { Page, Locator } from "@playwright/test";

/**
 * Page object for the site footer (role=contentinfo).
 *
 * EVERY locator is scoped to the contentinfo banner: the homepage prose
 * contains links whose names collide with footer links (e.g. "GNU General
 * Public License" vs. the footer's "License"), and the qg-top-nav component
 * repeats names like "Blog", "Local User Groups" or "Goodies". Scoping plus
 * exact name matching keeps all locators strict-mode safe.
 *
 * The three social links are icon-only with EMPTY accessible names, so they
 * are located by their href attribute instead of by role name.
 */
export class Footer {
    public readonly banner: Locator;

    // Column title links
    public readonly projectList: Locator;
    public readonly communityList: Locator;
    public readonly resourcesList: Locator;
    public readonly fundingList: Locator;

    // Project column
    public readonly featuresLink: Locator;
    public readonly caseStudiesLink: Locator;
    public readonly pluginsLink: Locator;
    public readonly visualChangelogsLink: Locator;

    // Community column
    public readonly getInvolvedLink: Locator;
    public readonly becomeCertifiedMemberLink: Locator;
    public readonly qgisFoundationLink: Locator;
    public readonly projectOrganisationLink: Locator;
    public readonly localUserGroupsLink: Locator;
    public readonly membersBlogsList: Locator;

    // Resources column
    public readonly documentationLink: Locator;
    public readonly installationGuideLink: Locator;
    public readonly testingLink: Locator;
    public readonly roadmapLink: Locator;
    public readonly reportsLink: Locator;
    public readonly booksLink: Locator;
    public readonly supportLink: Locator;
    public readonly qgisDashboardLink: Locator;
    public readonly pluginsMetricsLink: Locator;
    public readonly blogLink: Locator;

    // Funding column
    public readonly donateLink: Locator;
    public readonly membershipList: Locator;

    // Download button (a link wrapping a <button>)
    public readonly downloadLink: Locator;

    // Privacy/policy row
    public readonly diversityStatementLink: Locator;
    public readonly codeOfConductLink: Locator;
    public readonly environmentalPolicyLink: Locator;
    public readonly licenseLink: Locator;
    public readonly visualStyleGuideLink: Locator;
    public readonly goodiesLink: Locator;
    public readonly archiveLink: Locator;

    // Branding + social (icon-only, empty accessible names -> located by href)
    public readonly logoImage: Locator;
    public readonly linkedInLink: Locator;
    public readonly ghLink: Locator;
    public readonly mailLink: Locator;

    // Issue report + commit revision links (must point at THIS repo)
    public readonly issueReportLink: Locator;
    public readonly commitLink: Locator;

    constructor(public readonly page: Page) {
        this.banner = this.page.getByRole("contentinfo");

        this.projectList = this.footerLink("Project");
        this.communityList = this.footerLink("Community");
        this.resourcesList = this.footerLink("Resources");
        this.fundingList = this.footerLink("Funding");

        this.featuresLink = this.footerLink("Overview");
        this.caseStudiesLink = this.footerLink("Case studies");
        this.pluginsLink = this.footerLink("Plugins");
        this.visualChangelogsLink = this.footerLink("Visual Changelogs");

        this.getInvolvedLink = this.footerLink("Get involved");
        this.becomeCertifiedMemberLink = this.footerLink("Certification Programme");
        this.qgisFoundationLink = this.footerLink("QGIS Foundation");
        this.projectOrganisationLink = this.footerLink("Project Organisation");
        this.localUserGroupsLink = this.footerLink("Local User Groups");
        this.membersBlogsList = this.footerLink("Members Blogs");

        this.documentationLink = this.footerLink("Documentation");
        this.installationGuideLink = this.footerLink("Installation guide");
        this.testingLink = this.footerLink("Testing");
        this.roadmapLink = this.footerLink("Roadmap");
        this.reportsLink = this.footerLink("Reports");
        this.booksLink = this.footerLink("Books");
        this.supportLink = this.footerLink("Contact and Support");
        this.qgisDashboardLink = this.footerLink("QGIS Metrics");
        this.pluginsMetricsLink = this.footerLink("Plugins Metrics");
        this.blogLink = this.footerLink("Blog");

        this.donateLink = this.footerLink("Donate");
        this.membershipList = this.footerLink("Membership");

        this.downloadLink = this.banner.locator(
            'a[href="https://qgis.org/download"]',
        );

        this.diversityStatementLink = this.footerLink("Diversity statement");
        this.codeOfConductLink = this.footerLink("Code of conduct");
        this.environmentalPolicyLink = this.footerLink("Environmental policy");
        // exact + banner-scoped: the homepage prose links "GNU General Public
        // License", which a substring match on "License" would also hit.
        this.licenseLink = this.footerLink("License");
        this.visualStyleGuideLink = this.footerLink("Visual Style Guide");
        this.goodiesLink = this.footerLink("Goodies");
        this.archiveLink = this.footerLink("Archive");

        this.logoImage = this.banner.getByRole("img", { name: "Logo" });

        // Icon-only social links: empty accessible names, so match on href.
        // These are the GROUP's own channels (not the QGIS project's).
        this.linkedInLink = this.socialLink(
            "https://www.linkedin.com/company/qgis-anwendergruppe-%C3%B6sterreich/",
        );
        this.ghLink = this.socialLink("https://github.com/QGIS-Austria");
        this.mailLink = this.socialLink("mailto:info@qgis.at");

        this.issueReportLink = this.banner.getByRole("link", {
            name: "Report an issue here",
        });
        this.commitLink = this.banner.locator(
            'a[href^="https://github.com/qgis/QGIS-UG-Austria/commit/"]',
        );
    }

    /** A link inside the footer banner, matched by exact accessible name. */
    private footerLink(name: string): Locator {
        return this.banner.getByRole("link", { name, exact: true });
    }

    /** An icon-only link inside the footer banner, matched by exact href. */
    private socialLink(href: string): Locator {
        return this.banner.locator(`a[href="${href}"]`);
    }
}
