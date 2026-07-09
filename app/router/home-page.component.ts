import "../shared/components/page-header.component.js";

export const tagName = "ab-home-page";

const demoItems = [
  { id: "1", name: "Prompts" },
  { id: "2", name: "Context" },
  { id: "3", name: "Harness" },
  { id: "4", name: "Loops" },
];

class HomePage extends HTMLElement {
  public connectedCallback(): void {
    const itemLinks = demoItems
      .map(({ id, name }) => `<li><a href="/items/${id}">${name}</a></li>`)
      .join("");
    this.innerHTML = `
      <ab-page-header heading="Demo Frontend Standard App"></ab-page-header>
      <p>Hello, world!</p>
      <section>
        <h2>Featured trips</h2>
        <ul>${itemLinks}</ul>
      </section>`;
  }
}

customElements.define(tagName, HomePage);
