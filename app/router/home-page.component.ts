import "../shared/components/page-header.component.js";

export const tagName = "ab-home-page";

class HomePage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <ab-page-header heading="AstroBookings"></ab-page-header>
      <p>Hello, world!</p>`;
  }
}

customElements.define(tagName, HomePage);
