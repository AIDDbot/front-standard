import { escapeHtml } from "../../core/escape-html.js";
import "../../shared/components/page-header.component.js";

export const tagName = "ab-not-found-page";

class NotFoundPage extends HTMLElement {
  public connectedCallback(): void {
    this.innerHTML = `
      <ab-page-header heading="Page not found"></ab-page-header>
      <p>The route <code data-testid="missing-path">${escapeHtml(location.pathname)}</code> does not match any page.</p>
      <nav aria-label="Back navigation">
        <a href="/">← Back home</a>
      </nav>`;
  }
}

customElements.define(tagName, NotFoundPage);
