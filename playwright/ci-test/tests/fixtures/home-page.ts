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
    public static readonly expectedPhone = "+43 664 4852504";
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
    }

    async goto() {
        await this.page.goto(this.url);
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
