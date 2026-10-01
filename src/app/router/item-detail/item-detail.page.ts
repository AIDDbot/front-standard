import { escapeHtml } from "../../core/escape-html.ts";
import "../../shared/components/page-header.component.ts";

export const tagName = "ab-item-detail-page";

class ItemDetailPage extends HTMLElement {
  public connectedCallback(): void {
    this.#render();
  }

  #render(): void {
    const id = this.getAttribute("item-id") ?? "unknown";
    const safeId = escapeHtml(id);
    this.innerHTML = `
      <ab-page-header heading="Item #${safeId}"></ab-page-header>
      <p>Details for item <mark data-testid="item-id">${safeId}</mark> — extracted from the URL.</p>
      <nav aria-label="Back navigation">
        <a href="/">← Back home</a>
      </nav>`;
  }
}

customElements.define(tagName, ItemDetailPage);
