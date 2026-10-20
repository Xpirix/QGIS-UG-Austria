import { test as base } from "@playwright/test";
import { Header } from "./header";
import { HomePage } from "./home-page";
import { Footer } from "./footer";
import { SiteNavbar } from "./site-navbar";

/**
 * Shared fixture extension (page-object pattern): every spec gets typed
 * `header`, `homePage`, `navbar` and `footer` fixtures built around the
 * same `page`.
 */
export type Fixtures = {
    header: Header;
    homePage: HomePage;
    navbar: SiteNavbar;
    footer: Footer;
};

export const test = base.extend<Fixtures>({
    header: async ({ page }, use) => {
        await use(new Header(page));
    },
    homePage: async ({ page }, use) => {
        await use(new HomePage(page));
    },
    navbar: async ({ page }, use) => {
        await use(new SiteNavbar(page));
    },
    footer: async ({ page }, use) => {
        await use(new Footer(page));
    },
});

export { expect } from "@playwright/test";
