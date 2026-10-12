/**
 * Account rules shared by the forms (instant feedback) and the server (the
 * real check). Both import this file, so they can never disagree.
 * Each validate function returns { field: "message" }; empty means valid.
 */

export const NAME_MAX = 40;
export const EMAIL_MAX = 254;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeEmail = (email) => email.trim().toLowerCase();

const asText = (value) => (typeof value === "string" ? value : "");

function checkEmail(email) {
  const value = normalizeEmail(asText(email));

  if (!value) return "Enter your email address.";
  if (value.length > EMAIL_MAX || !EMAIL_PATTERN.test(value)) {
    return "Enter a valid email address, like sam@example.com.";
  }
  return null;
}

export function validateLogin({ email, password }) {
  const errors = {};
  const emailError = checkEmail(email);

  if (emailError) errors.email = emailError;
  if (!asText(password)) errors.password = "Enter your password.";

  return errors;
}

export function validateRegistration({ name, email, password }) {
  const errors = {};
  const cleanName = asText(name).trim();
  const cleanPassword = asText(password);
  const emailError = checkEmail(email);

  if (!cleanName) errors.name = "Enter your name.";
  else if (cleanName.length > NAME_MAX) errors.name = `Use at most ${NAME_MAX} characters.`;

  if (emailError) errors.email = emailError;

  if (cleanPassword.length < PASSWORD_MIN) {
    errors.password = `Use at least ${PASSWORD_MIN} characters.`;
  } else if (cleanPassword.length > PASSWORD_MAX) {
    errors.password = `Use at most ${PASSWORD_MAX} characters.`;
  } else if (cleanPassword.toLowerCase() === normalizeEmail(asText(email))) {
    errors.password = "Don't use your email address as your password.";
  }

  return errors;
}
