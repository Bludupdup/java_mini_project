import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { NAME_MAX, PASSWORD_MIN, validateRegistration } from "../auth/authRules";
import { AuthField, AuthLayout, FormAlert } from "../components/AuthForm";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { STORAGE_KEY } from "../learning/learningStore";

// Progress saved before accounts existed? It moves into the new account.
function hasGuestProgress() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

function RegisterPage() {
  useDocumentTitle("Create account");
  const { register } = useAuth();
  const location = useLocation();
  const [values, setValues] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [guestProgress] = useState(hasGuestProgress);

  const update = (field) => (event) => {
    setValues({ ...values, [field]: event.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  };

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const fieldErrors = validateRegistration(values);

    if (!fieldErrors.password && values.confirm !== values.password) {
      fieldErrors.confirm = "The passwords don't match.";
    }

    setErrors(fieldErrors);
    setAlert(null);

    const firstInvalid = Object.keys(fieldErrors)[0];
    if (firstInvalid) {
      form.elements.namedItem(firstInvalid)?.focus();
      return;
    }

    setSubmitting(true);

    try {
      const { name, email, password } = values;
      await register({ name, email, password });
    } catch (error) {
      setErrors(error.fields ?? {});
      setAlert(error.message);
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle={
        guestProgress
          ? "Your progress so far will move into your new account."
          : "Save your progress, streaks and achievements."
      }
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" state={location.state}>
            Log in
          </Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormAlert>{alert}</FormAlert>

        <AuthField
          label="Name"
          name="name"
          autoComplete="name"
          maxLength={NAME_MAX}
          autoFocus
          value={values.name}
          onChange={update("name")}
          error={errors.name}
        />
        <AuthField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={update("email")}
          error={errors.email}
        />
        <AuthField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={update("password")}
          error={errors.password}
          hint={`At least ${PASSWORD_MIN} characters. A short sentence is easy to remember.`}
        />
        <AuthField
          label="Confirm password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          value={values.confirm}
          onChange={update("confirm")}
          error={errors.confirm}
        />

        <button type="submit" className="primary-button auth-submit" disabled={submitting}>
          <UserPlus size={17} />
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default RegisterPage;
