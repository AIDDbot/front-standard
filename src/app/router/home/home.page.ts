import { escapeHtml } from "../../core/escape-html.ts";
import "../../shared/components/page-header.component.ts";
import { appTitle } from "../../shared/global.ts";
import type { DemoItem } from "./home.types.ts";

export const tagName = "ab-home-page";

const demoItems: readonly DemoItem[] = [
  { id: "1", name: "A web app with no more than standards" },
  { id: "2", name: "A backend API based on Express" },
  { id: "3", name: "A Node.js CLI" },
  { id: "4", name: "End to end tested with Playwright" },
];

class HomePage extends HTMLElement {
  public connectedCallback(): void {
    this.#render();
  }

  #render(): void {
    const itemLinks = demoItems
      .map(
        ({ id, name }: Readonly<DemoItem>) =>
          `<li><a href="/items/${escapeHtml(id)}">${escapeHtml(name)}</a></li>`,
      )
      .join("");
    this.innerHTML = `
      <ab-page-header heading="${escapeHtml(appTitle)}" subtitle="Build software you can trust with AIDDbot"></ab-page-header>
      <section aria-labelledby="archetypes-heading">
        <h2 id="archetypes-heading">Archetypes</h2>
        <ul aria-labelledby="archetypes-heading">${itemLinks}</ul>
      </section>
      <p>You can safely remove this content and start coding your dreams.</p>
      `;
  }
}

customElements.define(tagName, HomePage);
