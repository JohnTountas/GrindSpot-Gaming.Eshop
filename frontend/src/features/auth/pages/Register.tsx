/**
 * Premium registration page aligned with the storefront identity.
 */
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BRAND_NAME } from "@/shared/brand/identity";
import { showSuccessMessage } from "@/shared/ui/toast";
import { useRegister } from "../hooks/useRegister";
import { getUserDisplayName } from "../utils/getUserDisplayName";
import { persistSession } from "../utils/persistSession";

// Handles account creation form state, API registration, and success routing.
function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const registerMutation = useRegister({
    onSuccess: (response) => {
      persistSession(response);
      showSuccessMessage({
        title: "Registration successful",
        message: `Welcome, ${getUserDisplayName(response.user)}!`,
        tone: "success",
      });
      navigate("/");
    },
    onError: (message) => {
      setErrorMessage(message);
    },
  });

  // Submits registration data, stores session tokens, and routes on success.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    registerMutation.mutate({
      email,
      password,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
    });
  }

  return (
    <section className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-12">
      <article className="surface-card p-6 lg:col-span-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-700">
          Create account
        </p>
        <h1 className="mt-2 font-sans text-4xl font-semibold tracking-[0.04em] text-primary-900">
          Join {BRAND_NAME}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-primary-600">
          Save your wishlist, compare products across sessions, and move through checkout faster.
        </p>
        <div className="mt-5 space-y-2 text-xs text-primary-600">
          <p className="rounded-full border border-primary-300/70 bg-primary-100/72 px-3 py-1 font-semibold uppercase tracking-[0.12em]">
            Instant account activation
          </p>
          <p className="rounded-full border border-primary-300/70 bg-primary-100/72 px-3 py-1 font-semibold uppercase tracking-[0.12em]">
            Server-persisted wishlist and compare
          </p>
          <p className="rounded-full border border-primary-300/70 bg-primary-100/72 px-3 py-1 font-semibold uppercase tracking-[0.12em]">
            Secure encrypted session
          </p>
        </div>
      </article>

      <article className="surface-card p-6 lg:col-span-7">
        <h2 className="text-2xl font-semibold text-primary-900">Register</h2>
        <p className="mt-1 text-sm text-primary-600">
          Create your competitive marketplace profile.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-primary-700">
              First name
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2.5 text-sm text-primary-900 focus:border-accent-700 focus:outline-none"
              />
            </label>

            <label className="block text-sm font-semibold text-primary-700">
              Last name
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2.5 text-sm text-primary-900 focus:border-accent-700 focus:outline-none"
              />
            </label>
          </div>

          <label className="block text-sm font-semibold text-primary-700">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2.5 text-sm text-primary-900 focus:border-accent-700 focus:outline-none"
            />
          </label>

          <label className="block text-sm font-semibold text-primary-700">
            Password
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2.5 text-sm text-primary-900 focus:border-accent-700 focus:outline-none"
            />
          </label>

          {errorMessage && (
            <p className="rounded-xl border border-red-300/70 bg-red-900/20 p-3 text-sm font-semibold text-red-100">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="inline-flex w-full items-center justify-center rounded-xl bg-primary-800 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-white shadow-neon hover:bg-primary-500 disabled:opacity-60"
          >
            {registerMutation.isPending ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-sm text-primary-600">
          Already have an account?&nbsp;
          <Link to="/login" className="font-semibold text-accent-700 hover:text-accent-600">
            Sign in
          </Link>
        </p>
      </article>
    </section>
  );
}

export default Register;

