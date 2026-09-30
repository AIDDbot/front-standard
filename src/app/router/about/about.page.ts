import { escapeHtml } from "../../core/escape-html.js";
import "../../shared/components/page-header.component.js";
import { type AppAuthor, appAuthor } from "../../shared/global.js";
import type { HealthStatus } from "./about.types.js";
import { getHealth } from "./health.repository.js";
import { healthStore } from "./health.store.js";

export const tagName = "ab-about-page";

const isWebUrl = (value: string): boolean => /^https?:\/\//iu.test(value);

const renderAuthor = (author: Readonly<AppAuthor> | null): string => {
  if (!author) return "";
  const name = escapeHtml(author.name);
  const nameHtml =
    author.url && isWebUrl(author.url)
      ? `<a href="${escapeHtml(author.url)}" rel="noopener" target="_blank">${name}</a>`
      : name;
  return `<p data-testid="author">Author: ${nameHtml}</p>`;
};

class AboutPage extends HTMLElement {
  public connectedCallback(): void {
    this.#render();
    this.#load();
  }

  #render(): void {
    this.innerHTML = `
      <ab-page-header heading="About" subtitle="Just a demo built on web standards only."></ab-page-header>
      <p>Routing via the Navigation API, components as custom elements loaded on demand.</p>
      ${renderAuthor(appAuthor)}
      <section aria-labelledby="health-heading">
        <h2 id="health-heading">Server health</h2>
        <p role="status" aria-live="polite" aria-busy="true" data-testid="health-status">Loading health…</p>
      </section>`;

  }

  #load(): void {
    const cached = healthStore.get();
    if (cached) {
      this.#renderHealth(cached);
    }
    // #loadHealth handles its own errors internally; nothing to await here.
    this.#loadHealth().catch(() => {});
  }

  async #loadHealth(): Promise<void> {
    try {
      const health = await getHealth();
      healthStore.set(health);
      this.#renderHealth(health);
    } catch {
      this.#setStatus("Health unavailable.");
    }
  }

  #renderHealth({ uptime, runs }: Readonly<HealthStatus>): void {
    this.#setStatus(`Server up for ${Math.floor(uptime)}s — ${runs} run(s) recorded.`);
  }

  #setStatus(text: string): void {
    const statusEl = this.querySelector<HTMLElement>('[data-testid="health-status"]');
    if (statusEl) {
      statusEl.textContent = text;
      statusEl.setAttribute("aria-busy", "false");
    }
  }
}

customElements.define(tagName, AboutPage);
