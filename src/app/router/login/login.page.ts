import "../../shared/components/page-header.component.js";
import { goTo } from "../../shared/navigate.js";
import { login } from "../../shared/repositories/auth.repository.js";
import { authStore } from "../../shared/store/auth.store.js";
import "./login-form.component.js";
import { type LoginFormFields, loginSubmitEvent } from "./login.types.js";

export const tagName = "ab-login-page";

class LoginPage extends HTMLElement {
  public connectedCallback(): void {
    const registered = new URLSearchParams(location.search).get("registered") === "1";
    this.innerHTML = `
      <ab-page-header heading="Log in" subtitle="Access your account."></ab-page-header>
      ${registered ? `<p role="status" data-testid="register-confirmation">Registration successful. Please log in.</p>` : ""}
      <ab-login-form></ab-login-form>
      <p role="alert" data-testid="login-error"></p>`;

    this.addEventListener(loginSubmitEvent, (event: Readonly<Event>) => {
      this.#sendLogin((event as CustomEvent<LoginFormFields>).detail);
    });
  }

  #sendLogin(request: Readonly<LoginFormFields>): void {
    const form = this.querySelector("ab-login-form");
    const errorEl = this.querySelector('[data-testid="login-error"]');
    if (!form || !errorEl) return;
    errorEl.textContent = "";
    form.setAttribute("busy", "");
    login(request)
      .then((session) => {
        authStore.set(session);
        goTo("/");
      })
      .catch((error: unknown) => {
        errorEl.textContent = error instanceof Error ? error.message : "Login failed.";
      })
      .finally(() => {
        form.removeAttribute("busy");
      });
  }
}

customElements.define(tagName, LoginPage);
