import { useState } from "react";
import { useSignIn } from "@clerk/react";
import { useNavigate } from "react-router";
import { AuthLayout } from "@/modules/landing/auth/components/authLayout";
import { AuthField } from "@/modules/landing/auth/components/authField";
import { LoadingModal } from "@/common/components/loadingModal";
import type {
  LoginRequest,
  VerifyEmailCodeRequest,
} from "@/modules/landing/auth/contracts/landing.request.contracts";
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
 * Sign-in, in up to two steps:
 *   1. email and password. Clerk checks them; this page never sees or stores them
 *      beyond the form.
 *   2. a code, only on a browser Clerk hasn't seen for this account. The password
 *      was right, but Clerk (its "Client Trust" protection) wants proof that the
 *      person also controls the email address before it trusts the new browser, so
 *      it emails a code. A stolen password alone is then not enough to get in.
 *
 * Once Clerk is satisfied it starts a session. App then swaps the signed-out
 * routes for the signed-in ones, which unmounts this page, so there is no
 * confirmation screen: the person goes straight to the workspace switcher (the
 * signed-in "/") to pick the company or personal workspace they want to work in.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useSignIn();
  const [form, setForm] = useState<LoginRequest>({ email: "", password: "" });
  const [verification, setVerification] = useState<VerifyEmailCodeRequest>({
    code: "",
  });
  const [awaitingCode, setAwaitingCode] = useState<boolean>(false);
  const [loginFailed, setLoginFailed] = useState<boolean>(false);
  const [codeFailed, setCodeFailed] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  function updateField(field: keyof LoginRequest, value: string) {
    setForm((prev:any) => ({ ...prev, [field]: value }));
  }

  // The session is ready: forget any workspace saved by a previous person on this
  // browser, start the session, and go to the workspace switcher.
  async function startSession() {
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
  }

  // Step 1: check the email and password
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

      // Password accepted, but this browser is new to the account: Clerk wants an
      // emailed code before it will trust it. Send the code and ask for it.
      if (signIn.status === "needs_client_trust") {
        const { error: sendError } = await signIn.mfa.sendEmailCode();
        if (sendError) {
          setLoginFailed(true);
          return;
        }
        setAwaitingCode(true);
        return;
      }

      // Anything else unfinished (for example a second factor Quanta doesn't
      // support yet) is treated as a failed sign-in.
      if (signIn.status !== "complete") {
        setLoginFailed(true);
        return;
      }

      await startSession();
    } finally {
      setIsSubmitting(false);
    }
  }

  // Step 2: check the emailed code
  async function handleVerifyCode() {
    setCodeFailed(false);
    setIsSubmitting(true);

    try {
      const { error } = await signIn.mfa.verifyEmailCode({
        code: verification.code.trim(),
      });
      if (error || signIn.status !== "complete") {
        setCodeFailed(true);
        return;
      }

      await startSession();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function sendNewCode() {
    setCodeFailed(false);
    setVerification({ code: "" });
    await signIn.mfa.sendEmailCode();
  }

  function backToPassword() {
    setAwaitingCode(false);
    setCodeFailed(false);
    setVerification({ code: "" });
  }

  return (
    <>
      <AuthLayout intro={<LoginIntro />}>
        {!awaitingCode ? (
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
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyCode();
            }}
            className="flex flex-col gap-3.5"
          >
            <div className="flex flex-col gap-0.5 border-b pb-2">
              <h2 className="font-display text-base font-semibold text-foreground">
                Check your email
              </h2>
              <p className="font-mono text-xs text-muted-foreground">
                This browser is new to your account. Enter the code we sent to{" "}
                {form.email.trim()}.
              </p>
            </div>

            {codeFailed ? (
              <p className="font-mono text-xs text-destructive">
                That code didn't work. Check it and try again.
              </p>
            ) : null}

            <AuthField
              label="Verification code"
              title="login-verification-code"
              autoComplete="one-time-code"
              value={verification.code}
              onChange={(value) => setVerification({ code: value })}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 w-full rounded-md bg-primary px-4 py-2 font-mono text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
            >
              {isSubmitting ? "Verifying..." : "Verify and log in"}
            </button>

            <p className="flex justify-between font-mono text-xs text-muted-foreground">
              <button
                type="button"
                onClick={sendNewCode}
                className="font-medium text-foreground underline cursor-pointer"
              >
                Send a new code
              </button>
              <button
                type="button"
                onClick={backToPassword}
                className="font-medium text-foreground underline cursor-pointer"
              >
                Back
              </button>
            </p>
          </form>
        )}
      </AuthLayout>

      <LoadingModal
        show={isSubmitting}
        message={awaitingCode ? "Verifying your code..." : "Logging in..."}
      />
    </>
  );
}