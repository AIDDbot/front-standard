export const tagName = "ab-nav-menu";

function getInitialTheme(): "light" | "dark" {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

document.documentElement.setAttribute("data-theme", getInitialTheme());

class NavMenu extends HTMLElement {
  public connectedCallback() {
    this.innerHTML = `
      <header class="container">
        <nav>
          <ul>
            <li><a href="/"><strong class="logo color">AstroBookings</strong></a></li>
          </ul>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li>
              <span id="theme-toggle" aria-label="Toggle theme">
                <span class="light">☼</span>
                <span class="dark">☽</span>
              </span>
            </li>
          </ul>
        </nav>
      </header>`;

    this.querySelector("#theme-toggle")?.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    });
  }
}

customElements.define(tagName, NavMenu);
