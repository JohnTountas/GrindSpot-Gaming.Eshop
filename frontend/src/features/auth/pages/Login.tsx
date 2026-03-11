/**
 * Premium login experience aligned with the gaming storefront visual language.
 */
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BRAND_NAME, BRAND_TAGLINE } from "@/shared/brand/identity";
import { showSuccessMessage } from "@/shared/ui/toast";
import { useLogin } from "../hooks/useLogin";
import { getUserDisplayName } from "../utils/getUserDisplayName";
import { persistSession } from "../utils/persistSession";

// Handles authentication form state, login API calls, and post-login navigation.
function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const loginMutation = useLogin({
    onSuccess: (response) => {
      persistSession(response);
      showSuccessMessage({
        title: "Login successful",
        message: `Welcome back, ${getUserDisplayName(response.user)}!`,
        tone: "success",
      });
      navigate("/");
    },
    onError: (message) => {
      setErrorMessage(message);
    },
  });

  // Submits login credentials, persists session tokens, and routes on success.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    loginMutation.mutate({ email, password });
  }

  return (
    <section className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-12">
      <article className="surface-card relative overflow-hidden p-6 lg:col-span-5">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-primary-800/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 bottom-[-5rem] h-56 w-56 rounded-full bg-accent-700/20 blur-3xl"
        />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-700">
            Member Access
          </p>
          <h1 className="mt-2 font-sans text-4xl font-semibold tracking-[0.04em] text-primary-900">
            {BRAND_NAME}
          </h1>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
            {BRAND_TAGLINE}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-primary-600">
            Sign in to unlock wishlist sync, comparison tools, and streamlined checkout.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary-600">
            <p className="rounded-full border border-primary-300/70 bg-primary-100/72 px-3 py-1">
              Secure JWT sessions
            </p>
            <p className="rounded-full border border-primary-300/70 bg-primary-100/72 px-3 py-1">
              Encrypted auth flow
            </p>
          </div>
        </div>
      </article>

      <article className="surface-card p-6 lg:col-span-7">
        <h2 className="text-2xl font-semibold text-primary-900">Sign in</h2>
        <p className="mt-1 text-sm text-primary-600">
          Continue your competitive storefront session.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block text-sm font-semibold text-primary-700">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2.5 text-sm text-primary-900 placeholder:text-primary-600 focus:border-accent-700 focus:outline-none"
            />
          </label>

          <label className="block text-sm font-semibold text-primary-700">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-primary-300/70 bg-primary-100/72 px-3 py-2.5 text-sm text-primary-900 placeholder:text-primary-600 focus:border-accent-700 focus:outline-none"
            />
          </label>

          {errorMessage && (
            <p className="rounded-xl border border-red-300/70 bg-red-900/20 p-3 text-sm font-semibold text-red-100">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="inline-flex w-full items-center justify-center rounded-xl bg-primary-800 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-white shadow-neon hover:bg-primary-500 disabled:opacity-60"
          >
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-sm text-primary-600">
          You don't have an account yet?&nbsp;
          <Link to="/register" className="font-semibold text-accent-700 hover:text-accent-600">
            Register
          </Link>
        </p>
      </article>
    </section>
  );
}

export default Login;

