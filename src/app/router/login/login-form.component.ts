import { type LoginFormFields, loginSubmitEvent } from "./login.types.js";

export const tagName = "ab-login-form";

/**
 * Presentational login form: <ab-login-form busy>.
 * Emits `login-submit` (detail: LoginFormFields); knows nothing about the API.
 */
class LoginForm extends HTMLElement {
  public static readonly observedAttributes = ["busy"];

  public connectedCallback(): void {
    this.innerHTML = `
      <form aria-label="Log in">
        <label for="login-email">Email</label>
        <input id="login-email" name="email" type="email" autocomplete="email" required />
        <label for="login-password">Password</label>
        <input
          id="login-password"
          name="password"
          type="password"
          autocomplete="current-password"
          required
        />
        <button type="submit">Log in</button>
      </form>`;
    this.querySelector("form")?.addEventListener("submit", (event: Readonly<Event>) => {
      event.preventDefault();
      this.#submit();
    });
    this.#renderBusy();
  }

  public attributeChangedCallback(): void {
    this.#renderBusy();
  }

  #renderBusy(): void {
    const busy = this.hasAttribute("busy");
    this.querySelector("form")?.setAttribute("aria-busy", String(busy));
    const button = this.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (button) button.disabled = busy;
  }

  #submit(): void {
    const form = this.querySelector("form");
    if (!form || this.hasAttribute("busy")) return;
    const detail: LoginFormFields = {
      email: form.querySelector<HTMLInputElement>('[name="email"]')?.value ?? "",
      password: form.querySelector<HTMLInputElement>('[name="password"]')?.value ?? "",
    };
    this.dispatchEvent(new CustomEvent(loginSubmitEvent, { bubbles: true, detail }));
  }
}

customElements.define(tagName, LoginForm);
