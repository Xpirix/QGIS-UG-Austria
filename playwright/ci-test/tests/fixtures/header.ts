import type { Page, Locator } from "@playwright/test";

/**
 * Page object for the <qg-top-nav> web component (the unified QGIS navigation
 * bar vendored under static/vendor/qgis-uni-navigation/). It uses an open
 * shadow DOM, which Playwright locators pierce automatically.
 *
 * Contents:
 *  - the English qgis.org primary menu: "About" / "Resources" / "Community"
 *    dropdowns (open on hover) plus Download / Donate / Goodies link buttons
 *    (each rendered twice: desktop bar + mobile drawer, hence .first()),
 *  - the Austrian secondary menu labelled "QGIS Österreich" with the eight
 *    German site links (hrefs are root-relative: second-menu-prefix carries
 *    the baseURL path and navigation.json hrefs start with '/').
 *
 * NOTE: two elements on the page expose role=navigation with the accessible
 * name "main navigation" — the shadow-DOM <nav> inside <qg-top-nav> and the
 * site navbar inside #context (see fixtures/site-navbar.ts). Every locator
 * here is therefore explicitly scoped to the component.
 */
export class Header {
    /** The <qg-top-nav> custom element itself. */
    public readonly root: Locator;
    /** The shadow-DOM <nav aria-label="main navigation"> (desktop bar). */
    public readonly bar: Locator;
    public readonly logoLink: Locator;

    // Dropdown triggers (desktop bar)
    public readonly aboutTrigger: Locator;
    public readonly resourcesTrigger: Locator;
    public readonly communityTrigger: Locator;

    // "About" dropdown children
    public readonly featuresLink: Locator;
    public readonly mapsLink: Locator;
    public readonly caseStudiesLink: Locator;
    public readonly newsAndBlog: Locator;
    public readonly visualChangelogLink: Locator;
    public readonly roadmapLink: Locator;
    public readonly membersLink: Locator;
    public readonly supportLink: Locator;

    // "Resources" dropdown children
    public readonly documentationLink: Locator;
    public readonly resourcesHubLink: Locator;
    public readonly pluginsLink: Locator;
    public readonly booksLink: Locator;
    public readonly certifiedMemberLink: Locator;
    public readonly visualStyleGuideLink: Locator;
    public readonly reportsLink: Locator;

    // "Community" dropdown children
    public readonly getInvolvedLink: Locator;
    public readonly meetingsLink: Locator;
    public readonly qgisFoundationLink: Locator;
    public readonly projectOrganisationLink: Locator;
    public readonly userGroupLink: Locator;
    public readonly contributorsLink: Locator;
    public readonly metricsLink: Locator;
    public readonly membersBlogLink: Locator;

    // Link buttons (rendered twice: desktop bar + mobile drawer -> .first())
    public readonly downloadLink: Locator;
    public readonly donateLink: Locator;
    public readonly goodiesLink: Locator;

    /**
     * The Austrian secondary menu: [accessible name, site path] pairs.
     * Hrefs in the DOM are root-relative (base path + site path); specs
     * assert the resolved absolute URL via the element's .href property.
     */
    public readonly austriaMenu: [string, string][] = [
        ["Home", "/"],
        ["Verein", "/about-us/"],
        ["Neuigkeiten", "/neuigkeiten/"],
        ["Arbeitsgruppen", "/arbeitsgruppen/"],
        ["Mitglied werden", "/mitgliedschaft/"],
        ["Veranstaltungen", "/events/"],
        ["Blog", "/blog/"],
        ["Datenschutzerklärung", "/datenschutzerklaerung/"],
    ];

    constructor(public readonly page: Page) {
        this.root = this.page.locator("qg-top-nav");
        this.bar = this.root.locator("nav");
        this.logoLink = this.bar.getByRole("link").first();

        this.aboutTrigger = this.bar.getByText("About", { exact: true });
        this.resourcesTrigger = this.bar.getByText("Resources", { exact: true });
        this.communityTrigger = this.bar.getByText("Community", { exact: true });

        // Dropdown panels live inside the component (but outside <nav>),
        // so children are scoped to this.root. Accessible names are unique
        // within the component, verified against aria snapshots.
        this.featuresLink = this.menuLink("Features");
        this.mapsLink = this.menuLink("Screenshots and Maps");
        this.caseStudiesLink = this.menuLink("Case Studies");
        this.newsAndBlog = this.menuLink("News and Blog");
        this.visualChangelogLink = this.menuLink("Past Releases (Changelog)");
        this.roadmapLink = this.menuLink("Future Releases (Roadmap)");
        this.membersLink = this.menuLink("Sustaining members");
        this.supportLink = this.menuLink("Contact and Support");

        this.documentationLink = this.menuLink("Documentation");
        this.resourcesHubLink = this.menuLink("Resources Hub");
        this.pluginsLink = this.menuLink("Plugins");
        this.booksLink = this.menuLink("Books");
        this.certifiedMemberLink = this.menuLink("Certification Programme");
        this.visualStyleGuideLink = this.menuLink(
            "Visual Style Guide (Logos and Graphics)",
        );
        this.reportsLink = this.menuLink("Compliance Reports");

        this.getInvolvedLink = this.menuLink("Get involved");
        this.meetingsLink = this.menuLink("Meetings");
        this.qgisFoundationLink = this.menuLink("QGIS Foundation");
        this.projectOrganisationLink = this.menuLink("Project Organisation");
        this.userGroupLink = this.menuLink("Local User Groups");
        this.contributorsLink = this.menuLink("Contributors");
        this.metricsLink = this.menuLink("QGIS Metrics");
        this.membersBlogLink = this.menuLink("Members Blog");

        // Accessible name is "Download Download" etc. (icon alt + label),
        // so match by substring and take the desktop-bar instance.
        this.downloadLink = this.root
            .getByRole("link", { name: "Download" })
            .first();
        this.donateLink = this.root.getByRole("link", { name: "Donate" }).first();
        this.goodiesLink = this.root.getByRole("link", { name: "Goodies" }).first();
    }

    /**
     * A link inside the qg-top-nav component, matched by exact accessible
     * name. The component clones the menus into a hidden #mobile-menu drawer
     * (populated on interaction), so links can resolve twice — the desktop
     * instance comes first in DOM order, hence .first().
     */
    menuLink(name: string): Locator {
        return this.root.getByRole("link", { name, exact: true }).first();
    }

    /** A link of the Austrian secondary menu ("QGIS Österreich"). */
    austriaMenuLink(name: string): Locator {
        return this.menuLink(name);
    }

    /**
     * Origin of the site under test, derived at runtime from the current page
     * URL (never hardcoded), so the tests also work against staging.
     */
    get origin(): string {
        return new URL(this.page.url()).origin;
    }
}
