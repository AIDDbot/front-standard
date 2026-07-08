import "../shared/components/page-header.component.js";

export const tagName = "ab-home-page";

const demoItems = [
  { id: "1", name: "Moon flyby" },
  { id: "2", name: "Orbital station week" },
  { id: "3", name: "Mars window seat" },
];

class HomePage extends HTMLElement {
  public connectedCallback() {
    const itemLinks = demoItems
      .map(({ id, name }) => `<li><a href="/items/${id}">${name}</a></li>`)
      .join("");
    this.innerHTML = `
      <ab-page-header heading="AstroBookings"></ab-page-header>
      <p>Hello, world!</p>
      <section>
        <h2>Featured trips</h2>
        <ul>${itemLinks}</ul>
      </section>`;
  }
}

customElements.define(tagName, HomePage);
