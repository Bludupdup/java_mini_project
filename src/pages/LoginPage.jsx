import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { validateLogin } from "../auth/authRules";
import { AuthField, AuthLayout, FormAlert } from "../components/AuthForm";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

function LoginPage() {
  useDocumentTitle("Log in");
  const { logIn } = useAuth();
  const location = useLocation();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Typing in a field clears that field's error.
  const update = (field) => (event) => {
    setValues({ ...values, [field]: event.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  };

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const fieldErrors = validateLogin(values);

    setErrors(fieldErrors);
    setAlert(null);

    const firstInvalid = Object.keys(fieldErrors)[0];
    if (firstInvalid) {
      form.elements.namedItem(firstInvalid)?.focus();
      return;
    }

    setSubmitting(true);

    try {
      // On success the login route sends us on to the app by itself.
      await logIn(values);
    } catch (error) {
      setErrors(error.fields ?? {});
      setAlert(error.message);
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue where you left off."
      footer={
        <>
          New to DSA Universe?{" "}
          <Link to="/register" state={location.state}>
            Create an account
          </Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormAlert>{alert}</FormAlert>

        <AuthField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          value={values.email}
          onChange={update("email")}
          error={errors.email}
        />
        <AuthField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={update("password")}
          error={errors.password}
        />

        <button type="submit" className="primary-button auth-submit" disabled={submitting}>
          <LogIn size={17} />
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
