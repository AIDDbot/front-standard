import { escapeHtml } from "../../core/escape-html.ts";
import "../../shared/components/page-header.component.ts";

export const tagName = "ab-not-found-page";

class NotFoundPage extends HTMLElement {
  public connectedCallback(): void {
    this.#render();
  }

  #render(): void {
    this.innerHTML = `
      <ab-page-header heading="Page not found"></ab-page-header>
      <p>The route <code data-testid="missing-path">${escapeHtml(location.pathname)}</code> does not match any page.</p>
      <nav aria-label="Back navigation">
        <a href="/">← Back home</a>
      </nav>`;
  }
}

customElements.define(tagName, NotFoundPage);
