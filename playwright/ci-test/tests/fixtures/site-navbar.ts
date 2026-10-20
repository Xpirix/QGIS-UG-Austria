import type { Page, Locator } from "@playwright/test";

/**
 * Page object for the German site navbar rendered by the Hugo theme inside
 * div#context (layouts/partials/contextmenu.html).
 *
 * NOTE: this navbar ALSO exposes role=navigation with the accessible name
 * "main navigation" — the same name as the <qg-top-nav> shadow-DOM nav.
 * Locators must always be scoped to "#context nav" (or to "qg-top-nav",
 * see fixtures/header.ts) to avoid strict-mode violations.
 */
export class SiteNavbar {
    public readonly root: Locator;
    public readonly searchbox: Locator;

    /**
     * The eight German menu entries as [accessible name, site path] pairs.
     * The rendered hrefs are absolute (baseURL origin + path).
     */
    public readonly menu: [string, string][] = [
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
        this.root = this.page.locator("#context nav");
        // A second search input exists in the DOM but is display:none on the
        // desktop viewport, so getByRole only matches the visible one; the
        // #context-nav scope keeps it strict-safe regardless.
        this.searchbox = this.root.getByRole("searchbox", { name: "Search" });
    }

    menuLink(name: string): Locator {
        return this.root.getByRole("link", { name, exact: true });
    }

    /** Origin of the site under test, derived at runtime (never hardcoded). */
    get origin(): string {
        return new URL(this.page.url()).origin;
    }
}
