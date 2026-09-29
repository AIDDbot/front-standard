export interface LoginFormFields {
  email: string;
  password: string;
}

/** Event dispatched by `<ab-login-form>` with the entered credentials. */
export const loginSubmitEvent = "login-submit";
