import type { Page, Locator } from "@playwright/test";

/**
 * Page object for the home page (content/_index.md).
 * All expected strings are the real German site content.
 */
export class HomePage {
    private readonly url: string = "/";
    public readonly pageBody: Locator;

    /** <title> of the home page (the "&middot;" entity renders as "·"). */
    public static readonly expectedTitle = "QGIS Österreich · QGIS Österreich";

    /** Hero area (section.hero): title, subtitle and CTA button. */
    public readonly hero: Locator;
    public readonly heroTitle: Locator;
    public readonly heroSubtitle: Locator;
    public readonly heroButton: Locator;

    public static readonly expectedSubtitle =
        "Anwendergruppe Österreich – Verein zur Förderung Freier Software für Geoinformationssysteme";

    /** The five h2 section headings of the home page, in document order. */
    public readonly sectionHeadingNames: string[] = [
        "Ein freies Geographisches Informationssystem",
        "Was QGIS bietet",
        "Der Verein",
        "Arbeitsgruppen",
        "Kontakt",
    ];

    /** Kontakt section facts. */
    public readonly contactEmailLink: Locator;
    /**
     * LinkedIn company page link in the Kontakt list. External link -> the
     * exact href string is the expectation; nothing is derived at runtime.
     */
    public readonly contactLinkedInLink: Locator;
    public static readonly expectedLinkedInHref =
        "https://www.linkedin.com/company/qgis-anwendergruppe-%C3%B6sterreich/";
    public static readonly expectedPhone = "+43 660 4064306";
    public static readonly expectedAddress =
        "QGIS Anwendergruppe Österreich, Unterlinden 16a, 6922 Wolfurt";

    constructor(public readonly page: Page) {
        this.pageBody = this.page.locator("body");
        this.hero = this.page.locator("section.hero");
        this.heroTitle = this.hero.getByRole("heading", {
            level: 1,
            name: "QGIS Österreich",
        });
        this.heroSubtitle = this.hero.locator("p.hero-subtitle");
        // Scoped to the hero: "Mitglied werden" also appears in both nav bars.
        this.heroButton = this.hero.getByRole("link", {
            name: "Mitglied werden",
            exact: true,
        });
        this.contactEmailLink = this.page.getByRole("link", {
            name: "info@qgis.at",
            exact: true,
        });
        // Located by accessible name, NOT by bare href: the footer social row
        // now contains the same LinkedIn href (icon link with EMPTY accessible
        // name), so an href-only locator would resolve to 2 elements and trip
        // Playwright strict mode.
        this.contactLinkedInLink = this.page.getByRole("link", {
            name: "QGIS Anwendergruppe Österreich",
            exact: true,
        });
    }

    async goto() {
        // waitUntil "domcontentloaded", NOT the default "load": the window
        // load event waits for the runtime-injected analytics script
        // (matomo.qgis.org). When that host is slow or unreachable the load
        // event never fires and every navigation times out, even though the
        // page content is fully rendered. All assertions here are DOM-based.
        await this.page.goto(this.url, { waitUntil: "domcontentloaded" });
    }

    /** An h2 section heading by (substring) accessible name. */
    sectionHeading(name: string): Locator {
        return this.page.getByRole("heading", { level: 2, name });
    }

    /**
     * Origin of the site under test, derived at runtime from the current page
     * URL (never hardcode 127.0.0.1), so tests also work against staging.
     */
    get origin(): string {
        return new URL(this.page.url()).origin;
    }
}
