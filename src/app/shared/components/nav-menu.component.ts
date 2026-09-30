import { escapeHtml } from "../../core/escape-html.js";
import type { MenuLink } from "../../core/create-router.js";
import { appTitle } from "../global.js";
import { authStore } from "../store/auth.store.js";

export const tagName = "ab-nav-menu";

const getInitialTheme = (): "light" | "dark" => {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

document.documentElement.dataset["theme"] = getInitialTheme();

/**
 * App nav bar: <ab-nav-menu current-path="/about">, with `links` set as a property.
 * Override the title with the `title` attribute or change `displayName` in package.json.
 */
class NavMenu extends HTMLElement {
  public static readonly observedAttributes = ["current-path"];

  #links: readonly MenuLink[] = [];

  public get links(): readonly MenuLink[] {
    return this.#links;
  }

  public set links(value: readonly MenuLink[]) {
    this.#links = value;
    this.#render();
  }

  public attributeChangedCallback(): void {
    this.#render();
  }

  #linkItem({ href, label }: Readonly<MenuLink>): string {
    const current = this.getAttribute("current-path") === href ? ' aria-current="page"' : "";
    return `<li><a href="${escapeHtml(href)}"${current}>${escapeHtml(label)}</a></li>`;
  }

  #setupThemeToggle(): void {
    const toggle = this.querySelector<HTMLButtonElement>("#theme-toggle");
    if (!toggle) return;
    toggle.setAttribute(
      "aria-pressed",
      String(document.documentElement.dataset["theme"] === "dark"),
    );
    toggle.addEventListener("click", () => {
      const current = document.documentElement.dataset["theme"];
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.dataset["theme"] = next;
      localStorage.setItem("theme", next);
      toggle.setAttribute("aria-pressed", String(next === "dark"));
    });
  }

  #renderMenuItems(): string {
    return this.#links.map((link) => this.#linkItem(link)).join("\n            ");
  }

  #renderAuthLinks(): string {
    const session = authStore.get();
    if (session) {
      return `<li data-testid="current-user">${escapeHtml(session.user.name)} (${escapeHtml(session.user.role)})</li>`;
    }
    return `${this.#linkItem({ href: "/register", label: "Register" })}
            ${this.#linkItem({ href: "/login", label: "Login" })}`;
  }

  #render(): void {
    const title = this.getAttribute("title") ?? appTitle;
    const menuItems = this.#renderMenuItems();
    const authLinks = this.#renderAuthLinks();
    this.innerHTML = `
      <header class="container">
        <nav aria-label="Main">
          <ul>
            <li><a href="/"><strong class="logo color">${escapeHtml(title)}</strong></a></li>
          </ul>
          <ul>
            ${menuItems}
            ${authLinks}
            <li>
              <button id="theme-toggle" type="button" aria-label="Toggle theme">
                <span class="light" aria-hidden="true">☼</span>
                <span class="dark" aria-hidden="true">☽</span>
              </button>
            </li>
          </ul>
        </nav>
      </header>`;
    this.#setupThemeToggle();
  }

  public connectedCallback(): void {
    this.#render();
    authStore.subscribe(() => {
      this.#render();
    });
  }
}

customElements.define(tagName, NavMenu);

declare global {
  interface HTMLElementTagNameMap {
    [tagName]: NavMenu;
  }
}
