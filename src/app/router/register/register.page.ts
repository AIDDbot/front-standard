import "../../shared/components/page-header.component.js";
import { goTo } from "../../shared/navigate.js";
import { register } from "../../shared/repositories/auth.repository.js";
import type { RegisterFormFields } from "./register.types.js";

export const tagName = "ab-register-page";

class RegisterPage extends HTMLElement {
  public connectedCallback(): void {
    this.#render();
    this.#bind();
  }

  #render(): void {
    this.innerHTML = `
      <ab-page-header heading="Register" subtitle="Create your account."></ab-page-header>
      <form aria-label="Register">
        <label for="register-email">Email</label>
        <input id="register-email" name="email" type="email" autocomplete="email" required />
        <label for="register-name">Name</label>
        <input id="register-name" name="name" type="text" autocomplete="name" required />
        <label for="register-password">Password</label>
        <input
          id="register-password"
          name="password"
          type="password"
          autocomplete="new-password"
          required
        />
        <button type="submit">Register</button>
      </form>
      <p role="alert" data-testid="register-error"></p>`;

  }

  #bind(): void {
    this.querySelector("form")?.addEventListener("submit", (event: Readonly<Event>) => {
      event.preventDefault();
      this.#submit();
    });
  }

  #readFields(form: Readonly<HTMLFormElement>): RegisterFormFields {
    return {
      email: form.querySelector<HTMLInputElement>('[name="email"]')?.value ?? "",
      name: form.querySelector<HTMLInputElement>('[name="name"]')?.value ?? "",
      password: form.querySelector<HTMLInputElement>('[name="password"]')?.value ?? "",
    };
  }

  #submit(): void {
    const form = this.querySelector("form");
    const errorEl = this.querySelector('[data-testid="register-error"]');
    if (!form || !errorEl) return;
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (!button || button.disabled) return;

    errorEl.textContent = "";
    this.#sendRegister(this.#readFields(form), form, button, errorEl);
  }

  #sendRegister(
    request: Readonly<RegisterFormFields>,
    form: HTMLFormElement,
    button: HTMLButtonElement,
    errorEl: Element,
  ): void {
    button.disabled = true;
    form.setAttribute("aria-busy", "true");
    register(request)
      .then(() => {
        goTo("/login?registered=1");
      })
      .catch((error: unknown) => {
        errorEl.textContent = error instanceof Error ? error.message : "Registration failed.";
      })
      .finally(() => {
        button.disabled = false;
        form.setAttribute("aria-busy", "false");
      });
  }
}

customElements.define(tagName, RegisterPage);
