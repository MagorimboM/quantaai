import { useState } from "react";
import { useSignIn } from "@clerk/react";
import { useNavigate } from "react-router";
import { AuthLayout } from "@/modules/landing/auth/components/authLayout";
import { AuthField } from "@/modules/landing/auth/components/authField";
import { LoadingModal } from "@/modules/quantityTakeoff/components/loadingModal";
import type { LoginRequest } from "@/modules/landing/auth/contracts/landing.request.contracts";
import { clearActiveScope } from "@/common/storage/activeScope";

// Left column: reminds a returning quantity surveyor what Quanta saves them.
function LoginIntro() {
  return (
    <>
      <p className="mb-2 font-mono text-xs text-muted-foreground">
        WELCOME BACK
      </p>
      <h1
        className="mb-3 font-display font-800 leading-tight text-foreground"
        style={{ fontSize: "clamp(24px, 2.5vw, 32px)", letterSpacing: "-0.01em" }}
      >
        100m² of wall.
        <br />
        Same sand, cement,
        <br />
        rods, every time.
      </h1>
      <p className="mb-6 text-xs leading-relaxed text-muted-foreground sm:text-sm">
        You already know how much sand, cement, 6mm rods and Alcor flashing that
        wall needs. You worked it out once. Quanta remembers it, so you're not
        recalculating the same numbers by hand on every job.
      </p>

      <div className="flex items-center gap-3 rounded-md border bg-secondary px-3.5 py-2.5">
        <span className="font-mono text-base text-primary">⏱</span>
        <p className="font-mono text-xs text-foreground/80">
          Finish the estimate sooner, submit it sooner, and keep what's left of
          the hour for yourself.
        </p>
      </div>
    </>
  );
}

/**
 * Sign-in. Clerk checks the email and password; this page never sees or stores
 * them beyond the form. Once Clerk accepts them it starts a session, and the
 * person goes to the workspace switcher (the signed-in "/") to pick the
 * company or personal workspace they want to work in.
 *
 * Why there is no "success" screen: the moment the session starts, App swaps
 * the whole signed-out route tree for the signed-in one, which unmounts this
 * page. Anything shown here after that would disappear straight away.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useSignIn();
  const [form, setForm] = useState<LoginRequest>({ email: "", password: "" });
  const [loginFailed, setLoginFailed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof LoginRequest, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleLogin() {
    setLoginFailed(false);
    setIsSubmitting(true);

    try {
      const { error } = await signIn.password({
        emailAddress: form.email.trim(),
        password: form.password,
      });

      // One generic failure message on purpose: a different message for "no such
      // email" and "wrong password" would reveal which emails have accounts.
      if (error) {
        setLoginFailed(true);
        return;
      }

      // Anything other than "complete" means Clerk wants another step, such as a
      // second factor, which Quanta doesn't support yet. Treated as a failure.
      if (signIn.status !== "complete") {
        setLoginFailed(true);
        return;
      }

      // A new session never starts inside the previous person's workspace
      clearActiveScope();

      await signIn.finalize({
        navigate: async ({ decorateUrl }) => {
          const url = decorateUrl("/");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            navigate(url);
          }
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <AuthLayout intro={<LoginIntro />}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="flex flex-col gap-3.5"
        >
          <div className="flex flex-col gap-0.5 border-b pb-2">
            <h2 className="font-display text-base font-semibold text-foreground">
              Log in
            </h2>
            <p className="font-mono text-xs text-muted-foreground">
              Welcome back to Quanta
            </p>
          </div>

          {loginFailed ? (
            <p className="font-mono text-xs text-destructive">
              Log in failed. Check your email and password and try again.
            </p>
          ) : null}

          <AuthField
            label="Email"
            title="login-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(value) => updateField("email", value)}
          />
          <AuthField
            label="Password"
            title="login-password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(value) => updateField("password", value)}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 w-full rounded-md bg-primary px-4 py-2 font-mono text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>

          <p className="text-center font-mono text-xs text-muted-foreground">
            New to Quanta?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="font-medium text-foreground underline cursor-pointer"
            >
              Create an account
            </button>
          </p>
        </form>
      </AuthLayout>

      <LoadingModal show={isSubmitting} message="Logging in..." />
    </>
  );
}